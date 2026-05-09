
CREATE TABLE public.relatorio_clinico_mensal (
    id_relatorio SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(150),
    nome_animal VARCHAR(150),
    mes INT,
    ano INT,
    lista_prescricoes TEXT,
    lista_exames TEXT
);



CALL public.gerar_cursor_relatorio_mensal();


SELECT * 
FROM public.relatorio_clinico_mensal;



-- Esta funcional no entanto tem um problema, ao usar o loop para um exemplo de 10mil consultas vou ter problemas de otimização, no entanto
-- em contexto do nosso projeto está funcional e adequeado digo eu uma versao otimizada seria contornar o loop
CREATE OR REPLACE PROCEDURE public.gerar_cursor_relatorio_mensal()
LANGUAGE plpgsql
AS $$
DECLARE -- cursor declarado
    v_cursor CURSOR FOR 
        SELECT 
            c.nome AS nome_cliente, 
            a.nome AS nome_animal, 
            EXTRACT(MONTH FROM cons.data_consulta) AS mes, -- mes e ano de cada consulta
            EXTRACT(YEAR FROM cons.data_consulta) AS ano,
            cons.id_consulta
        FROM public.consulta cons
        INNER JOIN public.animal a ON cons.id_animal = a.id_animal
        INNER JOIN public.cliente c ON a.id_cliente = c.id_cliente;
        
    -- ve onde ta o cursor atualmente
    v_linha RECORD;
    
    v_string_prescricoes TEXT;
    v_string_exames TEXT;
BEGIN
    -- Limpa a tabela de destino
    TRUNCATE TABLE public.relatorio_clinico_mensal RESTART IDENTITY;

    -- Abrir o cursor declarado
    OPEN v_cursor;
    
    -- Inicia o loop de procurar 
    LOOP
        -- Ler a próxima linha e carregar os dados para a v_linha
        FETCH v_cursor INTO v_linha;
        
        -- Sair sempre que nao há nada
        EXIT WHEN NOT FOUND;
        
        -- Construir a string de Prescrições medicamentos + quantidade
        SELECT string_agg(m.nome || ' (Qtd: ' || p.quantidade || ')', ', ') --agrega todas
        INTO v_string_prescricoes
        FROM public.prescreve p
        INNER JOIN public.medicamento m ON p.id_medicamento = m.id_medicamento
        WHERE p.id_consulta = v_linha.id_consulta; -- no fundo coloca naas variaveis a nossa String com todos os dados

        -- mesma função da anterior só que para os exames
        SELECT string_agg(e.nome || ' - ' || o.descricao, ', ')
        INTO v_string_exames
        FROM public.orienta o
        INNER JOIN public.exame e ON o.id_exame = e.id_exame
        WHERE o.id_consulta = v_linha.id_consulta;
        
        -- Guarda tudo na tabela
        -- usamos coalesce para evitar dados nulos zeros e afins, passando a "sem prescrições" " sem exames"
        INSERT INTO public.relatorio_clinico_mensal 
            (nome_cliente, nome_animal, mes, ano, lista_prescricoes, lista_exames)
        VALUES (
            v_linha.nome_cliente, 
            v_linha.nome_animal, 
            v_linha.mes, 
            v_linha.ano, 
            COALESCE(v_string_prescricoes, 'Sem prescrições'),
            COALESCE(v_string_exames, 'Sem exames')
        );
        
    END LOOP;
    
    CLOSE v_cursor;
END;
$$;

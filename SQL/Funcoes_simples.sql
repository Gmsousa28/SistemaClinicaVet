-- UPDATE TABELA ANIMAL
-- UPDATE TABELA CLIENTE TESTADA
-- UPDATE TABELA FUNCIONARIO TESTADA
-- UPDATE TABELA SERVICO TESTADA



--- Funções mais simples de atualizar, eliminar etc

-- UPDATE TABELA ANIMAL
CREATE OR REPLACE FUNCTION public.atualizar_animal_geral(
    p_id_animal INT,
    p_id_cliente INT,
    p_nome VARCHAR DEFAULT NULL,
    p_especie VARCHAR DEFAULT NULL,
    p_raca VARCHAR DEFAULT NULL,
    p_sexo sexo DEFAULT NULL,
    p_data_nascimento DATE DEFAULT NULL,
    p_estado estado DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- O UPDATE com a dupla verificação de segurança ID do animal e ID do dono
    -- O COALESCE garante que se o site enviar NULL, mantém o valor que já lá estava
    UPDATE public.animal
    SET 
        nome = COALESCE(p_nome, nome),
        especie = COALESCE(p_especie, especie),
        raca = COALESCE(p_raca, raca),
        sexo = COALESCE(p_sexo, sexo),
        data_nascimento = COALESCE(p_data_nascimento, data_nascimento),
        estado = COALESCE(p_estado, estado)
    WHERE id_animal = p_id_animal 
      AND id_cliente = p_id_cliente;

    -- O comando FOUND do PostgreSQL verifica se a operação afetou alguma linha.
    -- Se afetou, retorna TRUE (sucesso). Se não afetou (ex: animal não é daquele cliente), retorna FALSE.
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;




-- UPDATE TABELA CLIENTE TESTADA
-- especial cuidado com o nif pois não pode ser trocado com 2 tretas
CREATE OR REPLACE FUNCTION public.atualizar_cliente_geral(
    p_id_cliente INT,
    p_nome VARCHAR DEFAULT NULL,
    p_morada VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_nif BIGINT DEFAULT NULL,      -- Permitimos o nif para correções
    p_contacto BIGINT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- O COALESCE mantém o valor antigo se o novo for NULL (não enviado)
    UPDATE public.cliente
    SET 
        nome = COALESCE(p_nome, nome),
        morada = COALESCE(p_morada, morada),
        email = COALESCE(p_email, email),
        nif = COALESCE(p_nif, nif),
        contacto = COALESCE(p_contacto, contacto)
    WHERE id_cliente = p_id_cliente;

    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        -- Se o novo NIF ou Email já existirem noutro cliente, a função trava aqui
        RAISE EXCEPTION 'Erro: O NIF ou Email introduzido já pertence a outro cliente.';
    WHEN check_violation THEN
        -- Se o NIF/Contacto não tiver 9 dígitos
        RAISE EXCEPTION 'Erro: O NIF ou Contacto deve ter exatamente 9 dígitos.';
END;
$$;




-- UPDATE TABELA FUNCIONARIO TESTADA
CREATE OR REPLACE FUNCTION public.atualizar_funcionario_geral(
    p_id_funcionario INT,
    p_nome VARCHAR DEFAULT NULL,
    p_morada VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_nif BIGINT DEFAULT NULL,
    p_contacto BIGINT DEFAULT NULL,
    p_cargo VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- O COALESCE mantém o valor antigo se o site enviar NULL num dos campos
    UPDATE public.funcionario
    SET 
        nome = COALESCE(p_nome, nome),
        morada = COALESCE(p_morada, morada),
        email = COALESCE(p_email, email),
        nif = COALESCE(p_nif, nif),
        contacto = COALESCE(p_contacto, contacto),
        cargo = COALESCE(p_cargo, cargo)
    WHERE id_funcionario = p_id_funcionario;

    -- Confirma se encontrou o funcionário e atualizou
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        -- Proteção contra o nif repetido
        RAISE EXCEPTION 'Erro: O NIF ou Contacto introduzido já pertence a outro funcionário.';
    WHEN check_violation THEN
        -- Proteção dos 9 dígitos
        RAISE EXCEPTION 'Erro: O NIF ou Contacto deve ter exatamente 9 dígitos.';
END;
$$;



-- UPDATE TABELA VETERINARIO  TESTADA
CREATE OR REPLACE FUNCTION public.atualizar_veterinario_geral(
    p_id_veterinario INT,
    p_nome VARCHAR DEFAULT NULL,
    p_morada VARCHAR DEFAULT NULL,
    p_contacto BIGINT DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_nif BIGINT DEFAULT NULL,
    p_especialidade VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- O COALESCE mantém o valor antigo se o site/sistema enviar NULL
    UPDATE public.veterinario
    SET 
        nome = COALESCE(p_nome, nome),
        morada = COALESCE(p_morada, morada),
        contacto = COALESCE(p_contacto, contacto),
        email = COALESCE(p_email, email),
        nif = COALESCE(p_nif, nif),
        especialidade = COALESCE(p_especialidade, especialidade)
    WHERE id_veterinario = p_id_veterinario;

    -- Confirma se encontrou o veterinário e atualizou
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION 
    WHEN unique_violation THEN
        -- Trava se tentarem usar um NIF, Email ou Contacto que já exista noutro vet
        RAISE EXCEPTION 'Erro: O NIF, Contacto ou Email introduzido já pertence a outro veterinário.';
    WHEN check_violation THEN
        -- Trava se o NIF ou Contacto não tiverem 9 dígitos
        RAISE EXCEPTION 'Erro: O NIF ou Contacto deve ter exatamente 9 dígitos.';
END;
$$;



-- 	UPDATE TABELA DA CONSULTA TESTADA
CREATE OR REPLACE FUNCTION public.atualizar_consulta_geral(
    p_id_consulta INT,
    p_id_animal INT DEFAULT NULL,
    p_id_veterinario INT DEFAULT NULL,
    p_data_consulta TIMESTAMP DEFAULT NULL,
    p_motivo VARCHAR DEFAULT NULL,
    p_estado estado_servico DEFAULT NULL,
    p_preco NUMERIC DEFAULT NULL,
    p_diagnostico VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_atual estado_servico;
    v_tem_fatura BOOLEAN;
BEGIN
    -- 1. Descobre o estado atual da consulta antes de mexer
    SELECT estado INTO v_estado_atual FROM public.consulta WHERE id_consulta = p_id_consulta;

    -- 2. Verifica se a consulta já tem uma fatura associada
    SELECT EXISTS (
        SELECT 1 FROM public.fatura WHERE id_consulta = p_id_consulta
    ) INTO v_tem_fatura;

    -- 3. As Barreiras de Segurança
    IF v_estado_atual IN ('Realizado', 'Cancelado') THEN
        RAISE EXCEPTION 'Erro: Esta consulta já se encontra % e não pode ser editada.', v_estado_atual;
    END IF;

    IF v_tem_fatura THEN
        RAISE EXCEPTION 'Erro: Operação negada! Esta consulta já possui uma fatura emitida.';
    END IF;

    -- 4. Se passou nas barreiras, atualiza com COALESCE
    UPDATE public.consulta
    SET 
        id_animal = COALESCE(p_id_animal, id_animal),
        id_veterinario = COALESCE(p_id_veterinario, id_veterinario),
        data_consulta = COALESCE(p_data_consulta, data_consulta),
        motivo = COALESCE(p_motivo, motivo),
        estado = COALESCE(p_estado, estado),
        preco = COALESCE(p_preco, preco),
        diagnostico = COALESCE(p_diagnostico, diagnostico)
    WHERE id_consulta = p_id_consulta;

    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION 
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Erro: O Animal ou Veterinário indicado não existe na base de dados.';
END;
$$;



SELECT public.atualizar_consulta_geral(
    p_id_consulta => 114, -- O ID da nova consulta
    p_motivo => 'Check-up e Vacinação',
    p_preco => 50.00
);

INSERT INTO public.fatura (id_consulta, valor_total) 
VALUES (114, 50.00);

select *
from public.consulta


-- 	UPDATE TABELA SERVICO TESTADA
CREATE OR REPLACE FUNCTION public.atualizar_servico_geral(
    p_id_servicos INT,
    p_id_animal INT DEFAULT NULL,
    p_id_funcionario INT DEFAULT NULL,
    p_data_servicos TIMESTAMP DEFAULT NULL,
    p_tipo_servico servico DEFAULT NULL,
    p_estado estado_servico DEFAULT NULL,
    p_preco NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    
    -- Se a API enviou um preço e ele for menor que zero, trava tudo IMEDIATAMENTE!
    IF p_preco IS NOT NULL AND p_preco < 0 THEN
        RAISE EXCEPTION 'Erro: Regra de validação violada. O preço introduzido não pode ser negativo.';
    END IF;

    -- 2. SE PASSOU NO TESTE ACIMA, FAZ O UPDATE NORMALMENTE
    UPDATE public.servicos
    SET 
        id_animal = COALESCE(p_id_animal, id_animal),
        id_funcionario = COALESCE(p_id_funcionario, id_funcionario),
        data_servicos = COALESCE(p_data_servicos, data_servicos),
        tipo_servico = COALESCE(p_tipo_servico, tipo_servico),
        estado = COALESCE(p_estado, estado),
        preco = COALESCE(p_preco, preco)
    WHERE id_servicos = p_id_servicos;

    -- 3. CONFIRMA SE O ID EXISTIA
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;

EXCEPTION 
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Erro: O Animal ou Funcionário indicado não existe na base de dados.';
END;
$$;





select v.nome, h.dia_semana, h.hora_entrada, h.hora_saida, f.nome
from public.horario h inner join public.colaborador c on h.id_colaborador = c.id_colaborador
inner join public.veterinario v on c.id_veterinario = v.id_veterinario 

SELECT 
    c.id_colaborador,
    COALESCE(v.nome, f.nome) AS nome_colaborador,
    CASE
        WHEN v.id_veterinario IS NOT NULL THEN 'Veterinário'
        WHEN f.id_funcionario IS NOT NULL THEN 'Funcionário'
        ELSE 'Sem tipo definido'
    END AS tipo_colaborador,
    h.dia_semana,
    h.hora_entrada,
    h.hora_saida
FROM public.colaborador c
LEFT JOIN public.horario h 
    ON c.id_colaborador = h.id_colaborador
LEFT JOIN public.veterinario v 
    ON c.id_veterinario = v.id_veterinario
LEFT JOIN public.funcionario f 
    ON c.id_funcionario = f.id_funcionario
ORDER BY 
    c.id_colaborador,
    h.dia_semana,
    h.hora_entrada;




select *
from public.funcionario f inner join public.colaborador c on f.id_funcionario = c.id_funcionario


select *
from public.horario

select *
from public.ocorrencia_laboral


select *
from public.consulta

select *
from public.servicos s inner join public.animal a on s.id_animal = a.id_animal

select *
from public.consulta s inner join public.animal a on s.id_animal = a.id_animal


select *
from public.consulta

select *
from public.servicos


select *
from public.login_cliente

select *
from public.logs_gerais

select *
from public.logs

UPDATE public.logs 
SET data_hora_logout = CURRENT_TIMESTAMP 
WHERE data_hora_logout IS NULL;

SELECT *
FROM public.login_colaborador lc 
INNER JOIN public.colaborador col 
    ON lc.id_login_colaborador = col.id_login_colaborador;

	




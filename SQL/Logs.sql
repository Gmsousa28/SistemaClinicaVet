--Testagem de Logs 



CREATE OR REPLACE FUNCTION public.eliminar_consulta_auditada(
    p_id_consulta INT,
    p_id_logs INT -- ID da sessão atual recebido do site
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_dados_apagados JSONB;
    v_estado_atual VARCHAR;
BEGIN
    -- armazena os dados da consulta
    SELECT row_to_json(c) INTO v_dados_apagados 
    FROM public.consulta c 
    WHERE id_consulta = p_id_consulta;

    
    IF NOT FOUND THEN
        RETURN FALSE; 
    END IF;

    -- Extrair o estado do JSON e verificar
    -- O operador ->> extrai o valor do JSON como texto
    v_estado_atual := v_dados_apagados->>'estado';
    
    IF v_estado_atual = 'Realizado' THEN
        RAISE EXCEPTION 'Erro de Negócio: Não é possível apagar uma consulta já realizada. O histórico médico deve ser preservado.';
    END IF;

    -- Apaga fisicamente da tabela 
    DELETE FROM public.consulta WHERE id_consulta = p_id_consulta;

    -- Regista na tabela de logs_gerais 
    INSERT INTO public.logs_gerais (id_logs, tabela_afetada, acao, dados_anteriores)
    VALUES (p_id_logs, 'consulta', 'DELETE', v_dados_apagados);

    RETURN TRUE;

EXCEPTION
    WHEN foreign_key_violation THEN
        --caso ja existe algo associado nao deixa eliminar
        RAISE EXCEPTION 'Erro: Não é possível eliminar esta consulta porque já tem faturas, receitas ou exames associados.';
END;
$$;

INSERT INTO public.logs (data_hora_login, id_login_colaborador) 
VALUES (CURRENT_TIMESTAMP, 2) 
RETURNING id_logs;  --id5


INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo, estado, preco)
VALUES (1, 2, '2026-12-31 10:00:00', 'Consulta para Testar Auditoria', 'Agendado', 35.00)
RETURNING id_consulta;  --id137

SELECT public.eliminar_consulta_auditada(
    p_id_consulta => 137, 
    p_id_logs => 5       
);


SELECT * FROM public.logs_gerais WHERE id_logs = 5;




CREATE OR REPLACE FUNCTION public.realizar_login_colab(
    p_email VARCHAR(200),
    p_palavra_passe VARCHAR(200)
)
-- MUDANÇA AQUI: Agora devolvemos duas colunas para o teu Node.js
RETURNS TABLE (id_colaborador INT, id_sessao INT) 
LANGUAGE plpgsql
AS $$
DECLARE 
    --1. Variaveis 
    v_id INT;
    v_conta_ativa BOOLEAN;
    v_sessao_aberta INT;
    v_login_anterior TIMESTAMP;
    v_nova_sessao INT; -- MUDANÇA AQUI: Variável para guardar o ID gerado
BEGIN
    -- 2. Validar as credenciais e ir buscar o estado da conta
    SELECT id_login_colaborador, conta_ativa
    INTO v_id, v_conta_ativa
    FROM public.login_colaborador
    WHERE email = p_email
      AND palavra_passe = p_palavra_passe;

    -- 3. Se não encontrou utilizador (email ou passe errados)
    IF v_id IS NULL THEN
        RETURN;
    END IF;

    -- 4. Verificar se a conta está ativa antes de deixar entrar
    IF v_conta_ativa = FALSE THEN
        RAISE EXCEPTION 'Acesso negado: A conta deste colaborador encontra-se suspensa ou desativada.';
    END IF;

    -- 5. Buscar a última sessão deste colaborador na tabela de LOGS
    SELECT id_logs, data_hora_login
    INTO v_sessao_aberta, v_login_anterior
    FROM public.logs
    WHERE id_login_colaborador = v_id 
      AND data_hora_logout IS NULL
    ORDER BY data_hora_login DESC 
    LIMIT 1;

    -- 6. Verificar sessão ativa com o limite de 12 horas
    IF v_sessao_aberta IS NOT NULL THEN
        IF (CURRENT_TIMESTAMP - v_login_anterior) < INTERVAL '12 hours' THEN
            -- Se a sessão começou há menos de 12 horas, bloqueia o novo acesso
            RAISE EXCEPTION 'Acesso negado: O colaborador já possui uma sessão ativa.';
        ELSE
            -- Se a sessão for "fantasma" (mais de 12h), fecha-a
            UPDATE public.logs 
            SET data_hora_logout = CURRENT_TIMESTAMP 
            WHERE id_logs = v_sessao_aberta;
        END IF;
    END IF;

    -- 7. MUDANÇA AQUI: Registar a nova entrada e "agarrar" o ID gerado com o RETURNING
    INSERT INTO public.logs (id_login_colaborador, data_hora_login)
    VALUES (v_id, CURRENT_TIMESTAMP)
    RETURNING id_logs INTO v_nova_sessao;

    -- 8. MUDANÇA AQUI: Retornar ambos os IDs
    RETURN QUERY SELECT v_id, v_nova_sessao;

END;
$$;


CREATE OR REPLACE FUNCTION public.logout_dispositivo_colab(
    p_id_colaborador INT,
    p_id_logs INT 
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE public.logs
    SET data_hora_logout = CURRENT_TIMESTAMP
    WHERE id_login_colaborador = p_id_colaborador
      AND id_logs = p_id_logs
      AND data_hora_logout IS NULL; 

    RETURN FOUND;

END;
$$;





CREATE OR REPLACE FUNCTION public.eliminar_colaborador_generico_auditado(
    p_id_colaborador INT,
    p_id_logs INT -- ID da sessão de quem está a dar a ordem de eliminação
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_dados_totais JSONB;
    v_id_login INT;
    v_id_func INT;
    v_id_vet INT;
BEGIN
    -- 1. Tirar a "fotografia" completa de todas as tabelas juntas antes de apagar
    SELECT row_to_json(res) INTO v_dados_totais
    FROM (
        SELECT 
            c.id_colaborador,
            c.cargo,
            lc.email,
            f.id_funcionario,
            f.nome AS nome_funcionario,
            v.id_veterinario,
            v.nome AS nome_veterinario
        FROM public.colaborador c
        INNER JOIN public.login_colaborador lc ON c.id_login_colaborador = lc.id_login_colaborador
        LEFT JOIN public.funcionario f ON c.id_funcionario = f.id_funcionario
        LEFT JOIN public.veterinario v ON c.id_veterinario = v.id_veterinario
        WHERE c.id_colaborador = p_id_colaborador
    ) res;

    -- Se não encontrou o colaborador, para imediatamente
    IF v_dados_totais IS NULL THEN
        RAISE EXCEPTION 'Erro: Colaborador com o ID % não foi encontrado.', p_id_colaborador;
    END IF;

    -- 2. Guardar os IDs internos para sabermos o que apagar a seguir
    SELECT id_login_colaborador, id_funcionario, id_veterinario
    INTO v_id_login, v_id_func, v_id_vet
    FROM public.colaborador
    WHERE id_colaborador = p_id_colaborador;

    -- 3. Iniciar a limpeza em cadeia de baixo para cima (para respeitar as chaves estrangeiras)
    
    -- Primeiro: Rompe-se a ligação central eliminando o registo do colaborador
    DELETE FROM public.colaborador WHERE id_colaborador = p_id_colaborador;

    -- Segundo: Limpa-se o perfil específico (se preenchido)
    IF v_id_func IS NOT NULL THEN
        DELETE FROM public.funcionario WHERE id_funcionario = v_id_func;
    END IF;

    IF v_id_vet IS NOT NULL THEN
        DELETE FROM public.veterinario WHERE id_veterinario = v_id_vet;
    END IF;

    -- Terceiro: Removem-se as credenciais de login
    DELETE FROM public.login_colaborador WHERE id_login_colaborador = v_id_login;

    -- 4. Gravar a "fotografia" gigante na tabela de auditoria
    INSERT INTO public.logs_gerais (id_logs, tabela_afetada, acao, dados_anteriores)
    VALUES (
        p_id_logs, 
        'colaborador (Full Cascade)', 
        'DELETE', 
        v_dados_totais
    );

    RETURN TRUE;

EXCEPTION 
    WHEN foreign_key_violation THEN
        -- Se o colaborador tiver consultas, faturas ou resgates associados, a BD bloqueia!
        RAISE EXCEPTION 'Erro de Integridade: Não é possível eliminar este colaborador porque ele possui histórico ativo no sistema (consultas, faturas ou registos médicos).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao eliminar colaborador: %', SQLERRM;
END;
$$;


-- 1. Criar as credenciais de teste (Hugo)
INSERT INTO public.login_colaborador (email, palavra_passe, conta_ativa)
VALUES ('hugo.teste@vidaanimal.pt', 'pass123', true)
RETURNING id_login_colaborador; --ID 11

-- 2. Criar o perfil de funcionário do Hugo (100% alinhado com a tua tabela)
INSERT INTO public.funcionario (nome, morada, email, nif, contacto, cargo)
VALUES (
    'Hugo Teste Eliminacao', 
    'Rua de Teste, Chaves', 
    'hugo.teste@vidaanimal.pt', 
    999399999, 
    911111111, 
    'Funcionário'
)
RETURNING id_funcionario;

-- 3. Unir tudo na tabela genérica de colaborador
INSERT INTO public.colaborador (id_login_colaborador, id_funcionario, cargo)
VALUES (11, 11, 'Funcionário')
RETURNING id_colaborador; --gerou o ID 13

-- DISPARAR A ELIMINAÇÃO GENÉRICA (Simulando a sessão de auditoria nº 5)
SELECT public.eliminar_colaborador_generico_auditado(
    p_id_colaborador => 13, 
    p_id_logs => 5
);

-- 4. CONFIRMAÇÃO
SELECT acao, tabela_afetada, dados_anteriores 
FROM public.logs_gerais 
WHERE id_logs = 5 AND acao = 'DELETE';



select *
from public.logs_gerais

--***********************************************************************************
--Login colab
--***********************************************************************************
--funcao autenticacao de login(email e passe)
--funcao logout manual do dispositivo
--funcao logout de todos os dispositivos
--funcao logout automatico 12h(sessao fantasma)
--funcao para alterar palavra passe
--funcao verificar se a sessao esta aberta
--funcao de suspender conta(despedimento)
--funcao reativar conta colab


--funcao autenticacao de login(email e passe)

CREATE OR REPLACE FUNCTION public.realizar_login_colab(
    p_email VARCHAR(200),
    p_palavra_passe VARCHAR(200)
)
RETURNS TABLE (id_resultado INT) 
LANGUAGE plpgsql
AS $$
DECLARE 
	--1. Variaveis 
    v_id INT;
    v_conta_ativa BOOLEAN;
    v_sessao_aberta INT;
    v_login_anterior TIMESTAMP;
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

    -- 4. NOVO: Verificar se a conta está ativa antes de deixar entrar
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

    -- 7. Registar a nova entrada na tabela de logs
    INSERT INTO public.logs (id_login_colaborador, data_hora_login)
    VALUES (v_id, CURRENT_TIMESTAMP);

    -- 8. Retornar resultado
    RETURN QUERY SELECT v_id;

END;
$$;


--funcao logout manual do dispositivo

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

--funcao logout em tds os dispositivos

CREATE OR REPLACE FUNCTION public.logout_todas_sessoes_colab(
    p_id_colaborador INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_sessoes_encerradas INT;
BEGIN
    -- Força a data de saída para AGORA em todas as sessões abertas deste colaborador
    UPDATE public.logs
    SET data_hora_logout = CURRENT_TIMESTAMP
    WHERE id_login_colaborador = p_id_colaborador
      AND data_hora_logout IS NULL;

    -- Descobre quantos acessos foram cortados
    GET DIAGNOSTICS v_sessoes_encerradas = ROW_COUNT;

    RETURN v_sessoes_encerradas;
END;
$$;

--funcao logout automatico 12h(sessao fantasma)

CREATE OR REPLACE FUNCTION public.realizar_logout_auto_colab()
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE 
	v_sessoes_limpas INT;
BEGIN

	UPDATE public.logs
    SET data_hora_logout = data_hora_login + INTERVAL '12 hours'
    WHERE data_hora_logout IS NULL
      AND (CURRENT_TIMESTAMP - data_hora_login) >= INTERVAL '12 hours';

	GET DIAGNOSTICS v_sessoes_limpas = ROW_COUNT;

    RETURN v_sessoes_limpas;
END;
$$;

--funcao para alterar palavra passe

CREATE OR REPLACE FUNCTION public.alterar_palavra_passe_colab
(p_id_colaborador INT, p_passe_atual VARCHAR(250), p_passe_nova VARCHAR(250))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_colaborador
	SET palavra_passe = p_passe_nova
	WHERE id_login_colaborador = p_id_colaborador
		AND palavra_passe = p_passe_atual;

	RETURN FOUND;
END;
$$;

--funcao alterar email

CREATE OR REPLACE FUNCTION public.alterar_email_colaborador(
    p_id_colaborador INT, 
    p_passe VARCHAR(250), 
    p_email_atual VARCHAR(250), 
    p_email_novo VARCHAR(250)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_id INT;
BEGIN
    -- 1. Validar as credenciais (ID, Email e Password têm de bater)
    SELECT id_login_colaborador
    INTO v_id
    FROM public.login_colaborador
    WHERE email = p_email_atual
      AND palavra_passe = p_passe; 

    -- 2. Se as credenciais estiverem erradas, retorna FALSE
	IF v_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 3. Executar a alteração
    UPDATE public.login_colaborador
    SET email = p_email_novo
    WHERE id_login_colaborador = p_id_colaborador;

    -- 4. Retorna TRUE se o UPDATE alterou alguma linha
    RETURN FOUND;
END;
$$;

--funcao verificar se a sessao esta aberta
CREATE OR REPLACE FUNCTION public.verificar_sessao_aberta
(p_id_colaborador INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE 
	p_sessao_aberta BOOLEAN;

BEGIN
	p_sessao_aberta := EXISTS(
		SELECT 1
		FROM public.logs
		WHERE id_login_colaborador = p_id_colaborador
			AND data_hora_login IS NOT NULL
			AND data_hora_logout IS NULL
			AND (CURRENT_TIMESTAMP - data_hora_login) < INTERVAL '12 hours'
	);

	RETURN p_sessao_aberta;
END;
$$;

--funcao para desativar conta
CREATE OR REPLACE FUNCTION public.alterar_estado_conta_colab(p_id_colaborador INT,p_novo_estado BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_colaborador
	SET conta_ativa = p_novo_estado
	WHERE id_login_colaborador = p_id_colaborador;

	IF p_novo_estado = FALSE THEN
        PERFORM public.logout_todas_sessoes_colab(p_id_colaborador);
    END IF;

	RETURN FOUND;
END;
$$;

--funcao reativar conta colaborador

CREATE OR REPLACE FUNCTION public.reativar_conta_colab(p_id_colaborador INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_colaborador
	SET conta_ativa = TRUE
	WHERE id_login_colaborador = p_id_colaborador;
	
	RETURN FOUND;
END;
$$;



--***********************************************************************************
--Login cli
--***********************************************************************************
--funcao autenticacao de login(email e passe)
--funcao logout no dispositivo
--funcao logout em tds os dispositivos cli
--funcao para alterar palavra passe
--funcao alterar email
--funcao verificar se o email ja foi registado(colab e cli)
--funcao desativar conta cliente
--funcao reativar conta cliente



--funcao autenticacao de login(email e passe)
drop function public.realizar_login_cliente

CREATE OR REPLACE FUNCTION public.realizar_login_cliente(
    p_email VARCHAR(200),
    p_palavra_passe VARCHAR(200)
)
RETURNS TABLE (id_resultado INT) 
LANGUAGE plpgsql
AS $$
DECLARE 
    v_id INT;
    v_id_log_aberto INT;
    v_data_login_aberto TIMESTAMP;
BEGIN
    -- 1. Validar as credenciais
    SELECT id_login_cliente
    INTO v_id
    FROM public.login_cliente
    WHERE email = p_email 
      AND palavra_passe = p_palavra_passe;

    -- 2. Se as credenciais estiverem erradas, sai da função
    IF v_id IS NULL THEN
        RETURN;
    END IF;

    -- 3. Verificar na tabela de LOGS se existe uma sessão aberta (logout é NULL)
    SELECT id_logs, data_hora_login
    INTO v_id_log_aberto, v_data_login_aberto
    FROM public.logs
    WHERE id_login_cliente = v_id 
      AND data_hora_logout IS NULL
    ORDER BY data_hora_login DESC 
    LIMIT 1;

    -- 4. Aplicar a tua regra:
    -- Se houver sessão aberta...
    IF v_id_log_aberto IS NOT NULL THEN
        -- ... e se essa sessão já tiver mais de 12 horas:
        IF (CURRENT_TIMESTAMP - v_data_login_aberto) >= INTERVAL '12 hours' THEN
            -- "Fecha" a sessão antiga para libertar o acesso
            UPDATE public.logs 
            SET data_hora_logout = CURRENT_TIMESTAMP 
            WHERE id_logs = v_id_log_aberto;
        ELSE
            -- Se tiver menos de 12 horas, bloqueia conforme pediste
            RAISE EXCEPTION 'Bloquear acao: Utilizador já possui uma sessão ativa recente (menos de 12h).';
        END IF;
    END IF;

    -- 5. Criar o novo registo de entrada nos logs
    INSERT INTO public.logs (id_login_cliente, data_hora_login)
    VALUES (v_id, CURRENT_TIMESTAMP);

    -- 6. Retornar o ID do cliente logado
    RETURN QUERY SELECT v_id;

END;
$$;

--funcao logout cliente no dispositivo cli
CREATE OR REPLACE FUNCTION public.realizar_logout_cliente(
    p_id_cliente INT,
    p_id_logs INT 
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualiza o logout na tabela logs usando o ID do cliente
    UPDATE public.logs
    SET data_hora_logout = CURRENT_TIMESTAMP
    WHERE id_login_cliente = p_id_cliente
      AND data_hora_logout IS NULL; 

    RETURN FOUND;

END;
$$;

--funcao logout em tds os dispositivos cli

CREATE OR REPLACE FUNCTION public.logout_todas_sessoes_cli(
    p_id_cliente INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_sessoes_encerradas INT;
BEGIN
    
    UPDATE public.logs
    SET data_hora_logout = CURRENT_TIMESTAMP
    WHERE id_login_cliente = p_id_cliente
      AND data_hora_logout IS NULL;


    GET DIAGNOSTICS v_sessoes_encerradas = ROW_COUNT;

    RETURN v_sessoes_encerradas;
END;
$$;

--funcao para alterar palavra passe 

CREATE OR REPLACE FUNCTION drop function public.alterar_palavra_passe_cliente
(p_id_cliente INT, p_passe_atual VARCHAR(250), p_passe_nova VARCHAR(250))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_cliente
	SET palavra_passe = p_passe_nova
	WHERE id_login_cliente = p_id_cliente
		AND palavra_passe = p_passe_atual;

	RETURN FOUND;
END;
$$;

--funcao alterar email

CREATE OR REPLACE FUNCTION public.alterar_email_cliente(
    p_id_cliente INT, 
    p_passe VARCHAR(250), 
    p_email_atual VARCHAR(250), 
    p_email_novo VARCHAR(250) -- Adicionado o tipo VARCHAR aqui
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_id INT;
BEGIN
    -- 1. Validar as credenciais (ID, Email e Password têm de bater)
    SELECT id_login_cliente
    INTO v_id
    FROM public.login_cliente
    WHERE id_login_cliente = p_id_cliente
      AND email = p_email_atual
      AND palavra_passe = p_passe; -- Corrigido para p_passe (nome do parâmetro)

    -- 2. Se as credenciais estiverem erradas, retorna FALSE
    IF v_id IS NULL THEN
        RETURN 0;
    END IF;

    -- 3. Executar a alteração
    UPDATE public.login_cliente
    SET email = p_email_novo
    WHERE id_login_cliente = p_id_cliente;

    -- 4. Retorna TRUE se o UPDATE alterou alguma linha
    RETURN FOUND;
END;
$$;

--funcao verificar se o email ja foi registado

CREATE OR REPLACE FUNCTION public.bloquear_email_duplicado_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Se a tentativa de inserção/atualização for na tabela de CLIENTES
    IF TG_TABLE_NAME = 'login_cliente' THEN
        IF EXISTS (
			SELECT 1 
			FROM public.login_colaborador 
			WHERE email = NEW.email) 
		THEN
            RAISE EXCEPTION 'Segurança: O email % não pode ser usado porque já pertence a um Colaborador.', NEW.email;
        END IF;

    -- Se a tentativa for na tabela de COLABORADORES
    ELSIF TG_TABLE_NAME = 'login_colaborador' THEN
        IF EXISTS (
			SELECT 1 
			FROM public.login_cliente 
			WHERE email = NEW.email) 
		THEN
            RAISE EXCEPTION 'Segurança: O email % não pode ser usado porque já pertence a um Cliente.', NEW.email;
        END IF;
    END IF;

    -- Se não encontrou o email na outra tabela, deixa a gravação avançar!
    RETURN NEW;
END;
$$;

--trigger
CREATE TRIGGER trg_verificar_email_cruzado_cliente
BEFORE INSERT OR UPDATE OF email 
ON public.login_cliente
FOR EACH ROW 
EXECUTE FUNCTION public.bloquear_email_duplicado_trigger();

--trigger
CREATE TRIGGER trg_verificar_email_cruzado_colab
BEFORE INSERT OR UPDATE OF email 
ON public.login_colaborador
FOR EACH ROW 
EXECUTE FUNCTION public.bloquear_email_duplicado_trigger();

--funcao desativar conta cliente

CREATE OR REPLACE FUNCTION public.desativar_conta_cli(p_id_cliente INT,p_novo_estado BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_cliente
	SET conta_ativa = p_novo_estado
	WHERE id_login_cliente = p_id_cliente;

	IF p_novo_estado = FALSE THEN
        PERFORM public.logout_todas_sessoes_cli(p_id_cliente);
    END IF;

	RETURN FOUND;
END;
$$;

--funcao reativar conta cliente

CREATE OR REPLACE FUNCTION public.reativar_conta_cli(p_id_cliente INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.login_cliente
	SET conta_ativa = TRUE
	WHERE id_login_cliente = p_id_cliente;

	RETURN FOUND;
END;
$$;
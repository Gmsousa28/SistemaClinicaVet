--FUNCAO que bloqueia operacoes com animais mortos
--FUNCAO que valida adocoes(so podem ser animais resgatados)
--FUNCAO que passa o estado para resgatado apos o resgate
--FUNCAO que passa o estado para adotado apos a adocao
--FUNCAO com as verificacoes para marcar uma consulta
--FUNCAO com as verificacoes para marcar uma servicos
--FUNCAO sobreposicao ferias e folgas veterinarios
--FUNCAO sobreposicao ferias e folgas funcionarios
--FUNCAO para bloquear sobreposição de consultas do mesmo animal
--FUNCAO sobreposicao de horario
--FUNCAO de Validação da Escala



--FUNCAO
--Bloquear Operações em Animais Mortos

ALTER TABLE public.consulta DISABLE TRIGGER ALL;
ALTER TABLE public.servicos DISABLE TRIGGER ALL;
ALTER TABLE public.fatura DISABLE TRIGGER ALL;
ALTER TABLE public.adocao DISABLE TRIGGER ALL;
ALTER TABLE public.resgate DISABLE TRIGGER ALL;
ALTER TABLE public.ocorrencia_laboral DISABLE TRIGGER ALL;
ALTER TABLE public.horario DISABLE TRIGGER ALL;
ALTER TABLE public.logs DISABLE TRIGGER ALL;
ALTER TABLE public.login_colaborador DISABLE TRIGGER ALL;
ALTER TABLE public.login_cliente DISABLE TRIGGER ALL;

ALTER TABLE public.consulta ENABLE TRIGGER ALL;
ALTER TABLE public.servicos ENABLE TRIGGER ALL;
ALTER TABLE public.fatura ENABLE TRIGGER ALL;
ALTER TABLE public.adocao ENABLE TRIGGER ALL;
ALTER TABLE public.resgate ENABLE TRIGGER ALL;
ALTER TABLE public.ocorrencia_laboral ENABLE TRIGGER ALL;
ALTER TABLE public.horario ENABLE TRIGGER ALL;
ALTER TABLE public.logs ENABLE TRIGGER ALL;
ALTER TABLE public.login_colaborador ENABLE TRIGGER ALL;
ALTER TABLE public.login_cliente ENABLE TRIGGER ALL;




CREATE OR REPLACE FUNCTION public.verificar_animal_morto()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE 
	estado_atual estado;
BEGIN
    -- Vai buscar o estado do animal
	SELECT estado INTO estado_atual FROM public.animal WHERE id_animal = NEW.id_animal;
    
    -- Se estiver morto devolve o erro
	IF estado_atual = 'Morto' THEN
		RAISE EXCEPTION 'Operação bloqueada: O animal (ID %) encontra-se registado como Morto.', NEW.id_animal; -- Ponto e vírgula adicionado aqui
	END IF;

	RETURN NEW;
END;
$$;

--TRIGGERS
--(na consulta)
CREATE TRIGGER trg_bloquear_consulta_animal_morto
BEFORE INSERT ON public.consulta
FOR EACH ROW EXECUTE FUNCTION verificar_animal_morto();

--(na adocao)
CREATE TRIGGER trg_bloquear_adocao_animal_morto
BEFORE INSERT ON public.adocao
FOR EACH ROW EXECUTE FUNCTION verificar_animal_morto();

--(no resgate)
CREATE TRIGGER trg_bloquear_resgate_animal_morto
BEFORE INSERT ON public.resgate
FOR EACH ROW EXECUTE FUNCTION verificar_animal_morto();

--(animal)



-- Validar a data com trigger
CREATE OR REPLACE FUNCTION public.validar_data_consulta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Só verificamos a "viagem no tempo" se for uma NOVA marcação (INSERT) 
    -- OU se alguém estiver a tentar mudar a data de uma consulta que já existe (UPDATE)
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.data_consulta <> OLD.data_consulta) THEN
        IF NEW.data_consulta < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar ou reagendar consultas para o passado (%).', NEW.data_consulta;
        END IF;
    END IF;
    
    -- Se for apenas o veterinário a preencher o diagnóstico ou a mudar o estado, deixa passar normalmente!
    RETURN NEW;
END;
$$;

-- 2. O Gatilho (O que liga a função à tabela)
CREATE TRIGGER trg_validar_data_consulta
BEFORE INSERT OR UPDATE ON public.consulta
FOR EACH ROW
EXECUTE FUNCTION public.validar_data_consulta();

--teste de marcar no passado
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2020-01-01 10:00:00', 'Vacina');



-- mesmo para os servicos
CREATE OR REPLACE FUNCTION public.validar_data_servicos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verifica se é um novo serviço (INSERT) ou se estão a alterar a data de um já existente (UPDATE)
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.data_servicos <> OLD.data_servicos) THEN
        IF NEW.data_servicos < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar ou reagendar serviços para o passado (%).', NEW.data_servicos;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2. O Gatilho
CREATE TRIGGER trg_validar_data_servicos
BEFORE INSERT OR UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.validar_data_servicos();

-- Tem de falhar
INSERT INTO public.servicos (id_animal, id_funcionario, data_servicos, tipo_servico, preco) 
VALUES (1, 1, '2020-01-01 10:00:00', 'Banho', 25.00);










--Validar adocao
CREATE OR REPLACE FUNCTION public.verificar_adocao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	estado_atual estado;
BEGIN
	SELECT estado INTO estado_atual FROM public.animal WHERE id_animal = new.id_animal;
	IF estado_atual != 'Resgatado' THEN
		RAISE EXCEPTION 'Apenas animais com o estado "Resgatado" podem ser adotados. O estado atual deste animal é: %.', estado_atual;
	END IF;

	RETURN NEW;
END;
$$;

--TRIGGERS

CREATE TRIGGER trg_verificar_adocao
BEFORE INSERT ON public.adocao
FOR EACH ROW EXECUTE FUNCTION public.verificar_adocao();

--Atualizar o Estado Automaticamente (RESGATE)

CREATE OR REPLACE FUNCTION public.update_estado_resgate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.animal SET estado = 'Resgatado' WHERE id_animal = new.id_animal;
	RETURN NEW;
END;
$$;

--TRIGGER

CREATE TRIGGER trg_update_estado_resgate
AFTER INSERT ON public.resgate
FOR EACH ROW EXECUTE FUNCTION public.update_estado_resgate();

--Atualizar o Estado Automaticamente (ADOCAO)

CREATE OR REPLACE FUNCTION public.update_estado_adocao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE public.animal SET estado = 'Adotado' WHERE id_animal = new.id_animal;
	RETURN NEW;
END;
$$;

--TRIGGER

CREATE TRIGGER trg_update_estado_adocao
AFTER INSERT ON public.adocao
FOR EACH ROW EXECUTE FUNCTION public.update_estado_adocao();

--Marcar consulta

CREATE OR REPLACE FUNCTION public.marcar_consulta_restrisoes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_colaborador INT;
    v_dia_semana public.dia_semana;
    horario_valido BOOLEAN;
    veterinario_indisponivel BOOLEAN;
    consulta_existente BOOLEAN;

BEGIN
    -- REGRA 1: Viagem no Tempo
    IF NEW.data_consulta < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar consultas no passado (%).', NEW.data_consulta;
    END IF;

    -- ********************************************************************
    -- PASSO CHAVE: Obter o id_colaborador correspondente ao id_veterinario
    -- ********************************************************************
    SELECT id_colaborador 
	INTO v_id_colaborador
    FROM public.colaborador
    WHERE id_veterinario = NEW.id_veterinario;

    IF v_id_colaborador IS NULL THEN
        RAISE EXCEPTION 'Operação bloqueada: O veterinário (ID %) não está registado como colaborador.', NEW.id_veterinario;
    END IF;

    -- REGRA 2: Horário de Trabalho
    -- Converter o DOW (Day of Week) para o formato do teu ENUM
    v_dia_semana := CASE EXTRACT(DOW FROM NEW.data_consulta)
        WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
		WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
		WHEN 2 THEN CAST('Terça' AS public.dia_semana)
		WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
		WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
		WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
		WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
    END;

    -- Verifica se o veterinário tem turno e se a consulta CABE inteira no turno
    horario_valido := EXISTS (
        SELECT 1
        FROM public.horario
        WHERE id_colaborador = v_id_colaborador  -- Usa o ID correto!
          AND dia_semana = v_dia_semana
          AND CAST(NEW.data_consulta AS TIME) >= hora_entrada
          AND CAST((NEW.data_consulta + INTERVAL '30 minutes') AS TIME) <= hora_saida
    );

    IF NOT horario_valido THEN
        RAISE EXCEPTION 'Operação bloqueada: A consulta está fora do horário de trabalho do veterinário ou é dia de folga.';
    END IF;

    -- REGRA 3: Verifica se o veterinário está de Férias ou Falta
    	veterinario_indisponivel := EXISTS(
        SELECT 1
        FROM public.ocorrencia_laboral
        WHERE id_colaborador = v_id_colaborador  -- Usa o ID correto!
          -- Faz o cast de TIMESTAMP para DATE para comparar corretamente
		  AND CAST (NEW.data_consulta AS DATE) >= data_inicio
          AND CAST (NEW.data_consulta AS DATE) <= data_fim
    );

    IF veterinario_indisponivel THEN
        RAISE EXCEPTION 'Operação bloqueada: O veterinário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
    END IF;
    
    -- REGRA 4: Sobreposição de Consultas (30 minutos)
    consulta_existente := EXISTS (
        SELECT 1 
        FROM public.consulta
        WHERE id_veterinario = NEW.id_veterinario -- Aqui está correto usar o do veterinário!
            AND id_consulta IS DISTINCT FROM NEW.id_consulta
            AND (NEW.data_consulta, NEW.data_consulta + INTERVAL '30 minutes')
                OVERLAPS(data_consulta, data_consulta + INTERVAL '30 minutes')
    );

    IF consulta_existente THEN
        RAISE EXCEPTION 'Operação bloqueada: O veterinário já tem uma consulta a decorrer nesse horário. As consultas requerem intervalos de 30 minutos.';
    END IF;

    RETURN NEW;
END;
$$;

--TRIGGER

CREATE TRIGGER trg_marcar_consulta_restrisoes
BEFORE INSERT OR UPDATE ON public.consulta
FOR EACH ROW EXECUTE FUNCTION public.marcar_consulta_restrisoes();



--funcao marcar servicos
CREATE OR REPLACE FUNCTION public.marcar_servicos_restrisoes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_colaborador INT;
    v_dia_semana public.dia_semana;
    horario_valido BOOLEAN;
    funcionario_indisponivel BOOLEAN;
    servico_existente BOOLEAN;

BEGIN
    -- REGRA DE OURO PARA CANCELAMENTOS: Se for um UPDATE apenas para cancelar, deixa passar logo!
    IF TG_OP = 'UPDATE' AND NEW.estado = 'Cancelado' THEN
        RETURN NEW;
    END IF;

    -- REGRA 1: Viagem no Tempo
    IF NEW.data_servicos < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar serviços no passado (%).', NEW.data_servicos; -- <-- ESTAVA AQUI O ERRO (data_consulta)
    END IF;
   
    -- Obter o colaborador a partir do funcionário
    SELECT id_colaborador INTO v_id_colaborador
    FROM public.colaborador
    WHERE id_funcionario = NEW.id_funcionario;

    IF v_id_colaborador IS NULL THEN
        RAISE EXCEPTION 'Operação bloqueada: O funcionário (ID %) não está registado como colaborador.', NEW.id_funcionario;
    END IF;

    -- REGRA 2: Horário de Trabalho
    v_dia_semana := CASE EXTRACT(DOW FROM NEW.data_servicos)
        WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
        WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
        WHEN 2 THEN CAST('Terça' AS public.dia_semana)
        WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
        WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
        WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
        WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
    END;

    horario_valido := EXISTS (
        SELECT 1 FROM public.horario
        WHERE id_colaborador = v_id_colaborador
          AND dia_semana = v_dia_semana
          AND CAST(NEW.data_servicos AS TIME) >= hora_entrada
          AND CAST((NEW.data_servicos + INTERVAL '30 minutes') AS TIME) <= hora_saida
    );

    IF NOT horario_valido THEN
        RAISE EXCEPTION 'Operação bloqueada: O serviço está fora do horário de trabalho do funcionário ou é dia de folga.';
    END IF;

    -- REGRA 3: Verifica se o funcionário está de Férias ou Falta
    funcionario_indisponivel := EXISTS(
        SELECT 1 FROM public.ocorrencia_laboral
        WHERE id_colaborador = v_id_colaborador
          AND CAST (NEW.data_servicos AS DATE) >= data_inicio
          AND CAST (NEW.data_servicos AS DATE) <= data_fim
    );

    IF funcionario_indisponivel THEN
        RAISE EXCEPTION 'Operação bloqueada: O funcionário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
    END IF;
    
    -- REGRA 4: Sobreposição de Serviços (Ignora os cancelados)
    servico_existente := EXISTS (
        SELECT 1 
        FROM public.servicos
        WHERE id_funcionario = NEW.id_funcionario
            AND id_servicos IS DISTINCT FROM NEW.id_servicos
            AND estado != 'Cancelado' 
            AND (NEW.data_servicos, NEW.data_servicos + INTERVAL '30 minutes')
                OVERLAPS(data_servicos, data_servicos + INTERVAL '30 minutes')
    );

    IF servico_existente THEN
        RAISE EXCEPTION 'Operação bloqueada: O funcionário já tem um serviço a decorrer nesse horário. Os serviços requerem intervalos de 30 minutos.';
    END IF;

    RETURN NEW;
END;
$$;

--TRIGGER

CREATE TRIGGER trg_marcar_servicos_restrisoes
BEFORE INSERT OR UPDATE ON public.servicos
FOR EACH ROW EXECUTE FUNCTION public.marcar_servicos_restrisoes();

--funcao sobreposicao ferias veterinario

CREATE OR REPLACE FUNCTION public.validar_sobreposicao_ferias_folgas_vet()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_veterinario INT;  -- <-- AQUI ESTÁ A CORREÇÃO! Declaramos a variável.
    sobreposicao_existente BOOLEAN;
BEGIN

    -- 1. Só validar férias/folgas
    IF NEW.tipo NOT IN ('Ferias', 'Folgas') THEN
        RETURN NEW;
    END IF;

    -- 2. Verificar se é veterinário
    SELECT id_veterinario INTO v_id_veterinario
    FROM public.colaborador
    WHERE id_colaborador = NEW.id_colaborador;

    -- Se o ID for NULL (não é veterinário) → deixa passar
    IF v_id_veterinario IS NULL THEN
        RETURN NEW;
    END IF;

    -- 3. Verificar sobreposição
    sobreposicao_existente := EXISTS (
        SELECT 1
        FROM public.ocorrencia_laboral
        WHERE id_colaborador = NEW.id_colaborador
          AND tipo IN ('Ferias', 'Folgas')
          AND (OLD.data_inicio IS NULL OR data_inicio IS DISTINCT FROM OLD.data_inicio)
          AND NEW.data_inicio <= data_fim
          AND NEW.data_fim >= data_inicio
    );

    IF sobreposicao_existente THEN
        RAISE EXCEPTION 
        'Operação bloqueada: O veterinário já tem férias/folga sobreposta (% a %).',
        NEW.data_inicio, NEW.data_fim;
    END IF;

    RETURN NEW;
END;
$$;

--trigger
CREATE TRIGGER trg_validar_sobreposicao_ferias_folgas_vet
BEFORE INSERT OR UPDATE ON public.ocorrencia_laboral
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_ferias_folgas_vet();

--funcao sobreposicao funcionario
CREATE OR REPLACE FUNCTION public.validar_sobreposicao_ferias_folgas_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    f_id_funcionario INT;  -- <-- AQUI ESTÁ A CORREÇÃO! Declaramos a variável.
    sobreposicao_existente BOOLEAN;
BEGIN

    -- 1. Só validar férias/folgas
    IF NEW.tipo NOT IN ('Ferias', 'Folgas') THEN
        RETURN NEW;
    END IF;

    -- 2. Verificar se é funcionario
    SELECT id_funcionario INTO f_id_funcionario
    FROM public.colaborador
    WHERE id_colaborador = NEW.id_colaborador;

    -- Se o ID for NULL (não é funcionario) → deixa passar
    IF f_id_funcionario IS NULL THEN
        RETURN NEW;
    END IF;

    -- 3. Verificar sobreposição
    sobreposicao_existente := EXISTS (
        SELECT 1
        FROM public.ocorrencia_laboral
        WHERE id_colaborador = NEW.id_colaborador
          AND tipo IN ('Ferias', 'Folgas')
          AND (OLD.data_inicio IS NULL OR data_inicio IS DISTINCT FROM OLD.data_inicio)
          AND NEW.data_inicio <= data_fim
          AND NEW.data_fim >= data_inicio
    );

    IF sobreposicao_existente THEN
        RAISE EXCEPTION 
        'Operação bloqueada: O funcionario já tem férias/folga sobreposta (% a %).',
        NEW.data_inicio, NEW.data_fim;
    END IF;

    RETURN NEW;
END;
$$;

--trigger
CREATE TRIGGER trg_validar_sobreposicao_ferias_folgas_func
BEFORE INSERT OR UPDATE ON public.ocorrencia_laboral
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_ferias_folgas_func();


-- Função para bloquear sobreposição de consultas do mesmo animal
CREATE OR REPLACE FUNCTION public.validar_sobreposicao_consulta_animal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    sobreposicao_existente BOOLEAN;
BEGIN
	sobreposicao_existente := EXISTS(
		SELECT 1
		FROM public.consulta
		WHERE id_animal = NEW.id_animal
			AND id_consulta IS DISTINCT FROM NEW.id_consulta
			AND NEW.data_consulta < (data_consulta + INTERVAL '30 minutes')
          	AND (NEW.data_consulta + INTERVAL '30 minutes') > data_consulta
	);

	IF sobreposicao_existente THEN
        RAISE EXCEPTION 
        'Operação bloqueada: O animal (ID %) já tem uma consulta marcada nesse horário (entre % e %).',
        NEW.id_animal, NEW.data_inicio, NEW.data_fim;
    END IF;

    RETURN NEW;
END;
$$;

--trigger
CREATE TRIGGER trg_validar_sobreposicao_consulta_animal
BEFORE INSERT OR UPDATE ON public.consulta
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_consulta_animal();

DROP FUNCTION public.validar_sobreposicao_consulta_animal
DROP TRIGGER trg_validar_sobreposicao_consulta_animal ON public.consulta;

--FUNCAO sobreposicao de horario

CREATE OR REPLACE FUNCTION public.validar_sobreposicao_horario()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	sobreposicao_horario BOOLEAN;
BEGIN
	sobreposicao_horario := EXISTS(
		SELECT 1
		FROM public.horario
		WHERE id_colaborador = NEW.id_colaborador
			AND dia_semana = NEW.dia_semana
			AND (dia_semana, id_colaborador, hora_entrada) IS DISTINCT FROM (NEW.dia_semana, NEW.id_colaborador, OLD.hora_entrada)
			AND NEW.hora_entrada < hora_saida
			AND NEW.hora_saida > hora_entrada
	);
	
	IF sobreposicao_horario THEN
        RAISE EXCEPTION 'Operação bloqueada: O colaborador (ID %) já tem um turno à % que se sobrepõe a este horário (% às %).',
        NEW.id_colaborador, NEW.dia_semana, NEW.hora_entrada, NEW.hora_saida;
    END IF;

    RETURN NEW;
END;
$$;

--TRIGGER
CREATE TRIGGER trg_validar_sobreposicao_horario
BEFORE INSERT OR UPDATE ON public.horario
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_horario();

DROP FUNCTION public.validar_sobreposicao_horario
DROP TRIGGER trg_validar_sobreposicao_horario ON public.horario;


-- Função de Validação da Escala

CREATE OR REPLACE FUNCTION public.verificar_escalas_dia(dia_alvo dia_semana)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
	total_vets INT;
	total_funci INT;
	hora_abertura_f TIME;
    hora_fecho_f TIME;
    hora_atual_f TIME;
	escala_vet_f TEXT; 
    escala_funci_f TEXT;
	
BEGIN
-- a que horas a clínica abre e fecha neste dia
	SELECT hora_abertura, hora_fecho
	INTO hora_abertura_f, hora_fecho_f
	FROM public.horario_clinica
	WHERE dia_semana = dia_alvo;

	IF hora_abertura_f IS NULL THEN
		RETURN 'A clínica está encerrada ao ' || dia_alvo || '.';
	END IF;

	hora_atual_f := hora_abertura_f;
	WHILE hora_atual_f < hora_fecho_f LOOP

	-- Teste A: Há algum Veterinário a trabalhar a esta hora?
		
		SELECT COUNT (v.id_veterinario) INTO total_vets
		FROM public.horario h
		
		INNER JOIN public.colaborador c
		ON h.id_colaborador = c.id_colaborador

		INNER JOIN public.veterinario v
		ON c.id_veterinario = v.id_veterinario

		WHERE h.dia_semana = dia_alvo
			AND hora_atual_f >= h.hora_entrada 
        	AND hora_atual_f < h.hora_saida;

		IF total_vets = 0 THEN
            RAISE EXCEPTION 'Escala Inválida: Falta um Veterinário à % às %.', dia_alvo, hora_atual_f;
        END IF;
			
	-- Teste B: Há algum Funcionario a trabalhar a esta hora?

		SELECT COUNT (f.id_funcionario) INTO total_funci
		FROM public.horario h
		
		INNER JOIN public.colaborador c
		ON h.id_colaborador = c.id_colaborador

		INNER JOIN public.funcionario f
		ON c.id_funcionario = f.id_funcionario

		WHERE h.dia_semana = dia_alvo
			AND hora_atual_f >= h.hora_entrada 
        	AND hora_atual_f < h.hora_saida;

		IF total_funci = 0 THEN
            RAISE EXCEPTION 'Escala Inválida: Falta um Funcionario à % às %.', dia_alvo, hora_atual_f;
        END IF;

		hora_atual_f := hora_atual_f + interval '30 minutes';
	END LOOP;

	--vete
	SELECT string_agg( v.nome || ' (' || h.hora_entrada || ' às ' || h.hora_saida || ')', CHR(10) 
	ORDER BY h.hora_entrada)
    
	INTO escala_vet_f
    FROM public.horario h
    INNER JOIN public.colaborador c 
	ON h.id_colaborador = c.id_colaborador
    
	INNER JOIN public.veterinario v 
	ON c.id_veterinario = v.id_veterinario
    WHERE h.dia_semana = dia_alvo;

	--funci
	SELECT string_agg( f.nome || ' (' || h.hora_entrada || ' às ' || h.hora_saida || ')', CHR(10) 
	ORDER BY h.hora_entrada)
    
	INTO escala_funci_f
    FROM public.horario h
    INNER JOIN public.colaborador c 
	ON h.id_colaborador = c.id_colaborador
    
	INNER JOIN public.funcionario f 
	ON c.id_funcionario = f.id_funcionario
    WHERE h.dia_semana = dia_alvo;

	RETURN 'SUCESSO: A escala de ' || dia_alvo || ' está blindada! Sem buracos.' || CHR(10) || CHR(10) ||
           '--- VETERINÁRIOS ---' || CHR(10) || 
           COALESCE(escala_vet_f, 'Nenhum registado') || CHR(10) || CHR(10) ||
           '--- FUNCIONÁRIOS ---' || CHR(10) || 
           COALESCE(escala_funci_f, 'Nenhum registado');

END;
$$;
SELECT public.verificar_escalas_dia('Segunda');
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



-- função para eliminar uma consulta
CREATE OR REPLACE FUNCTION public.eliminar_consulta(p_id_consulta INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_fatura_existe BOOLEAN;
    v_linhas_afetadas INT;
BEGIN
    -- 1. Regra de Segurança Fiscal: Tem fatura?
    SELECT EXISTS (
        SELECT 1 FROM public.fatura WHERE id_consulta = p_id_consulta
    ) INTO v_fatura_existe;

    IF v_fatura_existe THEN
        RAISE EXCEPTION 'Operação bloqueada (Segurança Fiscal): Não é possível eliminar uma consulta que já tem uma fatura emitida (ID %). Apenas pode ser cancelada antes da faturação.', p_id_consulta;
    END IF;

    -- 2. Limpar o histórico clínico (Tabelas Associativas N:M)
    -- Apagamos primeiro os filhos para o PostgreSQL não dar erro de Foreign Key
    DELETE FROM public.prescreve WHERE id_consulta = p_id_consulta;
    DELETE FROM public.orienta WHERE id_consulta = p_id_consulta;

    -- 3. Eliminar a Consulta (Tabela Pai)
    DELETE FROM public.consulta WHERE id_consulta = p_id_consulta;

    -- 4. Verificar se a consulta realmente existia e foi apagada
    GET DIAGNOSTICS v_linhas_afetadas = ROW_COUNT;

    IF v_linhas_afetadas = 0 THEN
        RAISE EXCEPTION 'Erro: A consulta com o ID % não existe ou já foi eliminada.', p_id_consulta;
    END IF;

    RETURN TRUE;
END;
$$;


SELECT public.eliminar_consulta(1);




-- funcao para cancelar uma consulta 
CREATE OR REPLACE FUNCTION public.cancelar_consulta(p_id_consulta INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_fatura_existe BOOLEAN;
    v_estado_atual estado_consulta;
BEGIN
    -- 1. Descobrir se a consulta existe e qual o seu estado
    SELECT estado INTO v_estado_atual 
    FROM public.consulta 
    WHERE id_consulta = p_id_consulta;

    IF v_estado_atual IS NULL THEN
        RAISE EXCEPTION 'Erro: A consulta com o ID % não existe.', p_id_consulta;
    END IF;

    -- Se já estiver cancelada, avisa e não faz nada
    IF v_estado_atual = 'Cancelada' THEN
        RETURN 'Aviso: Esta consulta já se encontrava cancelada.';
    END IF;

    -- verifica se te fatura porque se já tiver, não dá
    SELECT EXISTS (
        SELECT 1 FROM public.fatura WHERE id_consulta = p_id_consulta
    ) INTO v_fatura_existe;

    IF v_fatura_existe THEN
        RAISE EXCEPTION 'Operação bloqueada: Não é possível cancelar uma consulta que já foi faturada (ID %).', p_id_consulta;
    END IF;

    -- Atualiza o estado em vez de apagar
    UPDATE public.consulta 
    SET estado = 'Cancelada' 
    WHERE id_consulta = p_id_consulta;

    RETURN 'SUCESSO: A consulta ' || p_id_consulta || ' foi cancelada com segurança na base de dados!';
END;
$$;



-- mesma coisa mas para os serviços
CREATE OR REPLACE FUNCTION public.cancelar_servico(p_id_servicos INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_fatura_existe BOOLEAN;
    v_estado_atual estado_servico;
BEGIN
    -- 1. Descobrir se o serviço existe e qual o seu estado
    SELECT estado INTO v_estado_atual 
    FROM public.servicos 
    WHERE id_servicos = p_id_servicos;

    IF v_estado_atual IS NULL THEN
        RAISE EXCEPTION 'Erro: O serviço com o ID % não existe.', p_id_servicos;
    END IF;

    -- Se já estiver cancelado, avisa e não faz nada
    IF v_estado_atual = 'Cancelado' THEN
        RETURN 'Aviso: Este serviço já se encontrava cancelado.';
    END IF;

    -- 2. Regra de Segurança Fiscal: Tem fatura?
    SELECT EXISTS (
        SELECT 1 FROM public.fatura WHERE id_servicos = p_id_servicos
    ) INTO v_fatura_existe;

    IF v_fatura_existe THEN
        RAISE EXCEPTION 'Operação bloqueada: Não é possível cancelar um serviço que já foi faturado (ID %).', p_id_servicos;
    END IF;

    -- 3. SOFT DELETE: Atualiza o estado em vez de apagar!
    UPDATE public.servicos 
    SET estado = 'Cancelado' 
    WHERE id_servicos = p_id_servicos;

    RETURN 'SUCESSO: O serviço ' || p_id_servicos || ' foi cancelado com segurança na base de dados!';
END;
$$;



--******************************************************************************************************
--FAturacao
--******************************************************************************************************

--garantir que consulta e servico sao do msm cliente
CREATE OR REPLACE FUNCTION public.verificar_cliente_fatura_dois()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	v_cliente_consulta INT;
	v_cliente_servico INT;

BEGIN

	IF NEW.id_consulta IS NOT NULL AND NEW.id_servicos IS NOT NULL THEN

		SELECT a.id_cliente INTO v_cliente_consulta
		FROM public.consulta c
		INNER JOIN public.animal a ON c.id_animal = a.id_animal
		WHERE c.id_consulta = NEW.id_consulta;

		SELECT a.id_cliente INTO v_cliente_servico
		FROM public.servicos s
		INNER JOIN public.animal a ON s.id_animal = a.id_animal
		WHERE s.id_servicos = NEW.id_servicos;

		IF v_cliente_consulta != v_cliente_servico THEN
			RAISE EXCEPTION 'Operação bloqueada: Não pode faturar em conjunto uma consulta e um serviço de clientes diferentes.';
		END IF;
	END IF;

	RETURN NEW;

END;
$$;

--trigger

CREATE TRIGGER trg_verificar_cliente_fatura_dois
BEFORE INSERT OR UPDATE ON public.fatura
FOR EACH ROW EXECUTE FUNCTION public.verificar_cliente_fatura_dois();	


--faturacao do mes total
CREATE OR REPLACE FUNCTION public.total_faturacao_mensal(p_mes INT, p_ano INT)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_consultas NUMERIC(10,2) := 0;
    v_total_servicos NUMERIC(10,2) := 0;
BEGIN

	SELECT COALESCE(SUM(f.valor_total), 0) INTO v_total_consultas
    FROM public.fatura f
    INNER JOIN public.consulta c ON f.id_consulta = c.id_consulta
    WHERE EXTRACT(MONTH FROM c.data_consulta) = p_mes 
      AND EXTRACT(YEAR FROM c.data_consulta) = p_ano;

    SELECT COALESCE(SUM(f.valor_total), 0) INTO v_total_servicos
    FROM public.fatura f
    INNER JOIN public.servicos s ON f.id_servicos = s.id_servicos
    WHERE EXTRACT(MONTH FROM s.data_servicos) = p_mes 
      AND EXTRACT(YEAR FROM s.data_servicos) = p_ano;

    RETURN v_total_consultas + v_total_servicos;
END;
$$;

--funcao pra faturacao das consultas totais mes
CREATE OR REPLACE FUNCTION public.total_faturacao_mensal_consultas(p_mes INT, p_ano INT)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_consultas NUMERIC(10,2) := 0;
BEGIN
	
	SELECT COALESCE(SUM(f.valor_total), 0) INTO v_total_consultas
    FROM public.fatura f
    INNER JOIN public.consulta c ON f.id_consulta = c.id_consulta
    WHERE EXTRACT(MONTH FROM c.data_consulta) = p_mes 
      AND EXTRACT(YEAR FROM c.data_consulta) = p_ano;

	 RETURN v_total_consultas;
END;
$$;

--funcao pra faturacao dos servicos totais mes

CREATE OR REPLACE FUNCTION public.total_faturacao_mensal_servicos(p_mes INT, p_ano INT)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_servicos NUMERIC(10,2) := 0;
BEGIN
	
	SELECT COALESCE(SUM(f.valor_total), 0) INTO v_total_servicos
    FROM public.fatura f
    INNER JOIN public.servicos c ON f.id_servicos = c.id_servicos
    WHERE EXTRACT(MONTH FROM c.data_servicos) = p_mes 
      AND EXTRACT(YEAR FROM c.data_servicos) = p_ano;

	 RETURN v_total_servicos;
END;
$$;

--defenir os precos dos servicos
CREATE OR REPLACE FUNCTION public.definir_preco_servico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

	IF NEW.tipo_servico = 'Banho' THEN
        NEW.preco := 20.00;
    ELSIF NEW.tipo_servico = 'Tosquia' THEN
        NEW.preco := 30.00;
    ELSIF NEW.tipo_servico = 'Banho e Tosquia' THEN
        NEW.preco := 45.00;
    END IF;
    
    RETURN NEW;
END;
$$;


--Trigger
CREATE TRIGGER trigger_calcular_preco
BEFORE INSERT OR UPDATE ON public.servicos
FOR EACH ROW EXECUTE FUNCTION public.definir_preco_servico();

--funcao para fatura apenas consultas realizadas

CREATE OR REPLACE FUNCTION public.verificar_estado_para_faturar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE 
	v_estado_consulta estado_servico;
	v_estado_servicos estado_servico;
BEGIN
	IF NEW.id_consulta IS NOT NULL THEN
		SELECT estado INTO v_estado_consulta
		FROM public.consulta
		WHERE id_consulta = NEW.id_consulta;

		IF v_estado_consulta != 'Realizado' THEN
			RAISE EXCEPTION 'Operação bloqueada: Não pode emitir fatura para uma consulta com o estado "%". Apenas consultas "Realizado" podem ser faturadas.', v_estado_consulta;
		END IF;
	END IF;


	IF NEW.id_servicos IS NOT NULL THEN
		SELECT estado INTO v_estado_servicos
		FROM public.servicos
		WHERE id_servicos = NEW.id_servicos;

		IF v_estado_servicos != 'Realizado' THEN
			RAISE EXCEPTION 'Operação bloqueada: Não pode emitir fatura para um servico com o estado "%". Apenas servicos "Realizado" podem ser faturadas.', v_estado_servicos;
		END IF;
	END IF;

	RETURN NEW;
END;
$$;

--TRIGGER

CREATE TRIGGER trg_verificar_estado_para_faturar
BEFORE INSERT OR UPDATE ON public.fatura
FOR EACH ROW EXECUTE FUNCTION public.verificar_estado_para_faturar();



-- Inserir animal no sistema AINDA TEMOS DE VERIFICAR SE FICA ASSIM
CREATE OR REPLACE FUNCTION public.inserir_animal(
    p_id_cliente INT, 
    p_nome VARCHAR, 
    p_especie VARCHAR, 
    p_raca VARCHAR, 
    p_sexo public.sexo, 
    p_data_nascimento DATE, 
    p_estado public.estado
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_novo_id INT;
BEGIN
    INSERT INTO public.animal (id_cliente, nome, especie, raca, sexo, data_nascimento, estado)
    VALUES (p_id_cliente, p_nome, p_especie, p_raca, p_sexo, p_data_nascimento, p_estado)
    RETURNING id_animal INTO v_novo_id;

    RETURN v_novo_id;
END;
$$;


---Importante teste de inserção a função depois retorna o serial dado ao determinado aniimal
---
SELECT public.inserir_animal(
    1,                  -- id_cliente
    'Tareco Teste',     -- nome
    'Gato',             -- especie
    'Europeu Comum',    -- raca
    'M',                -- sexo
    '2025-08-15',       -- data_nascimento
    'Domestico'         -- estado
);


-- Dá reset ao SERIAL
SELECT setval(pg_get_serial_sequence('public.animal', 'id_animal'), COALESCE(MAX(id_animal), 1)) FROM public.animal;




-- Funções de UPDATE de dados em tabelas




-- Update aniaml geral
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

select *
from public.animal

SELECT public.atualizar_animal_geral(
    1,                  -- 1. ID do Animal
    1,                  -- 2. ID do Cliente
    'Qimk',             -- 3. Nome (Faltava este!)
    'Cão',              -- 4. Espécie
    NULL ,          -- 5. Raça
    'F',                -- 6. Sexo
    '2022-05-10',       -- 7. Data de Nascimento
    'Resgatado'         -- 8. Estado
);



-- Update tabela cliente com coalesce TESTADA
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

select *
from public.cliente

SELECT public.atualizar_cliente_geral(
    1,                               -- ID do cliente a alterar
    'Carlos Mendes Atualizado',      -- Novo nome
    'Rua da Base de Dados, 404',     -- Nova morada
    'carlos.novo@email.com',         -- Novo email
    123456789,                       -- NIF válido
    987654321                        -- Contacto válido
);



-- Update tabela funcionario TESTADA
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
        -- Proteção contra roubo de NIF ou Contacto de outro colega
        RAISE EXCEPTION 'Erro: O NIF ou Contacto introduzido já pertence a outro funcionário.';
    WHEN check_violation THEN
        -- Proteção dos 9 dígitos
        RAISE EXCEPTION 'Erro: O NIF ou Contacto deve ter exatamente 9 dígitos.';
END;
$$;


select *
from public.funcionario

--teste de alterar so uma coisa forma mais simples de atualizar apenas oq queremos
SELECT public.atualizar_funcionario_geral(
    p_id_funcionario => 1,
    p_cargo => 'Diretor Clínico'
);


-- MEsma coisa pro veterinario  TESTADA
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

select*
from public.veterinario

SELECT public.atualizar_veterinario_geral(
    1,                               -- ID do veterinário
    'Dra. Sofia Martins',            -- Novo nome
    'Rua dos Animais, 123',          -- Nova morada
    912345678,                       -- Contacto
    'sofia.martins@clinica.pt',      -- Email
    222333444,                       -- NIF
    'Cirurgia Geral'                 -- Especialidade
);

SELECT public.atualizar_veterinario_geral(
    p_id_veterinario => 1,
    p_especialidade => 'Ortopedia'
);


-- O mesmo para outr0o
--FUNCAO que bloqueia operacoes com animais mortos
--FUNCAO que valida adocoes
--FUNCAO que passa o estado para resgatado apos o resgate
--FUNCAO que passa o estado para adotado apos a adocao
--FUNCAO com as verificacoes para marcar uma consulta
--FUNCAO com as verificacoes para marcar servicos
--FUNCAO sobreposicao ferias e folgas veterinarios
--FUNCAO sobreposicao ferias e folgas funcionarios
--FUNCAO para bloquear sobreposição de consultas do mesmo animal
--FUNCAO sobreposicao de horario
--FUNCAO de validacao da escala
--FUNCAO autenticacao login colaborador
--FUNCAO logout manual colaborador
--FUNCAO logout de todas as sessoes colaborador
--FUNCAO logout automatico colaborador
--FUNCAO alterar palavra passe colaborador
--FUNCAO alterar email colaborador
--FUNCAO verificar sessao aberta colaborador
--FUNCAO suspender/desativar conta colaborador
--FUNCAO reativar conta colaborador
--FUNCAO autenticacao login cliente
--FUNCAO logout cliente
--FUNCAO logout de todas as sessoes cliente
--FUNCAO alterar palavra passe cliente
--FUNCAO alterar email cliente
--FUNCAO verificar emails duplicados
--FUNCAO desativar conta cliente
--FUNCAO reativar conta cliente
--FUNCAO eliminar consulta
--FUNCAO cancelar consulta
--FUNCAO cancelar servico
--FUNCAO garantir cliente igual na faturacao
--FUNCAO faturacao total mensal
--FUNCAO faturacao mensal consultas
--FUNCAO faturacao mensal servicos
--FUNCAO definir preco automatico dos servicos
--FUNCAO validar estado antes da faturacao
--FUNCAO inserir animal
--PROCEDURE verificar estado dos animais
--FUNCAO obter funcionario disponivel automaticamente
--FUNCAO obter veterinario disponivel automaticamente
--FUNCAO listar consultas de um veterinario
--FUNCAO para dar um vet de forma random para uma consulta
--FUNCAO para dar um func de forma random para um servico


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



--Bloquear Operações em Animais Mortos
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


--Ligar com a tabela
CREATE TRIGGER trg_validar_data_consulta
BEFORE INSERT OR UPDATE ON public.consulta
FOR EACH ROW
EXECUTE FUNCTION public.validar_data_consulta();


--teste de marcar no passado tbm funcionaria com um update simples
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2020-01-01 10:00:00', 'Vacina');



-- mesmo para os servicos
CREATE OR REPLACE FUNCTION public.validar_data_servicos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.data_servicos <> OLD.data_servicos) THEN
        IF NEW.data_servicos < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar ou reagendar serviços para o passado (%).', NEW.data_servicos;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- conectar
CREATE TRIGGER trg_validar_data_servicos
BEFORE INSERT OR UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.validar_data_servicos();

-- Teste
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

--conexao trigger
CREATE TRIGGER trg_verificar_adocao
BEFORE INSERT ON public.adocao
FOR EACH ROW EXECUTE FUNCTION public.verificar_adocao();

select *
from public.animal

INSERT INTO public.adocao (id_animal)
VALUES (2);



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

--Trigger automatico após inserção na tabela resgate
CREATE TRIGGER trg_update_estado_resgate
AFTER INSERT ON public.resgate
FOR EACH ROW EXECUTE FUNCTION public.update_estado_resgate();




--Atualizar o Estado Automaticamente (ADOCAO) IGUAL AO ANTERIOR
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



--Marcaçao de consulta
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
    -- nao marcar no passado
    IF NEW.data_consulta < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar consultas no passado (%).', NEW.data_consulta;
    END IF;


    -- Obter o id_colaborador correspondente ao id_veterinario
    SELECT id_colaborador 
	INTO v_id_colaborador
    FROM public.colaborador
    WHERE id_veterinario = NEW.id_veterinario;
	
	--qualquer vet é sempre registado como colaborador no entanto tem aqui uma testagem
    IF v_id_colaborador IS NULL THEN
        RAISE EXCEPTION 'Operação bloqueada: O veterinário (ID %) não está registado como colaborador.', NEW.id_veterinario;
    END IF;

    -- Horário de Trabalho
    -- Converter o DOW (Day of Week) para o formato do ENUM
    v_dia_semana := CASE EXTRACT(DOW FROM NEW.data_consulta)
        WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
		WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
		WHEN 2 THEN CAST('Terça' AS public.dia_semana)
		WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
		WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
		WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
		WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
    END;

    -- Verifica se o veterinário tem turno e se a consulta cabe inteira no turno
    horario_valido := EXISTS (
        SELECT 1
        FROM public.horario
        WHERE id_colaborador = v_id_colaborador  -- id que temos agora
          AND dia_semana = v_dia_semana
          AND CAST(NEW.data_consulta AS TIME) >= hora_entrada --confirma se é maior que a data de entrada 
          AND CAST((NEW.data_consulta + INTERVAL '30 minutes') AS TIME) <= hora_saida --trata sempre o bloco de 30min
    );

    IF NOT horario_valido THEN
        RAISE EXCEPTION 'Operação bloqueada: A consulta está fora do horário de trabalho do veterinário ou é dia de folga.';
    END IF;

    -- Verificar se o veterinário está de Férias ou Falta
    	veterinario_indisponivel := EXISTS(
        SELECT 1
        FROM public.ocorrencia_laboral
        WHERE id_colaborador = v_id_colaborador  -- id atual
          -- Faz o cast de TIMESTAMP para DATE para comparar corretamente
		  AND CAST (NEW.data_consulta AS DATE) >= data_inicio
          AND CAST (NEW.data_consulta AS DATE) <= data_fim
    );

    IF veterinario_indisponivel THEN
        RAISE EXCEPTION 'Operação bloqueada: O veterinário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
    END IF;
    
    -- Sobreposição de Consultas (30 minutos)
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

--TRIGGER conectado a tabela cosnsulta
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
    -- Se for um UPDATE apenas para cancelar, deixa passar logo
    IF TG_OP = 'UPDATE' AND NEW.estado = 'Cancelado' THEN
        RETURN NEW;
    END IF;

    -- 
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

    -- Horário de Trabalho
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

    -- Verifica se o funcionário está de Férias ou Falta
    funcionario_indisponivel := EXISTS(
        SELECT 1 FROM public.ocorrencia_laboral
        WHERE id_colaborador = v_id_colaborador
          AND CAST (NEW.data_servicos AS DATE) >= data_inicio
          AND CAST (NEW.data_servicos AS DATE) <= data_fim
    );

    IF funcionario_indisponivel THEN
        RAISE EXCEPTION 'Operação bloqueada: O funcionário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
    END IF;
    
    -- Sobreposição de Serviços (Ignora os cancelados)
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

--TRIGGER na de servicos
CREATE TRIGGER trg_marcar_servicos_restrisoes
BEFORE INSERT OR UPDATE ON public.servicos
FOR EACH ROW EXECUTE FUNCTION public.marcar_servicos_restrisoes();



--funcao sobreposicao ferias veterinario
CREATE OR REPLACE FUNCTION public.validar_sobreposicao_ferias_folgas_vet()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_veterinario INT;  
    sobreposicao_existente BOOLEAN;
BEGIN

    -- Só validar férias/folgas
    IF NEW.tipo NOT IN ('Ferias', 'Folgas') THEN
        RETURN NEW;
    END IF;

    -- Verificar se é veterinário
    SELECT id_veterinario INTO v_id_veterinario
    FROM public.colaborador
    WHERE id_colaborador = NEW.id_colaborador;

    -- Se o ID for NULL (não é veterinário) deixa passar
    IF v_id_veterinario IS NULL THEN
        RETURN NEW;
    END IF;

    -- Verificar sobreposição
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

--trigger na tabela de ocorrencias
CREATE TRIGGER trg_validar_sobreposicao_ferias_folgas_vet
BEFORE INSERT OR UPDATE ON public.ocorrencia_laboral
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_ferias_folgas_vet();



--funcao sobreposicao funcionario
CREATE OR REPLACE FUNCTION public.validar_sobreposicao_ferias_folgas_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    f_id_funcionario INT;  
    sobreposicao_existente BOOLEAN;
BEGIN

    --Só validar férias/folgas
    IF NEW.tipo NOT IN ('Ferias', 'Folgas') THEN
        RETURN NEW;
    END IF;

    -- Verificar se é funcionario
    SELECT id_funcionario INTO f_id_funcionario
    FROM public.colaborador
    WHERE id_colaborador = NEW.id_colaborador;

    -- Se o ID for NULL (não é funcionario) deixa passar
    IF f_id_funcionario IS NULL THEN
        RETURN NEW;
    END IF;

    -- Verificar sobreposição
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

--trigger na mesma tabela mas pra funcionario
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

--trigger na consulta
CREATE TRIGGER trg_validar_sobreposicao_consulta_animal
BEFORE INSERT OR UPDATE ON public.consulta
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_consulta_animal();


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

--TRIGGER na tabela horario
CREATE TRIGGER trg_validar_sobreposicao_horario
BEFORE INSERT OR UPDATE ON public.horario
FOR EACH ROW EXECUTE FUNCTION public.validar_sobreposicao_horario();


-- Função de Validação da Escala(disponibilidade no fundo)
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

	-- Há algum Veterinário a trabalhar a esta hora?
		
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
			
	-- Há algum Funcionario a trabalhar a esta hora?

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

select *
from public.horario h inner join public



CREATE OR REPLACE PROCEDURE public.verificar_estado_animais()
LANGUAGE plpgsql
AS $$
DECLARE
    v_animal RECORD;
    
    -- declarar o crusosr diretamente na tabela que queremos
    c_animais CURSOR FOR 
        SELECT id_animal, nome, especie, estado 
        FROM public.animal 
        ORDER BY id_animal;
BEGIN
    RAISE NOTICE '--- INÍCIO DO RELATÓRIO DE ESTADO DOS ANIMAIS ---';

    -- abrir o cursor declarado
    OPEN c_animais;

    --Vamos percorre a lista
    LOOP
        -- Tira a próxima linha da memória e guarda na variável 'v_animal'
        FETCH c_animais INTO v_animal;

        
        EXIT WHEN NOT FOUND;

        
        IF v_animal.estado = 'Morto' THEN
            RAISE NOTICE '[ID: %] O animal % (%) encontra-se registado como FALECIDO.', 
                         v_animal.id_animal, v_animal.nome, v_animal.especie;
                         
        ELSIF v_animal.estado = 'Adotado' THEN
            RAISE NOTICE '[ID: %] Sucesso: O animal % (%) já foi felizmente ADOTADO.', 
                         v_animal.id_animal, v_animal.nome, v_animal.especie;
                         
        ELSIF v_animal.estado = 'Resgatado' THEN
            RAISE NOTICE '[ID: %] Ação Necessária: O animal % (%) está RESGATADO na clínica.', 
                         v_animal.id_animal, v_animal.nome, v_animal.especie;
                         
        ELSE 
            RAISE NOTICE '[ID: %] Info: O animal % (%) é um animal DOMÉSTICO acompanhado.', 
                         v_animal.id_animal, v_animal.nome, v_animal.especie;
        END IF;

    END LOOP;

    -- fechamos o cursor após ser usado
    CLOSE c_animais;
    
    RAISE NOTICE '--- FIM DO RELATÓRIO ---';
END;
$$;



-- obtem um funcionario de forma aleatória de acordo com o horário disponivel(para servicos)TESTADA
CREATE OR REPLACE FUNCTION public.obter_funcionario_disponivel(
    p_datas_verificacao TIMESTAMP[], 
    p_data_inicio TIMESTAMP,         
    p_multiplicador_duracao INT      
)
RETURNS INT 
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_funcionario INT;
BEGIN
    SELECT c.id_funcionario 
    INTO v_id_funcionario
    FROM public.colaborador c
    JOIN public.horario h ON c.id_colaborador = h.id_colaborador
    WHERE c.id_funcionario IS NOT NULL
      -- 2. Verifica se o dia da semana bate certo com o turno do funcionário
      AND h.dia_semana = CASE EXTRACT(DOW FROM p_data_inicio)
          WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
          WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
          WHEN 2 THEN CAST('Terça' AS public.dia_semana)
          WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
          WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
          WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
          WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
      END
      -- 3. Verifica se a duração total dos serviços cabe dentro do turno
      AND CAST(p_data_inicio AS TIME) >= h.hora_entrada
      AND CAST((p_data_inicio + (p_multiplicador_duracao * INTERVAL '30 minutes')) AS TIME) <= h.hora_saida
      -- 4. Garante que ele não está noutro banho/tosquia
      AND c.id_funcionario NOT IN (
          SELECT id_funcionario 
          FROM public.servicos 
          WHERE data_servicos = ANY(p_datas_verificacao)
          AND id_funcionario IS NOT NULL
      )
    ORDER BY RANDOM() 
    LIMIT 1;

    RETURN v_id_funcionario;
END;
$$;


-- igual mas para alocar um veterinario aleatoriamente So usamos a data de inicio pq so temos consultas de 30min sempre
CREATE OR REPLACE FUNCTION public.obter_veterinario_disponivel(
    p_data_inicio TIMESTAMP 
)
RETURNS INT 
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_veterinario INT;
BEGIN
    SELECT c.id_veterinario 
    INTO v_id_veterinario
    FROM public.colaborador c
    JOIN public.horario h ON c.id_colaborador = h.id_colaborador
    WHERE c.id_veterinario IS NOT NULL
      -- Verifica se o dia da semana bate certo com o turno do veterinário
      AND h.dia_semana = CASE EXTRACT(DOW FROM p_data_inicio)
          WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
          WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
          WHEN 2 THEN CAST('Terça' AS public.dia_semana)
          WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
          WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
          WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
          WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
      END
      -- Verifica se a consulta (assumindo duração fixa de 30 mins) cabe dentro do turno
      AND CAST(p_data_inicio AS TIME) >= h.hora_entrada
      AND CAST((p_data_inicio + INTERVAL '30 minutes') AS TIME) <= h.hora_saida
      -- Garante que não há sobreposição com outras consultas do mesmo veterinário
      AND NOT EXISTS (
          SELECT 1 FROM public.consulta con
          WHERE con.id_veterinario = c.id_veterinario
            AND (con.data_consulta, con.data_consulta + INTERVAL '30 minutes') 
                OVERLAPS (p_data_inicio, p_data_inicio + INTERVAL '30 minutes')
      )
    ORDER BY RANDOM() 
    LIMIT 1;

    RETURN v_id_veterinario;
END;
$$;

CREATE OR REPLACE FUNCTION public.listar_consultas_veterinario(
    p_id_veterinario INT -- Corresponde ao $1
)
RETURNS TABLE (
    data_consulta TIMESTAMP,
    motivo VARCHAR,        -- Ajusta para o tipo exato da tua tabela (ex: TEXT ou VARCHAR(255))
    nome_cliente VARCHAR,  -- Corresponde a cl.nome
    nome_animal VARCHAR,   -- Corresponde a a.animal
    especie VARCHAR,
    raca VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.data_consulta,
        c.motivo,
        cl.nome,
        a.animal,
        a.especie,
        a.raca
    FROM public.veterinario v
    INNER JOIN public.consulta c
        ON v.id_veterinario = c.id_veterinario
    INNER JOIN public.animal a
        ON c.id_animal = a.id_animal
    INNER JOIN public.cliente cl
        ON a.id_cliente = cl.id_cliente
    WHERE v.id_veterinario = p_id_veterinario
    ORDER BY c.data_consulta DESC;
END;
$$;

-- Substitui o "1" pelo ID de um veterinário que tenhas na base de dados
SELECT * FROM public.listar_consultas_veterinario(4);



-- obter um veterinario de forma aleatória para uma consulta
CREATE OR REPLACE FUNCTION obter_veterinario_consulta_random(p_data_consulta TIMESTAMP) 
RETURNS INT 
LANGUAGE sql 
AS $$
    SELECT c.id_veterinario 
    FROM public.colaborador c
    JOIN public.horario h ON c.id_colaborador = h.id_colaborador
    WHERE c.id_veterinario IS NOT NULL
      AND h.dia_semana = CASE EXTRACT(DOW FROM p_data_consulta)
          WHEN 0 THEN 'Domingo'::public.dia_semana
          WHEN 1 THEN 'Segunda'::public.dia_semana
          WHEN 2 THEN 'Terça'::public.dia_semana
          WHEN 3 THEN 'Quarta'::public.dia_semana
          WHEN 4 THEN 'Quinta'::public.dia_semana
          WHEN 5 THEN 'Sexta'::public.dia_semana
          WHEN 6 THEN 'Sábado'::public.dia_semana
      END
      AND p_data_consulta::TIME >= h.hora_entrada
      AND (p_data_consulta + INTERVAL '30 minutes')::TIME <= h.hora_saida
      AND NOT EXISTS (
          SELECT 1 FROM public.consulta con
          WHERE con.id_veterinario = c.id_veterinario
            AND (con.data_consulta, con.data_consulta + INTERVAL '30 minutes') 
                OVERLAPS (p_data_consulta, p_data_consulta + INTERVAL '30 minutes')
      )
    ORDER BY RANDOM() 
    LIMIT 1;
$$;


--Obter funcionario aleatório para um servico
CREATE OR REPLACE FUNCTION obter_funcionario_servico_random(
    p_timestamps_blocos TIMESTAMP[], 
    p_data_inicio TIMESTAMP, 
    p_total_blocos INT
) 
RETURNS INT 
LANGUAGE sql 
AS $$
    SELECT c.id_funcionario 
    FROM public.colaborador c
    JOIN public.horario h ON c.id_colaborador = h.id_colaborador
    WHERE c.id_funcionario IS NOT NULL
      AND h.dia_semana = CASE EXTRACT(DOW FROM p_data_inicio)
          WHEN 0 THEN 'Domingo'::public.dia_semana
          WHEN 1 THEN 'Segunda'::public.dia_semana
          WHEN 2 THEN 'Terça'::public.dia_semana
          WHEN 3 THEN 'Quarta'::public.dia_semana
          WHEN 4 THEN 'Quinta'::public.dia_semana
          WHEN 5 THEN 'Sexta'::public.dia_semana
          WHEN 6 THEN 'Sábado'::public.dia_semana
      END
      AND p_data_inicio::TIME >= h.hora_entrada
      AND (p_data_inicio + (p_total_blocos * INTERVAL '30 minutes'))::TIME <= h.hora_saida
      AND c.id_funcionario NOT IN (
          SELECT id_funcionario 
          FROM public.servicos 
          WHERE data_servicos = ANY(p_timestamps_blocos)
      )
    ORDER BY RANDOM() 
    LIMIT 1;
$$;




CALL public.gerar_cursor_relatorio_mensal();


SELECT * 
FROM public.relatorio_clinico_mensal;



-- Esta funcional no entanto tem um problema, ao usar o loop para um exemplo de 10mil consultas vou ter problemas de otimização, no entanto
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



-- so para ver
SELECT 
    c.id_consulta,
    a.nome AS nome_animal,
    c.motivo,
    c.estado,
    c.data_consulta AS data_atual,
    
    -- LAG para ir buscar a data da última vez que cá veio
    LAG(c.data_consulta) OVER (
        PARTITION BY c.id_animal 
        ORDER BY c.data_consulta
    ) AS data_ultima_consulta,

    -- Calcula os dias exatos que passaram entre as duas consultas
    EXTRACT(DAY FROM (
        c.data_consulta - LAG(c.data_consulta) OVER (
            PARTITION BY c.id_animal 
            ORDER BY c.data_consulta
        )
    )) AS dias_entre_consultas

FROM 
    public.consulta c
INNER JOIN 
    public.animal a ON c.id_animal = a.id_animal
ORDER BY 
    a.nome, c.data_consulta;






-- rank de consultas dos veterinarios
WITH RankingVeterinarios AS (
    SELECT 
        v.id_veterinario,
        v.nome AS nome_veterinario,
        COUNT(c.id_consulta) AS total_consultas,
        
        DENSE_RANK() OVER (
            ORDER BY COUNT(c.id_consulta) DESC
        ) AS posicao_ranking
        
    FROM 
        public.consulta c
    INNER JOIN 
        public.veterinario v ON c.id_veterinario = v.id_veterinario
    GROUP BY 
        v.id_veterinario, v.nome
)

SELECT * FROM RankingVeterinarios;
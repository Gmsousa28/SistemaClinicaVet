-- ****************************************************************************
-- ENUMS (Tipos de Dados Personalizados - Criar Primeiro)
-- ****************************************************************************
CREATE TYPE sexo AS ENUM('M','F');
CREATE TYPE estado AS ENUM('Morto','Resgatado','Adotado','Domestico');
CREATE TYPE cargo_log_col AS ENUM('Veterinário','Funcionário','Admin');
CREATE TYPE idade_aprox AS ENUM('Bebé','Juvenil','Adulto','Velho');
CREATE TYPE tipo_ocorrencia AS ENUM('Falta','Atraso','Folgas','Ferias');
CREATE TYPE dia_semana AS ENUM ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo');
CREATE TYPE servico AS ENUM ('Banho', 'Tosquia', 'Banho e Tosquia');
CREATE TYPE estado_servico AS ENUM ('Agendado', 'Realizado', 'Cancelado');


-- ****************************************************************************
-- 1. TABELAS INDEPENDENTES (Não dependem de outras tabelas - Sem Foreign Keys)
-- ****************************************************************************
CREATE TABLE public.horario_clinica (
    dia_semana dia_semana NOT NULL,
    hora_abertura TIME NOT NULL,
    hora_fecho TIME NOT NULL,
    CONSTRAINT horario_clinica_pk PRIMARY KEY (dia_semana),
    CONSTRAINT chk_abertura_fecho CHECK (hora_fecho > hora_abertura)
);

select *
from public.horario_clinica

CREATE TABLE public.login_colaborador(
    id_login_colaborador SERIAL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    palavra_passe VARCHAR(255) NOT NULL,
	conta_ativa BOOLEAN DEFAULT TRUE,
    CONSTRAINT login_colaborador_pk PRIMARY KEY(id_login_colaborador)
);

select *
from public.login_colaborador

CREATE TABLE public.login_cliente(
    id_login_cliente SERIAL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    palavra_passe VARCHAR(255) NOT NULL,
	conta_ativa BOOLEAN DEFAULT TRUE,
    CONSTRAINT login_cliente_pk PRIMARY KEY(id_login_cliente)
);

select *
from public.login_cliente
	
CREATE TABLE public.medicamento(
    id_medicamento SERIAL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    CONSTRAINT medic_pk PRIMARY KEY(id_medicamento)
);

select *
from public.medicamento

CREATE TABLE public.exame(
    id_exame SERIAL UNIQUE,
    nome VARCHAR(150) NOT NULL,
	valor_cobrado NUMERIC(10,2) NOT NULL
    CONSTRAINT exa_pk PRIMARY KEY(id_exame)
);

select *
from public.exame

CREATE TABLE public.funcionario (
    id_funcionario SERIAL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    morada VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    nif BIGINT NOT NULL UNIQUE CHECK (nif >= 100000000 AND nif <= 999999999),
    contacto BIGINT NOT NULL UNIQUE CHECK (contacto >= 100000000 AND contacto <= 999999999),
    cargo VARCHAR(150) NOT NULL,
    CONSTRAINT funci_pk PRIMARY KEY (id_funcionario)
);

select *
from public.funcionario

CREATE TABLE public.veterinario (
    id_veterinario SERIAL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    morada VARCHAR(150) NOT NULL,
    contacto BIGINT NOT NULL UNIQUE CHECK (contacto >= 100000000 AND contacto <= 999999999),
    email VARCHAR(150) NOT NULL UNIQUE,
    nif BIGINT NOT NULL UNIQUE CHECK (nif >= 100000000 AND nif <= 999999999),
    especialidade VARCHAR(150) NOT NULL,
    CONSTRAINT veteri_pk PRIMARY KEY (id_veterinario)
);

select *
from public.veterinario



-- ****************************************************************************
-- TABELAS DEPENDENTES (Contêm Foreign Keys para as tabelas independentes)
-- ****************************************************************************
CREATE TABLE public.logs(
	id_logs SERIAL UNIQUE,
	data_hora_login TIMESTAMP,
    data_hora_logout TIMESTAMP,
	CONSTRAINT logs_pk PRIMARY KEY(id_logs)
);

select *
from public.logs

ALTER TABLE public.logs ADD COLUMN id_login_colaborador INT NULL;
ALTER TABLE public.logs
ADD CONSTRAINT logs_log_colab_fk 
FOREIGN KEY (id_login_colaborador)
REFERENCES public.login_colaborador(id_login_colaborador);


ALTER TABLE public.logs ADD COLUMN id_login_cliente INT NULL;
ALTER TABLE public.logs
ADD CONSTRAINT logs_log_cli_fk 
FOREIGN KEY (id_login_cliente)
REFERENCES public.login_cliente(id_login_cliente);



CREATE TABLE public.logs_gerais (
    id_log_geral SERIAL UNIQUE,
    id_logs INT NOT NULL, 
    tabela_afetada VARCHAR(150) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    dados_anteriores JSONB NOT NULL, -- Guarda toda a informação mexida
    data_hora_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT logs_gerais_pk PRIMARY KEY (id_log_geral),
    CONSTRAINT logs_gerais_sessao_fk FOREIGN KEY (id_logs) REFERENCES public.logs(id_logs)
);

--cliente
CREATE TABLE public.cliente(
    id_cliente SERIAL UNIQUE,
    id_login_cliente INT NOT NULL UNIQUE, 
    nome VARCHAR(150) NOT NULL,
    morada VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    nif BIGINT NOT NULL UNIQUE CHECK (nif >= 100000000 AND nif <= 999999999),
    contacto BIGINT NOT NULL UNIQUE CHECK (contacto >= 100000000 AND contacto <= 999999999),
    CONSTRAINT clien_pk PRIMARY KEY(id_cliente),
    CONSTRAINT colab_login_cli_fk FOREIGN KEY (id_login_cliente) REFERENCES public.login_cliente(id_login_cliente)
);

select *
from public.cliente

CREATE TABLE public.colaborador (
    id_colaborador SERIAL UNIQUE,
    id_login_colaborador INT NOT NULL UNIQUE, 
    id_funcionario INT UNIQUE,
    id_veterinario INT UNIQUE,
    CONSTRAINT colaborador_pk PRIMARY KEY (id_colaborador),
    CONSTRAINT colab_login_col_fk FOREIGN KEY (id_login_colaborador) REFERENCES public.login_colaborador(id_login_colaborador),
    CONSTRAINT fk_colab_func FOREIGN KEY (id_funcionario) REFERENCES public.funcionario(id_funcionario),
    CONSTRAINT fk_colab_vet FOREIGN KEY (id_veterinario) REFERENCES public.veterinario(id_veterinario),
    CONSTRAINT chk_dependencia_exclusiva CHECK (
        (id_funcionario IS NOT NULL AND id_veterinario IS NULL) OR 
        (id_funcionario IS NULL AND id_veterinario IS NOT NULL)
    )
);

alter table public.colaborador
add column cargo cargo_log_col NOT NULL
select *
from public.colaborador

CREATE TABLE public.horario (
    id_colaborador INT NOT NULL,
    dia_semana dia_semana NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_saida TIME NOT NULL,
    CONSTRAINT horar_pk PRIMARY KEY (id_colaborador, dia_semana, hora_entrada),
    CONSTRAINT horar_colab_fk FOREIGN KEY (id_colaborador) REFERENCES public.colaborador(id_colaborador),
    CONSTRAINT chk_hora_valida CHECK (hora_saida > hora_entrada)
);

select *
from public.horario



CREATE TABLE public.ocorrencia_laboral (
    id_colaborador INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    tipo tipo_ocorrencia NOT NULL,
    observacoes VARCHAR(255),
    CONSTRAINT ocorrencia_pk PRIMARY KEY (id_colaborador, data_inicio),
    CONSTRAINT ocorrencia_colab_fk FOREIGN KEY (id_colaborador) REFERENCES public.colaborador(id_colaborador),
    CONSTRAINT chk_datas_ocorrencia CHECK (data_fim >= data_inicio)
);

select *
from public.ocorrencia_laboral


CREATE TABLE public.animal(
    id_animal SERIAL UNIQUE,
    id_cliente INT NOT NULL, 
    nome VARCHAR(150) NOT NULL,
    especie VARCHAR(150) NOT NULL,
    raca VARCHAR(150) NOT NULL,
    sexo sexo NOT NULL,
    data_nascimento DATE NOT NULL,
    estado estado NOT NULL,
    CONSTRAINT ani_pk PRIMARY KEY(id_animal),
    CONSTRAINT ani_cli_fk FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente)
);

select *
from public.animal

ALTER TABLE public.animal 
ADD CONSTRAINT chk_data_nascimento_valida 
CHECK (data_nascimento <= CURRENT_DATE);


CREATE TABLE public.resgate(
    id_resgate SERIAL UNIQUE,
    id_animal INT NOT NULL, 
    id_funcionario INT NOT NULL, 
    data_resgate DATE NOT NULL,
    idade idade_aprox,
    CONSTRAINT resg_pk PRIMARY KEY(id_resgate),
    CONSTRAINT resg_ani_fk FOREIGN KEY (id_animal) REFERENCES public.animal(id_animal),
    CONSTRAINT resg_func_fk FOREIGN KEY (id_funcionario) REFERENCES public.funcionario(id_funcionario)
);

ALTER TABLE public.resgate 
ADD CONSTRAINT chk_data_resgate_valida 
CHECK (data_resgate <= CURRENT_DATE);

select *
from public.resgate



CREATE TABLE public.adocao(
    id_adocao SERIAL UNIQUE,
    id_animal INT NOT NULL, 
    id_funcionario INT NOT NULL, 
    data_adocao DATE NOT NULL,
    CONSTRAINT ado_pk PRIMARY KEY(id_adocao),
    CONSTRAINT ado_ani_fk FOREIGN KEY (id_animal) REFERENCES public.animal(id_animal),
    CONSTRAINT ado_func_fk FOREIGN KEY (id_funcionario) REFERENCES public.funcionario(id_funcionario)
);

select *
from public.adocao



ALTER TABLE public.adocao 
ADD CONSTRAINT chk_data_adocao_valida 
CHECK (data_adocao <= CURRENT_DATE);


INSERT INTO public.adocao (id_animal, id_funcionario, data_adocao) 
VALUES (1, 1, '2026-12-25');


CREATE TABLE public.consulta(
    id_consulta SERIAL UNIQUE,
    id_animal INT NOT NULL, 
    id_veterinario INT NOT NULL, 
    data_consulta TIMESTAMP NOT NULL,
    motivo VARCHAR(150) NOT NULL,
	estado estado_servico DEFAULT 'Agendado',
	preco NUMERIC(10,2) DEFAULT 35.00
	diagnostico VARCHAR,
    CONSTRAINT cons_pk PRIMARY KEY(id_consulta),
    CONSTRAINT cons_ani_fk FOREIGN KEY (id_animal) REFERENCES public.animal(id_animal),
    CONSTRAINT cons_vet_fk FOREIGN KEY (id_veterinario) REFERENCES public.veterinario(id_veterinario)
);

select *
from public.consulta


SELECT setval(
    pg_get_serial_sequence('public.consulta', 'id_consulta'), 
    COALESCE((SELECT MAX(id_consulta) FROM public.consulta), 1)
);

CREATE TABLE public.servicos(
	id_servicos SERIAL UNIQUE,
	id_animal INT NOT NULL,
	id_funcionario INT NOT NULL,
	data_servicos TIMESTAMP NOT NULL,
	tipo_servico servico NOT NULL,
	estado estado_servico DEFAULT 'Agendado',
	preco NUMERIC(10,2) NOT NULL,
	CONSTRAINT serv_pk PRIMARY KEY(id_servicos),
	CONSTRAINT serv_ani_fk FOREIGN KEY(id_animal) REFERENCES public.animal(id_animal),
	CONSTRAINT serv_func_fk FOREIGN KEY(id_funcionario) REFERENCES public.funcionario(id_funcionario)
);

select *
from public.servicos



CREATE TABLE public.fatura(
    id_fatura SERIAL UNIQUE,
    id_consulta INT UNIQUE, 
    id_servicos INT UNIQUE,
    valor_total NUMERIC(10,2) NOT NULL CHECK(valor_total >= 0),
    CONSTRAINT fat_pk PRIMARY KEY(id_fatura),
    CONSTRAINT fat_cons_fk FOREIGN KEY (id_consulta) REFERENCES public.consulta(id_consulta),
    CONSTRAINT fat_serv_fk FOREIGN KEY (id_servicos) REFERENCES public.servicos(id_servicos),
    CONSTRAINT chk_fatura_associacao CHECK (id_consulta IS NOT NULL OR id_servicos IS NOT NULL)
);



-- ****************************************************************************
-- 3. TABELAS DE RELACIONAMENTO (N:M) (Puramente associativas, unem outras tabelas dependentes/independentes)
-- ****************************************************************************

CREATE TABLE public.prescreve(
    id_consulta INT NOT NULL,
    id_medicamento INT NOT NULL,
    quantidade NUMERIC(10,2) NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    CONSTRAINT presc_pk PRIMARY KEY(id_consulta, id_medicamento),
    CONSTRAINT pres_consl_fk FOREIGN KEY (id_consulta) REFERENCES public.consulta(id_consulta),
    CONSTRAINT pres_medic_fk FOREIGN KEY (id_medicamento) REFERENCES public.medicamento(id_medicamento)
);

CREATE TABLE public.orienta(
    id_consulta INT NOT NULL,
    id_exame INT NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    CONSTRAINT ori_pk PRIMARY KEY (id_consulta, id_exame),
    CONSTRAINT orien_consl_fk FOREIGN KEY (id_consulta) REFERENCES public.consulta(id_consulta),
    CONSTRAINT orien_exame_fk FOREIGN KEY (id_exame) REFERENCES public.exame(id_exame)
);

select *
from public.orienta



-- Desafios que podem ser uteis
CREATE TABLE public.alerta(
	id_alerta SERIAL UNIQUE,
    id_cliente INT NOT NULL,
    mensagem VARCHAR(150) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    CONSTRAINT alerta_pk PRIMARY KEY (id_alerta),
    CONSTRAINT alerta_cli_fk FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente)
);


CREATE TABLE public.relatorio_clinico_mensal (
    id_relatorio SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(150),
    nome_animal VARCHAR(150),
    mes INT,
    ano INT,
    lista_prescricoes TEXT,
    lista_exames TEXT
);
TRUNCATE TABLE 
	public.prescreve,
    public.orienta,
    public.ocorrencia_laboral,
    public.fatura,
    public.consulta,
    public.adocao,
    public.resgate,
    public.animal,
    public.horario,
    public.colaborador,
    public.veterinario,
    public.funcionario,
    public.cliente,
    public.login_cliente,
    public.login_colaborador,
    public.exame,
    public.medicamento,
    public.clinica,
	public.horario_clinica,
	public.logs,
	public.servicos
	RESTART IDENTITY CASCADE;

--🧪 1. CLINICA
INSERT INTO clinica (nome, email, morada, contacto_geral) VALUES
('Clínica Animal Vida', 'geral@vida.pt', 'Rua Central 123, Braga', 912345678);

--👤 2. LOGIN COLABORADOR
INSERT INTO login_colaborador 
(nome, email, palavra_passe, telemovel, data_nascimento, morada, nif, cargo)
VALUES
('João Silva', 'joao@clinica.pt', 'hash123', 911111111, '1985-05-10', 'Braga', 123456789, 'Veterinário'),
('Ana Costa', 'ana@clinica.pt', 'hash456', 922222222, '1990-08-20', 'Porto', 987654321, 'Funcionario');

--👥 3. FUNCIONARIO & VETERINARIO
INSERT INTO funcionario (nome, morada, email, nif, contacto, cargo) VALUES
('Ana Costa', 'Porto', 'ana.func@clinica.pt', 111222333, 933333333, 'Rececionista');

INSERT INTO veterinario (nome, morada, contacto, email, nif, especialidade) VALUES
('João Silva', 'Braga', 944444444, 'joao.vet@clinica.pt', 222333444, 'Cirurgia');

--🔗 4. COLABORADOR
-- João (veterinário)
INSERT INTO colaborador (id_login_colaborador, id_veterinario)
VALUES (1, 1);

-- Ana (funcionária)
INSERT INTO colaborador (id_login_colaborador, id_funcionario)
VALUES (2, 1);

--🧑‍💻 5. LOGIN CLIENTE
INSERT INTO login_cliente 
(nome, email, palavra_passe, telemovel, data_nascimento, morada, nif)
VALUES
('Carlos Mendes', 'carlos@gmail.com', 'pass123', 955555555, '1995-03-15', 'Braga', 333444555);

--🧾 6. CLIENTE
INSERT INTO cliente 
(id_login_cliente, nome, morada, email, nif, contacto)
VALUES
(1, 'Carlos Mendes', 'Braga', 'carlos@gmail.com', 333444555, 955555555);

--🐶 7. ANIMAL
INSERT INTO animal 
(id_cliente, nome, especie, raca, sexo, data_nascimento, estado)
VALUES
(1, 'Rex', 'Cão', 'Labrador', 'M', '2020-06-01', 'Domestico'),
(1, 'Mia', 'Gato', 'Siamês', 'F', '2022-01-10', 'Adotado');

--🚑 8. RESGATE
INSERT INTO resgate 
(id_animal, id_funcionario, data_resgate, idade)
VALUES
(2, 1, '2023-02-01', 'Juvenil');

--❤️ 9. ADOÇÃO
INSERT INTO adocao 
(id_animal, id_funcionario, data_adocao)
VALUES
(2, 1, '2023-03-01');

--🩺 10. CONSULTA
INSERT INTO consulta 
(id_animal, id_veterinario, data_consulta, motivo)
VALUES
(1, 1, '2024-01-10 10:00:00', 'Vacinação'),
(2, 1, '2024-02-15 14:30:00', 'Check-up');

--💊 11. MEDICAMENTO & EXAME
INSERT INTO medicamento (nome) VALUES
('Paracetamol'),
('Antibiótico');

INSERT INTO exame (nome) VALUES
('Raio-X'),
('Análise de Sangue');

--🔗 12. PRESCREVE
INSERT INTO prescreve 
(id_consulta, id_medicamento, quantidade, descricao)
VALUES
(1, 1, 2, 'Tomar 2x ao dia'),
(2, 2, 1, 'Tomar 1x ao dia');

--🔬 13. ORIENTA
INSERT INTO orienta 
(id_consulta, id_exame, descricao)
VALUES
(1, 1, 'Verificar fratura'),
(2, 2, 'Check geral');

--💰 14. FATURA
INSERT INTO fatura 
(id_consulta, valor_total)
VALUES
(1, 50.00),
(2, 75.00);

--📅 15. HORARIO
INSERT INTO horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
(1, 'Segunda', '09:00', '17:00'),
(2, 'Segunda', '10:00', '18:00');

--⚠️ 16. OCORRENCIA LABORAL
INSERT INTO ocorrencia_laboral 
(id_colaborador, data_inicio, data_fim, tipo, observacoes)
VALUES
(2, '2024-03-01', '2024-03-01', 'Falta', 'Falta justificada');


-- 1. Criar Cliente e o respetivo Login
INSERT INTO public.login_cliente (nome, email, palavra_passe, telemovel, morada, nif) 
VALUES ('João Cliente', 'joao@email.com', 'pass123', 910000001, 'Rua dos Cães, 123', 123456789);

INSERT INTO public.cliente (id_login_cliente, nome, morada, email, nif, contacto) 
VALUES (1, 'João Cliente', 'Rua dos Cães, 123', 'joao@email.com', 123456789, 910000001);

-- 2. Criar Animal
INSERT INTO public.animal (id_cliente, nome, especie, raca, sexo, data_nascimento, estado) 
VALUES (1, 'Bobi', 'Cão', 'Rafeiro', 'M', '2020-01-01', 'Domestico');

-- 3. Criar Veterinário e o respetivo Login/Colaborador
INSERT INTO public.veterinario (nome, morada, contacto, email, nif, especialidade) 
VALUES ('Dr. Silva', 'Clínica Central', 920000002, 'silva@vet.com', 987654321, 'Geral');

INSERT INTO public.login_colaborador (nome, email, palavra_passe, telemovel, morada, nif, cargo) 
VALUES ('Dr. Silva', 'silva@vet.com', 'pass123', 920000002, 'Clínica Central', 987654321, 'Veterinário');

INSERT INTO public.colaborador (id_login_colaborador, id_veterinario) 
VALUES (1, 1);

-- 4. Definir o Horário de Trabalho do Veterinário (Segunda a Sexta, das 09:00 às 18:00)
-- O id_colaborador dele é 1
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida) VALUES 
(1, 'Segunda', '09:00:00', '18:00:00'),
(1, 'Terça', '09:00:00', '18:00:00'),
(1, 'Quarta', '09:00:00', '18:00:00'),
(1, 'Quinta', '09:00:00', '18:00:00'),
(1, 'Sexta', '09:00:00', '18:00:00');

-- 5. Marcar Férias para o Veterinário (1 a 5 de Junho de 2026)
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (1, '2026-06-01', '2026-06-05', 'Ferias', 'Férias de Verão');

-- 1. Criar o Veterinário
INSERT INTO public.veterinario (nome, morada, contacto, email, nif, especialidade) 
VALUES ('Dr. Teste', 'Rua da Clínica', 930000001, 'teste@vet.com', 200000001, 'Cirurgia');

-- 2. Criar o Login do Colaborador
INSERT INTO public.login_colaborador (nome, email, palavra_passe, telemovel, morada, nif, cargo) 
VALUES ('Dr. Teste', 'teste@vet.com', 'pass123', 930000001, 'Rua da Clínica', 200000001, 'Veterinário');

-- 3. Ligar ambos na tabela Colaborador (Fica com o id_colaborador = 1)
INSERT INTO public.colaborador (id_login_colaborador, id_veterinario) 
VALUES (1, 1);

-- Vai funcionar perfeitamente: Férias de 1 a 10 de Maio de 2026
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (1, '2026-05-01', '2026-05-10', 'Ferias', 'Férias da Primavera');
**************************************************************************************************
-- DEVE FALHAR: Tenta marcar para o ano 2020 (passado)
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2020-05-10 10:00:00', 'Checkup rotina');

-- DEVE FALHAR: O horário é até às 18:00, mas a consulta começa às 18:30
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-06-08 18:30:00', 'Urgência');

-- DEVE FUNCIONAR: Dia 8 de Junho de 2026 (Segunda), às 10:00. Não está de férias e está no horário.
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-06-08 10:00:00', 'Consulta normal');

-- DEVE FALHAR: Tenta marcar para as 10:15 do mesmo dia, mas a consulta anterior (das 10:00) dura 30 mins!
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-06-08 10:15:00', 'Outro animal');
**************************************************************************************************
-- O trigger vai bloquear porque o dia 5 está dentro das férias!
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (1, '2026-05-05', '2026-05-06', 'Folgas', 'Folga extra');

-- O trigger vai bloquear porque o dia 10 já está ocupado pelas férias anteriores!
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (1, '2026-04-25', '2026-05-02', 'Ferias', 'Férias antecipadas');

**************************************************************************************************
-- 1. Criar o Funcionário
INSERT INTO public.funcionario (nome, morada, contacto, email, nif, cargo) 
VALUES ('João Rececionista', 'Rua da Receção', 910000002, 'joao@clinica.com', 200000002, 'Rececionista');

-- 2. Criar o Login do Colaborador
INSERT INTO public.login_colaborador (nome, email, palavra_passe, telemovel, morada, nif, cargo) 
VALUES ('João Rececionista', 'joao@clinica.com', 'pass456', 910000002, 'Rua da Receção', 200000002, 'Funcionario');

-- 3. Ligar ambos na tabela Colaborador (Vamos assumir que este ganha o id_colaborador = 2)
INSERT INTO public.colaborador (id_login_colaborador, id_funcionario) 
VALUES (
    (SELECT id_login_colaborador FROM public.login_colaborador WHERE nif = 200000002 LIMIT 1),
    (SELECT id_funcionario FROM public.funcionario WHERE nif = 200000002 LIMIT 1)
);



**************************************************************************************************

-- Vai funcionar perfeitamente: Férias de 1 a 15 de Agosto de 2026
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (2, '2026-08-01', '2026-08-15', 'Ferias', 'Férias de Verão do João');


-- O trigger vai bloquear porque o dia 10 está dentro das férias!
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (2, '2026-08-10', '2026-08-11', 'Folgas', 'Tentativa de folga extra');


-- O trigger vai bloquear porque os dias 14 e 15 já estão ocupados!
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (2, '2026-08-14', '2026-08-20', 'Ferias', 'Tentativa de esticar férias');


-- Vai funcionar! O Filtro 1 ignora 'Falta' e 'Atraso'.
INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
VALUES (2, '2026-08-05', '2026-08-05', 'Atraso', 'Sistema não bloqueia atrasos nas férias');


-- Vai funcionar! A tua regra do OLD garante que ele não choca consigo mesmo.
UPDATE public.ocorrencia_laboral 
SET observacoes = 'Férias de Verão do João (Aprovadas pela gerência)'
WHERE id_colaborador = 2 AND data_inicio = '2026-08-01';

**************************************************************************************************

INSERT INTO login_cliente 
(nome, email, palavra_passe, telemovel, data_nascimento, morada, nif)
VALUES
('Carlos Mendes', 'carlos@gmail.com', 'pass123', 955555555, '1995-03-15', 'Braga', 333444555);


INSERT INTO cliente 
(id_login_cliente, nome, morada, email, nif, contacto)
VALUES
(1, 'Carlos Mendes', 'Braga', 'carlos@gmail.com', 333444555, 955555555);


INSERT INTO animal 
(id_cliente, nome, especie, raca, sexo, data_nascimento, estado)
VALUES
(1, 'Rex', 'Cão', 'Labrador', 'M', '2020-06-01', 'Domestico'),
(1, 'Mia', 'Gato', 'Siamês', 'F', '2022-01-10', 'Adotado');

INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
(1, 'Segunda', '09:00', '18:00'),
(1, 'Terça', '09:00', '18:00'),
(1, 'Quarta', '09:00', '18:00'),
(1, 'Quinta', '09:00', '18:00'),
(1, 'Sexta', '09:00', '18:00'),
(1, 'Sábado', '09:00', '13:00');

INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
(2, 'Segunda', '09:00', '18:00'),
(2, 'Terça', '09:00', '18:00'),
(2, 'Quarta', '09:00', '18:00'),
(2, 'Quinta', '09:00', '18:00'),
(2, 'Sexta', '09:00', '18:00'),
(2, 'Sábado', '09:00', '13:00');




-- Marcamos para as 10:00 em ponto.
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-05-09 10:00:00', 'Vacina Anual do Rex');


-- O sistema tem de bloquear porque assumimos que a consulta das 10:00 dura até às 10:30.
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-05-09 10:15:00', 'Verificação de peso do Rex');


-- Vai funcionar! A primeira consulta do Rex terminou às 10:30, logo ele já está livre para a próxima.
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (1, 1, '2026-05-09 10:30:00', 'Tosquia do Rex');


-- Vai funcionar perfeitamente, mesmo sendo às 10:15, porque a Mia (ID 2) é OUTRO animal!
INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo) 
VALUES (2, 1, '2026-05-09 10:15:00', 'Consulta de rotina da Mia');








-- Deve gravar sem problemas. O turno é das 09:00 às 13:00.
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES (1, 'Segunda', '09:00', '13:00');


-- Vai disparar o teu RAISE EXCEPTION! 
-- Ele tenta entrar às 12:00, mas o turno anterior só acaba às 13:00.
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES (1, 'Segunda', '12:00', '18:00');


-- Vai funcionar! A matemática do "< e >" permite que o turno da tarde 
-- comece exatamente à mesma hora em que o da manhã acaba (13:00).
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES (1, 'Segunda', '13:00', '18:00');


-- Funciona perfeitamente porque a função também filtra pelo NEW.dia_semana.
-- À Terça-feira o calendário dele ainda está limpo!
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES (1, 'Terça', '09:00', '13:00');









INSERT INTO public.horario_clinica (dia_semana, hora_abertura, hora_fecho)
VALUES ('Segunda', '09:00', '18:00');
INSERT INTO public.horario_clinica (dia_semana, hora_abertura, hora_fecho)
VALUES ('Quarta', '09:00', '18:00');

-- Logins
INSERT INTO public.login_colaborador (nome, email, palavra_passe, telemovel, morada, nif, cargo)
VALUES 
('Dr. João Silva', 'joao@vet.pt', '123', 911111111, 'Rua A', 111111111, 'Veterinário'),
('Ana Auxiliar', 'ana@vet.pt', '123', 922222222, 'Rua B', 222222222, 'Funcionario');

-- Entidades específicas
INSERT INTO public.veterinario (nome, morada, contacto, email, nif, especialidade)
VALUES ('Dr. João Silva', 'Rua A', 911111111, 'joao@vet.pt', 111111111, 'Cirurgia');

INSERT INTO public.funcionario (nome, morada, email, nif, contacto, cargo)
VALUES ('Ana Auxiliar', 'Rua B', 'ana@vet.pt', 222222222, 922222222, 'Rececionista');

-- Ligar na tabela Colaborador (IDs costumam ser 1 e 2 se for base de dados limpa)
INSERT INTO public.colaborador (id_login_colaborador, id_veterinario) VALUES (1, 1);
INSERT INTO public.colaborador (id_login_colaborador, id_funcionario) VALUES (2, 1);



-- Adicionar turnos da tarde
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES 
(1, 'Segunda', '09:00', '18:00'), -- João continua à tarde
(2, 'Segunda', '09:00', '18:00'); -- Ana continua à tarde

-- TESTAR (Deve dar SUCESSO)
SELECT public.verificar_escalas_dia('Segunda');
-- TESTAR (Deve dar RAISE EXCEPTION 'Escala Inválida')
SELECT public.verificar_escalas_dia('Segunda');


************************************************************************************
--LOGON COLAORADOR
*************************************************************************************
-- ==========================================
-- 3. INSERIR DADOS PARA TESTAR
-- ==========================================
-- Vamos criar duas contas de colaborador diferentes para brincar
INSERT INTO public.login_colaborador (email, palavra_passe) 
VALUES ('joao.vet@clinica.pt', 'senha123');

INSERT INTO public.login_colaborador (email, palavra_passe) 
VALUES ('admin@clinica.pt', 'admin2024');

SELECT public.realizar_login_colab('joao.vet@clinica.pt', 'senha123');
-- Sucesso! Vai retornar 1

SELECT public.realizar_login_colab('joao.vet@clinica.pt', 'batata');
-- Não devolve nada (ID vazio), e a aplicação sabe que as credenciais falharam.

SELECT public.realizar_login_colab('joao.vet@clinica.pt', 'senha123');
-- Erro: "Acesso negado: O colaborador já possui uma sessão ativa."

SELECT public.realizar_login_colab('admin@clinica.pt', 'admin2024');
-- Sucesso! Vai retornar 2. O Admin entra sem problemas porque o bloqueio é apenas para o ID 1.

SELECT public.realizar_logout_colab(2)
SELECT public.alterar_palavra_passe_colab
(2, 'admin2024', 'dri')
SELECT public.alterar_email_colaborador(
   2, 
    'admin2024', 
    'admin@clinica.pt', 
    'emailnovo@gmail.pt'
)
select *
from public.login_colaborador

select *
from public.logs

SELECT public.alterar_estado_conta_colab(2, TRUE);


SELECT public.logout_dispositivo_colab(
    2,
    1
)

SELECT public.logout_todas_sessoes_colab(
    2
)

SELECT funcao_email_existe('admi@clinica.pt')

INSERT INTO public.login_cliente (email, palavra_passe) 
VALUES ('admin@clinica.pt', 'admin2024');

public.bloquear_email_duplicado_trigger

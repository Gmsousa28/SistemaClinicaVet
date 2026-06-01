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
	public.horario_clinica,
	public.alerta,
	public.logs,
	public.servicos
	RESTART IDENTITY CASCADE;
	
	
-- 1. CLÍNICA E LOGINS
INSERT INTO public.horario_clinica (dia_semana, hora_abertura, hora_fecho) VALUES 
('Segunda', '08:00', '22:00'), ('Terça', '08:00', '22:00'), ('Quarta', '08:00', '22:00'),
('Quinta', '08:00', '22:00'), ('Sexta', '08:00', '22:00'), ('Sábado', '09:00', '20:00'), ('Domingo', '10:00', '18:00');

INSERT INTO public.login_colaborador (id_login_colaborador, email, palavra_passe, conta_ativa) VALUES 
(1, 'admin@vidaanimal.pt', 'pass123', true), (2, 'carlos.vet@vidaanimal.pt', 'pass123', true),
(3, 'ana.vet@vidaanimal.pt', 'pass123', true), (4, 'joao.vet@vidaanimal.pt', 'pass123', true),
(5, 'maria.vet@vidaanimal.pt', 'pass123', true), (6, 'pedro.func@vidaanimal.pt', 'pass123', true),
(7, 'sofia.func@vidaanimal.pt', 'pass123', true), (8, 'rita.func@vidaanimal.pt', 'pass123', true),
(9, 'tiago.func@vidaanimal.pt', 'pass123', true), (10, 'hugo.func@vidaanimal.pt', 'pass123', false);

INSERT INTO public.login_cliente (id_login_cliente, email, palavra_passe, conta_ativa) VALUES 
(1, 'rui.costa@email.com', 'pwd123', true), (2, 'ines.silva@email.com', 'pwd123', true),
(3, 'miguel.tomas@email.com', 'pwd123', true), (4, 'sara.lopes@email.com', 'pwd123', true),
(5, 'bruno.fernandes@email.com', 'pwd123', true), (6, 'catarina.mendes@email.com', 'pwd123', true),
(7, 'diogo.ribeiro@email.com', 'pwd123', true), (8, 'joana.almeida@email.com', 'pwd123', true),
(9, 'luis.marques@email.com', 'pwd123', true), (10, 'patricia.gomes@email.com', 'pwd123', true),
(11, 'nuno.rodrigues@email.com', 'pwd123', true), (12, 'teresa.faria@email.com', 'pwd123', false),
(13, 'c13@email.com', 'pwd123', true), (14, 'c14@email.com', 'pwd123', true), (15, 'c15@email.com', 'pwd123', true),
(16, 'c16@email.com', 'pwd123', true), (17, 'c17@email.com', 'pwd123', true), (18, 'c18@email.com', 'pwd123', true),
(19, 'c19@email.com', 'pwd123', true), (20, 'c20@email.com', 'pwd123', true), (21, 'c21@email.com', 'pwd123', true),
(22, 'c22@email.com', 'pwd123', true), (23, 'c23@email.com', 'pwd123', true), (24, 'c24@email.com', 'pwd123', true),
(25, 'c25@email.com', 'pwd123', true), (26, 'c26@email.com', 'pwd123', true), (27, 'c27@email.com', 'pwd123', true),
(28, 'c28@email.com', 'pwd123', true), (29, 'c29@email.com', 'pwd123', true), (30, 'c30@email.com', 'pwd123', true),
(31, 'c31@email.com', 'pwd123', true), (32, 'c32@email.com', 'pwd123', true), (33, 'c33@email.com', 'pwd123', true),
(34, 'c34@email.com', 'pwd123', true), (35, 'c35@email.com', 'pwd123', true), (36, 'c36@email.com', 'pwd123', true),
(37, 'c37@email.com', 'pwd123', true), (38, 'c38@email.com', 'pwd123', true), (39, 'c39@email.com', 'pwd123', true),
(40, 'c40@email.com', 'pwd123', true), (41, 'c41@email.com', 'pwd123', true), (42, 'c42@email.com', 'pwd123', true),
(43, 'c43@email.com', 'pwd123', true), (44, 'c44@email.com', 'pwd123', true), (45, 'c45@email.com', 'pwd123', true),
(46, 'c46@email.com', 'pwd123', true), (47, 'c47@email.com', 'pwd123', true), (48, 'c48@email.com', 'pwd123', true),
(49, 'c49@email.com', 'pwd123', true), (50, 'c50@email.com', 'pwd123', true), (51, 'c51@email.com', 'pwd123', true),
(52, 'c52@email.com', 'pwd123', true), (53, 'c53@email.com', 'pwd123', true), (54, 'c54@email.com', 'pwd123', true),
(55, 'c55@email.com', 'pwd123', true), (56, 'c56@email.com', 'pwd123', true), (57, 'c57@email.com', 'pwd123', true),
(58, 'c58@email.com', 'pwd123', true), (59, 'c59@email.com', 'pwd123', true), (60, 'c60@email.com', 'pwd123', true),
(61, 'c61@email.com', 'pwd123', true), (62, 'c62@email.com', 'pwd123', true);

-- 2. MEDICAMENTOS, EXAMES E EQUIPA
INSERT INTO public.medicamento (id_medicamento, nome) VALUES 
(1, 'Bravecto 10-20kg'), (2, 'Bravecto 20-40kg'), (3, 'Milbemax Cães'), (4, 'Milbemax Gatos'),
(5, 'Meloxicam 1.5mg/ml'), (6, 'Amoxicilina 250mg'), (7, 'Synulox 50mg'), (8, 'Synulox 250mg'),
(9, 'Apoquel 16mg'), (10, 'Apoquel 5.4mg'), (11, 'Cerenia 16mg'), (12, 'Vetmedin 5mg'),
(13, 'Clorexidina Champô'), (14, 'NexGard Spectra S'), (15, 'NexGard Spectra M');

INSERT INTO public.exame (id_exame, nome, valor_cobrado) VALUES 
(1, 'Hemograma Completo', 45.00), (2, 'Bioquímica Sanguínea (12 parâmetros)', 60.00),
(3, 'Bioquímica Sanguínea (17 parâmetros)', 80.00), (4, 'Ecografia Abdominal', 75.00),
(5, 'Ecocardiograma', 90.00), (6, 'Raio-X Tórax (2 incidências)', 65.00),
(7, 'Raio-X Membros', 50.00), (8, 'Teste Rápido Leishmaniose', 25.00),
(9, 'Teste Rápido FIV/FeLV', 30.00), (10, 'Análise de Urina', 20.00),
(11, 'Citologia Cutânea', 35.00), (12, 'Biópsia', 120.00);

-- ADICIONADO O FUNCIONÁRIO 6 (ADMIN) PARA NÃO QUEBRAR A CONSTRAINT!
INSERT INTO public.funcionario (id_funcionario, nome, morada, email, nif, contacto, cargo) VALUES 
(1, 'Pedro Soares', 'Rua A, 1', 'pedro.func@vidaanimal.pt', 220000001, 910000001, 'Rececionista'),
(2, 'Sofia Reis', 'Rua B, 2', 'sofia.func@vidaanimal.pt', 220000002, 910000002, 'Groomer'),
(3, 'Rita Sousa', 'Rua C, 3', 'rita.func@vidaanimal.pt', 220000003, 910000003, 'Auxiliar Veterinária'),
(4, 'Tiago Mendes', 'Rua D, 4', 'tiago.func@vidaanimal.pt', 220000004, 910000004, 'Auxiliar Veterinário'),
(5, 'Hugo Lima', 'Rua E, 5', 'hugo.func@vidaanimal.pt', 220000005, 910000005, 'Estagiário'),
(6, 'Administrador', 'Sede', 'admin@vidaanimal.pt', 999999999, 999999999, 'Administração');

INSERT INTO public.veterinario (id_veterinario, nome, morada, contacto, email, nif, especialidade) VALUES 
(1, 'Dr. Carlos Neves', 'Av 1', 920000001, 'carlos.vet@vidaanimal.pt', 230000001, 'Clínica Geral'),
(2, 'Dra. Ana Pinto', 'Av 2', 920000002, 'ana.vet@vidaanimal.pt', 230000002, 'Cirurgia e Ortopedia'),
(3, 'Dr. João Martins', 'Av 3', 920000003, 'joao.vet@vidaanimal.pt', 230000003, 'Dermatologia'),
(4, 'Dra. Maria Castro', 'Av 4', 920000004, 'maria.vet@vidaanimal.pt', 230000004, 'Cardiologia e Ecografia');

-- ADICIONADA A COLUNA CARGO E O ADMIN NA LINHA 10
INSERT INTO public.colaborador (id_colaborador, id_login_colaborador, id_funcionario, id_veterinario, cargo) VALUES 
(1, 2, NULL, 1, 'Veterinário'), 
(2, 3, NULL, 2, 'Veterinário'), 
(3, 4, NULL, 3, 'Veterinário'), 
(4, 5, NULL, 4, 'Veterinário'), 
(5, 6, 1, NULL, 'Funcionário'), 
(6, 7, 2, NULL, 'Funcionário'), 
(7, 8, 3, NULL, 'Funcionário'), 
(8, 9, 4, NULL, 'Funcionário'), 
(9, 10, 5, NULL, 'Funcionário'),
(10, 1, 6, NULL, 'Admin'); 

-- 3. CLIENTES UNIFICADOS
INSERT INTO public.cliente (id_cliente, id_login_cliente, nome, morada, email, nif, contacto) VALUES 
(1, 1, 'Rui Costa', 'Rua X 10', 'rui.costa@email.com', 250000001, 930000001),
(2, 2, 'Inês Silva', 'Rua Y 20', 'ines.silva@email.com', 250000002, 930000002),
(3, 3, 'Miguel Tomás', 'Rua Z 30', 'miguel.tomas@email.com', 250000003, 930000003),
(4, 4, 'Sara Lopes', 'Rua W 40', 'sara.lopes@email.com', 250000004, 930000004),
(5, 5, 'Bruno Fernandes', 'Rua V 50', 'bruno.fernandes@email.com', 250000005, 930000005),
(6, 6, 'Catarina Mendes', 'Rua U 60', 'catarina.mendes@email.com', 250000006, 930000006),
(7, 7, 'Diogo Ribeiro', 'Rua T 70', 'diogo.ribeiro@email.com', 250000007, 930000007),
(8, 8, 'Joana Almeida', 'Rua S 80', 'joana.almeida@email.com', 250000008, 930000008),
(9, 9, 'Luís Marques', 'Rua R 90', 'luis.marques@email.com', 250000009, 930000009),
(10, 10, 'Patrícia Gomes', 'Rua Q 100', 'patricia.gomes@email.com', 250000010, 930000010),
(11, 13, 'Cliente 11', 'Rua A', 'c13@email.com', 260000011, 940000011), (12, 14, 'Cliente 12', 'Rua B', 'c14@email.com', 260000012, 940000012),
(13, 15, 'Cliente 13', 'Rua C', 'c15@email.com', 260000013, 940000013), (14, 16, 'Cliente 14', 'Rua D', 'c16@email.com', 260000014, 940000014),
(15, 17, 'Cliente 15', 'Rua E', 'c17@email.com', 260000015, 940000015), (16, 18, 'Cliente 16', 'Rua F', 'c18@email.com', 260000016, 940000016),
(17, 19, 'Cliente 17', 'Rua G', 'c19@email.com', 260000017, 940000017), (18, 20, 'Cliente 18', 'Rua H', 'c20@email.com', 260000018, 940000018),
(19, 21, 'Cliente 19', 'Rua I', 'c21@email.com', 260000019, 940000019), (20, 22, 'Cliente 20', 'Rua J', 'c22@email.com', 260000020, 940000020),
(21, 23, 'Cliente 21', 'Rua K', 'c23@email.com', 260000021, 940000021), (22, 24, 'Cliente 22', 'Rua L', 'c24@email.com', 260000022, 940000022),
(23, 25, 'Cliente 23', 'Rua M', 'c25@email.com', 260000023, 940000023), (24, 26, 'Cliente 24', 'Rua N', 'c26@email.com', 260000024, 940000024),
(25, 27, 'Cliente 25', 'Rua O', 'c27@email.com', 260000025, 940000025), (26, 28, 'Cliente 26', 'Rua P', 'c28@email.com', 260000026, 940000026),
(27, 29, 'Cliente 27', 'Rua Q', 'c29@email.com', 260000027, 940000027), (28, 30, 'Cliente 28', 'Rua R', 'c30@email.com', 260000028, 940000028),
(29, 31, 'Cliente 29', 'Rua S', 'c31@email.com', 260000029, 940000029), (30, 32, 'Cliente 30', 'Rua T', 'c32@email.com', 260000030, 940000030),
(31, 33, 'Cliente 31', 'Rua U', 'c33@email.com', 260000031, 940000031), (32, 34, 'Cliente 32', 'Rua V', 'c34@email.com', 260000032, 940000032),
(33, 35, 'Cliente 33', 'Rua W', 'c35@email.com', 260000033, 940000033), (34, 36, 'Cliente 34', 'Rua X', 'c36@email.com', 260000034, 940000034),
(35, 37, 'Cliente 35', 'Rua Y', 'c37@email.com', 260000035, 940000035), (36, 38, 'Cliente 36', 'Rua Z', 'c38@email.com', 260000036, 940000036),
(37, 39, 'Cliente 37', 'Rua AA', 'c39@email.com', 260000037, 940000037), (38, 40, 'Cliente 38', 'Rua BB', 'c40@email.com', 260000038, 940000038),
(39, 41, 'Cliente 39', 'Rua CC', 'c41@email.com', 260000039, 940000039), (40, 42, 'Cliente 40', 'Rua DD', 'c42@email.com', 260000040, 940000040),
(41, 43, 'Cliente 41', 'Rua EE', 'c43@email.com', 260000041, 940000041), (42, 44, 'Cliente 42', 'Rua FF', 'c44@email.com', 260000042, 940000042),
(43, 45, 'Cliente 43', 'Rua GG', 'c45@email.com', 260000043, 940000043), (44, 46, 'Cliente 44', 'Rua HH', 'c46@email.com', 260000044, 940000044),
(45, 47, 'Cliente 45', 'Rua II', 'c47@email.com', 260000045, 940000045), (46, 48, 'Cliente 46', 'Rua JJ', 'c48@email.com', 260000046, 940000046),
(47, 49, 'Cliente 47', 'Rua KK', 'c49@email.com', 260000047, 940000047), (48, 50, 'Cliente 48', 'Rua LL', 'c50@email.com', 260000048, 940000048),
(49, 51, 'Cliente 49', 'Rua MM', 'c51@email.com', 260000049, 940000049), (50, 52, 'Cliente 50', 'Rua NN', 'c52@email.com', 260000050, 940000050),
(51, 53, 'Cliente 51', 'Rua OO', 'c53@email.com', 260000051, 940000051), (52, 54, 'Cliente 52', 'Rua PP', 'c54@email.com', 260000052, 940000052),
(53, 55, 'Cliente 53', 'Rua QQ', 'c55@email.com', 260000053, 940000053), (54, 56, 'Cliente 54', 'Rua RR', 'c56@email.com', 260000054, 940000054),
(55, 57, 'Cliente 55', 'Rua SS', 'c57@email.com', 260000055, 940000055), (56, 58, 'Cliente 56', 'Rua TT', 'c58@email.com', 260000056, 940000056),
(57, 59, 'Cliente 57', 'Rua UU', 'c59@email.com', 260000057, 940000057), (58, 60, 'Cliente 58', 'Rua VV', 'c60@email.com', 260000058, 940000058),
(59, 61, 'Cliente 59', 'Rua WW', 'c61@email.com', 260000059, 940000059), (60, 62, 'Cliente 60', 'Rua XX', 'c62@email.com', 260000060, 940000060);

-- 4. OCORRÊNCIAS E HORÁRIOS
INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida) VALUES 
(1, 'Segunda', '08:00', '16:00'), (1, 'Terça', '08:00', '16:00'), (1, 'Quarta', '08:00', '16:00'),
(2, 'Quinta', '14:00', '22:00'), (2, 'Sexta', '14:00', '22:00'), (2, 'Sábado', '09:00', '20:00'),
(5, 'Segunda', '08:00', '17:00'), (5, 'Terça', '08:00', '17:00'), (5, 'Quarta', '08:00', '17:00');

INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) VALUES 
(1, '2023-12-24', '2023-12-31', 'Ferias', 'Férias de Natal'),
(5, '2024-01-10', '2024-01-10', 'Falta', 'Doença'),
(2, '2024-02-15', '2024-02-16', 'Folgas', 'Compensação de banco de horas');

-- 5. ANIMAIS UNIFICADOS
INSERT INTO public.animal (id_animal, id_cliente, nome, especie, raca, sexo, data_nascimento, estado) VALUES 
(1, 1, 'Max', 'Cão', 'Labrador Retriever', 'M', '2018-05-12', 'Domestico'), (2, 1, 'Bella', 'Cão', 'Bulldog Francês', 'F', '2020-08-22', 'Domestico'),
(3, 2, 'Luna', 'Gato', 'Europeu Comum', 'F', '2019-03-10', 'Domestico'), (4, 2, 'Simba', 'Gato', 'Siamês', 'M', '2021-07-05', 'Domestico'),
(5, 3, 'Rocky', 'Cão', 'Pastor Alemão', 'M', '2017-11-30', 'Domestico'), (6, 4, 'Milo', 'Cão', 'Beagle', 'M', '2022-01-15', 'Domestico'),
(7, 4, 'Coco', 'Cão', 'Poodle', 'F', '2016-09-08', 'Domestico'), (8, 5, 'Nina', 'Gato', 'Persa', 'F', '2015-04-20', 'Domestico'),
(9, 6, 'Kira', 'Cão', 'Husky Siberiano', 'F', '2019-12-01', 'Domestico'), (10, 7, 'Leo', 'Gato', 'Maine Coon', 'M', '2021-02-18', 'Domestico'),
(11, 8, 'Thor', 'Cão', 'Rottweiler', 'M', '2020-10-10', 'Domestico'), (12, 9, 'Mia', 'Gato', 'Europeu Comum', 'F', '2023-05-01', 'Resgatado'),
(13, 9, 'Toby', 'Cão', 'Rafeiro Alentejano', 'M', '2023-06-15', 'Adotado'), (14, 10, 'Bolinha', 'Hamster', 'Sírio', 'M', '2023-01-10', 'Domestico'),
(15, 1, 'Rex', 'Cão', 'Doberman', 'M', '2010-02-14', 'Morto'), (16, 11, 'Bobi', 'Cão', 'Comum', 'M', '2021-01-10', 'Domestico'), 
(17, 12, 'Tareco', 'Gato', 'Siamês', 'M', '2020-05-12', 'Domestico'), (18, 13, 'Princesa', 'Cão', 'Pug', 'F', '2019-11-20', 'Domestico'), 
(19, 14, 'Farrusco', 'Cão', 'Labrador', 'M', '2022-03-15', 'Domestico'), (20, 15, 'Mingau', 'Gato', 'Persa', 'M', '2018-08-30', 'Domestico'), 
(21, 16, 'Mel', 'Cão', 'Golden Retriever', 'F', '2021-06-14', 'Domestico'), (22, 17, 'Tobias', 'Gato', 'Comum', 'M', '2023-01-05', 'Adotado'), 
(23, 18, 'Kiko', 'Cão', 'Beagle', 'M', '2017-09-22', 'Domestico'), (24, 19, 'Bolinha', 'Cão', 'Bichon Frisé', 'F', '2020-12-01', 'Domestico'), 
(25, 20, 'Félix', 'Gato', 'Bosques da Noruega', 'M', '2019-07-11', 'Domestico'), (26, 21, 'Lassie', 'Cão', 'Collie', 'F', '2016-04-18', 'Morto'), 
(27, 22, 'Faísca', 'Cão', 'Dálmata', 'M', '2021-10-25', 'Domestico'), (28, 23, 'Riscas', 'Gato', 'Europeu', 'M', '2022-05-09', 'Domestico'), 
(29, 24, 'Estrela', 'Gato', 'Sphynx', 'F', '2023-02-14', 'Domestico'), (30, 25, 'Piloto', 'Cão', 'Pastor Alemão', 'M', '2015-11-11', 'Domestico'), 
(31, 26, 'Nero', 'Cão', 'Rottweiler', 'M', '2018-02-28', 'Domestico'), (32, 27, 'Bidu', 'Cão', 'Pinscher', 'M', '2020-08-08', 'Domestico'), 
(33, 28, 'Mia', 'Gato', 'Bengal', 'F', '2021-04-30', 'Domestico'), (34, 29, 'Chico', 'Cão', 'Chihuahua', 'M', '2019-12-12', 'Domestico'), 
(35, 30, 'Simba', 'Gato', 'Maine Coon', 'M', '2022-09-01', 'Domestico'), (36, 31, 'Thor', 'Cão', 'Bulldog Inglês', 'M', '2017-06-15', 'Domestico'), 
(37, 32, 'Lola', 'Cão', 'Basset Hound', 'F', '2020-03-22', 'Domestico'), (38, 33, 'Nina', 'Gato', 'Ragdoll', 'F', '2018-01-19', 'Domestico'), 
(39, 34, 'Max', 'Cão', 'Husky Siberiano', 'M', '2021-11-05', 'Domestico'), (40, 35, 'Belinha', 'Cão', 'Shih Tzu', 'F', '2019-05-25', 'Domestico'), 
(41, 36, 'Garfield', 'Gato', 'Persa', 'M', '2016-10-10', 'Morto'), (42, 37, 'Snoopy', 'Cão', 'Beagle', 'M', '2022-07-07', 'Domestico'), 
(43, 38, 'Mimi', 'Gato', 'Comum', 'F', '2023-03-03', 'Domestico'), (44, 39, 'Rex', 'Cão', 'Boxer', 'M', '2018-09-14', 'Domestico'), 
(45, 40, 'Luna', 'Cão', 'Samoiedo', 'F', '2020-12-20', 'Domestico'), (46, 41, 'Pantufa', 'Gato', 'Siamês', 'F', '2021-08-18', 'Domestico'), 
(47, 42, 'Ruca', 'Cão', 'Rafeiro', 'M', '2017-04-04', 'Domestico'), (48, 43, 'Maggie', 'Cão', 'Pug', 'F', '2019-02-12', 'Domestico'), 
(49, 44, 'Oscar', 'Gato', 'Europeu', 'M', '2022-06-25', 'Domestico'), (50, 45, 'Zeus', 'Cão', 'Doberman', 'M', '2015-07-30', 'Domestico'), 
(51, 46, 'Kyra', 'Cão', 'Pitbull', 'F', '2020-01-22', 'Domestico'), (52, 47, 'Pompom', 'Coelho', 'Anão', 'M', '2023-05-15', 'Domestico'), 
(53, 48, 'Floco', 'Cão', 'Maltês', 'M', '2018-10-05', 'Domestico'), (54, 49, 'Suzi', 'Cão', 'Cocker Spaniel', 'F', '2021-03-28', 'Domestico'), 
(55, 50, 'Salem', 'Gato', 'Bombaim', 'M', '2019-11-11', 'Domestico'), (56, 51, 'Bambi', 'Cão', 'Galgo', 'F', '2022-02-02', 'Domestico'), 
(57, 52, 'Fred', 'Pássaro', 'Canário', 'M', '2023-08-10', 'Domestico'), (58, 53, 'Lilly', 'Gato', 'Angorá', 'F', '2017-06-06', 'Morto'), 
(59, 54, 'Rocky', 'Cão', 'Staffordshire', 'M', '2020-09-19', 'Domestico'), (60, 55, 'Pipoca', 'Cão', 'Chihuahua', 'F', '2021-12-24', 'Domestico'), 
(61, 56, 'Tom', 'Gato', 'Comum', 'M', '2018-04-14', 'Domestico'), (62, 57, 'Jerry', 'Hamster', 'Sírio', 'M', '2023-10-31', 'Domestico'), 
(63, 58, 'Zorro', 'Cão', 'Cão de Água', 'M', '2019-07-27', 'Domestico'), (64, 59, 'Ariel', 'Gato', 'Sagrado da Birmânia', 'F', '2022-01-09', 'Domestico'), 
(65, 60, 'Sasha', 'Cão', 'São Bernardo', 'F', '2016-08-21', 'Domestico'), (66, 1, 'Jack', 'Cão', 'Jack Russell', 'M', '2020-11-15', 'Domestico'), 
(67, 2, 'Cleo', 'Gato', 'Sphynx', 'F', '2021-05-05', 'Domestico'), (68, 3, 'Tico', 'Pássaro', 'Caturra', 'M', '2023-02-20', 'Domestico'), 
(69, 4, 'Bolinha', 'Cão', 'Bulldog Francês', 'F', '2019-10-10', 'Domestico'), (70, 5, 'Dexter', 'Gato', 'Maine Coon', 'M', '2018-03-03', 'Domestico'), 
(71, 6, 'Mika', 'Cão', 'Akita', 'F', '2022-09-09', 'Domestico'), (72, 7, 'Zeca', 'Cão', 'Pinscher', 'M', '2017-12-12', 'Domestico'), 
(73, 8, 'Fiona', 'Gato', 'Persa', 'F', '2020-04-24', 'Domestico'), (74, 9, 'Bruno', 'Cão', 'Labrador', 'M', '2015-01-01', 'Morto'), 
(75, 10, 'Melody', 'Cão', 'Yorkshire', 'F', '2021-07-17', 'Domestico'), (76, 11, 'Oliver', 'Gato', 'Comum', 'M', '2023-06-06', 'Adotado'), 
(77, 12, 'Panda', 'Cão', 'Border Collie', 'M', '2019-08-08', 'Domestico'), (78, 13, 'Roxy', 'Cão', 'Boxer', 'F', '2020-02-14', 'Domestico'), 
(79, 14, 'Boris', 'Gato', 'Europeu', 'M', '2018-11-11', 'Domestico'), (80, 15, 'Zoe', 'Cão', 'Poodle', 'F', '2022-03-30', 'Domestico'), 
(81, 16, 'Rufus', 'Cão', 'Golden Retriever', 'M', '2016-09-09', 'Domestico'), (82, 17, 'Lulu', 'Cão', 'Lulu da Pomerânia', 'F', '2021-10-10', 'Domestico'), 
(83, 18, 'Sam', 'Cão', 'Pastor Alemão', 'M', '2017-05-25', 'Domestico'), (84, 19, 'Nala', 'Gato', 'Siamês', 'F', '2020-12-12', 'Domestico'), 
(85, 20, 'Toby', 'Cão', 'Beagle', 'M', '2019-04-04', 'Domestico'), (86, 21, 'Chita', 'Cão', 'Dálmata', 'F', '2022-08-08', 'Domestico'), 
(87, 22, 'Ming', 'Gato', 'Bengal', 'F', '2018-07-07', 'Domestico'), (88, 23, 'Koda', 'Cão', 'Husky Siberiano', 'M', '2021-01-21', 'Domestico'), 
(89, 24, 'Pitoco', 'Cão', 'Chihuahua', 'M', '2023-11-11', 'Domestico'), (90, 25, 'Sofia', 'Cão', 'Shih Tzu', 'F', '2020-06-16', 'Domestico'), 
(91, 26, 'Tango', 'Gato', 'Bosques da Noruega', 'M', '2017-02-02', 'Domestico'), (92, 27, 'Maya', 'Cão', 'Samoiedo', 'F', '2022-05-20', 'Domestico'), 
(93, 28, 'Rex', 'Cão', 'Rafeiro', 'M', '2015-10-30', 'Morto'), (94, 29, 'Cacau', 'Cão', 'Pug', 'F', '2021-09-09', 'Domestico'), 
(95, 30, 'Leo', 'Gato', 'Comum', 'M', '2019-01-15', 'Domestico'), (96, 31, 'Apollo', 'Cão', 'Doberman', 'M', '2020-07-25', 'Domestico'), 
(97, 32, 'Dara', 'Cão', 'Pitbull', 'F', '2018-12-05', 'Domestico'), (98, 33, 'Bunny', 'Coelho', 'Anão', 'F', '2023-04-10', 'Domestico'), 
(99, 34, 'Neve', 'Cão', 'Maltês', 'M', '2021-03-03', 'Domestico'), (100, 35, 'Lady', 'Cão', 'Cocker Spaniel', 'F', '2019-08-14', 'Domestico'), 
(101, 36, 'Pantera', 'Gato', 'Bombaim', 'F', '2022-10-10', 'Domestico'), (102, 37, 'Flash', 'Cão', 'Galgo', 'M', '2020-11-20', 'Domestico'), 
(103, 38, 'Piu', 'Pássaro', 'Canário', 'M', '2023-07-07', 'Domestico'), (104, 39, 'Branca', 'Gato', 'Angorá', 'F', '2016-02-14', 'Morto'), 
(105, 40, 'Tyson', 'Cão', 'Staffordshire', 'M', '2021-05-15', 'Domestico'), (106, 41, 'Amora', 'Cão', 'Chihuahua', 'F', '2022-09-30', 'Domestico'), 
(107, 42, 'Garfield', 'Gato', 'Comum', 'M', '2019-06-20', 'Domestico'), (108, 43, 'Hamtaro', 'Hamster', 'Sírio', 'M', '2023-12-01', 'Domestico'), 
(109, 44, 'Bolas', 'Cão', 'Cão de Água', 'M', '2020-03-10', 'Domestico'), (110, 45, 'Cindy', 'Gato', 'Sagrado da Birmânia', 'F', '2018-10-25', 'Domestico'), 
(111, 46, 'Beethoven', 'Cão', 'São Bernardo', 'M', '2017-01-30', 'Domestico'), (112, 47, 'Pongo', 'Cão', 'Dálmata', 'M', '2021-08-08', 'Domestico'), 
(113, 48, 'Sissi', 'Gato', 'Persa', 'F', '2019-04-18', 'Domestico'), (114, 49, 'Lobo', 'Cão', 'Husky Siberiano', 'M', '2022-11-11', 'Domestico'), 
(115, 50, 'Fifi', 'Cão', 'Poodle', 'F', '2020-07-07', 'Domestico');

INSERT INTO public.resgate (id_resgate, id_animal, id_funcionario, data_resgate, idade) VALUES 
(1, 12, 4, '2023-08-01', 'Bebé'), (2, 13, 3, '2023-09-10', 'Juvenil');
INSERT INTO public.adocao (id_adocao, id_animal, id_funcionario, data_adocao) VALUES (1, 13, 1, '2023-10-05');

INSERT INTO public.logs (id_logs, data_hora_login, data_hora_logout, id_login_colaborador, id_login_cliente) VALUES 
(1, '2024-03-01 07:55:00', '2024-03-01 16:05:00', 2, NULL), (2, '2024-03-01 08:00:00', '2024-03-01 17:00:00', 6, NULL),
(3, '2024-03-01 10:30:00', '2024-03-01 10:45:00', NULL, 1), (4, '2024-03-01 14:20:00', '2024-03-01 14:35:00', NULL, 4);

-- 6. CONSULTAS UNIFICADAS
INSERT INTO public.consulta (id_consulta, id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco) VALUES 
(1, 1, 1, '2024-03-01 09:00:00', 'Vacinação Anual', 'Saudável. Vacinas em dia.', 'Realizado', 45.00),
(2, 3, 2, '2024-03-01 10:30:00', 'Gato coxo perna traseira', 'Fratura no fémur direito.', 'Realizado', 50.00),
(3, 5, 3, '2024-03-02 11:00:00', 'Queda de pelo intensa', 'Dermatite atópica.', 'Realizado', 45.00),
(4, 8, 4, '2024-03-02 14:30:00', 'Tosse e cansaço', 'Sopro cardíaco grau 3.', 'Realizado', 60.00),
(5, 11, 1, '2024-03-03 16:00:00', 'Vómitos e diarreia', 'Gastroenterite aguda.', 'Realizado', 45.00),
(6, 6, 1, '2024-03-04 09:30:00', 'Desparasitação', 'Desparasitação efetuada.', 'Realizado', 35.00),
(7, 2, 2, '2024-03-10 10:00:00', 'Check-up cirurgia', 'Recuperação impecável.', 'Agendado', 35.00),
(8, 7, 3, '2024-03-15 15:00:00', 'Otite recorrente', NULL, 'Agendado', 45.00),
(9, 10, 4, '2024-03-20 11:30:00', 'Apatia e falta de apetite', NULL, 'Agendado', 45.00),
(10, 9, 1, '2024-03-22 17:00:00', 'Check-up Geral', NULL, 'Cancelado', 35.00),
(11, 16, 1, '2024-04-05 09:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (12, 17, 2, '2024-04-10 10:30:00', 'Claudicação', 'Entorse', 'Realizado', 45.00),
(13, 18, 3, '2024-04-15 14:00:00', 'Dermatite', 'Alergia alimentar', 'Realizado', 45.00), (14, 19, 4, '2024-04-20 16:30:00', 'Sopro', 'Cardiomiopatia', 'Realizado', 60.00),
(15, 20, 1, '2024-05-02 09:30:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (16, 21, 2, '2024-05-08 11:00:00', 'Vómitos', 'Gastrite', 'Realizado', 45.00),
(17, 22, 3, '2024-05-12 15:30:00', 'Otite', 'Infeção fúngica', 'Realizado', 45.00), (18, 23, 4, '2024-05-18 09:00:00', 'Tosse', 'Bronquite', 'Realizado', 60.00),
(19, 24, 1, '2024-06-05 10:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (20, 25, 2, '2024-06-10 14:30:00', 'Ferida', 'Mordedura', 'Realizado', 50.00),
(21, 26, 3, '2024-06-15 16:00:00', 'Queda de pelo', 'Sarna', 'Realizado', 45.00), (22, 27, 4, '2024-06-20 09:30:00', 'Cansaço', 'Arritmia', 'Realizado', 60.00),
(23, 28, 1, '2024-07-02 11:30:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (24, 29, 2, '2024-07-08 15:00:00', 'Diarreia', 'Parasitas', 'Realizado', 45.00),
(25, 30, 3, '2024-07-12 09:00:00', 'Comichão', 'Pulgas', 'Realizado', 45.00), (26, 31, 4, '2024-07-18 10:30:00', 'Desmaio', 'Síncope', 'Realizado', 60.00),
(27, 32, 1, '2024-08-05 14:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (28, 33, 2, '2024-08-10 16:30:00', 'Coxear', 'Artrose', 'Realizado', 50.00),
(29, 34, 3, '2024-08-15 09:30:00', 'Vermelhidão', 'Alergia', 'Realizado', 45.00), (30, 35, 4, '2024-08-20 11:00:00', 'Sopro', 'Endocardiose', 'Realizado', 60.00),
(31, 36, 1, '2024-09-02 15:30:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (32, 37, 2, '2024-09-08 09:00:00', 'Dor abdominal', 'Cólica', 'Realizado', 45.00),
(33, 38, 3, '2024-09-12 10:00:00', 'Otite', 'Infeção bacteriana', 'Realizado', 45.00), (34, 39, 4, '2024-09-18 14:30:00', 'Tosse', 'Colapso traqueal', 'Realizado', 60.00),
(35, 40, 1, '2024-10-05 16:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (36, 41, 2, '2024-10-10 09:30:00', 'Ferida', 'Corte', 'Realizado', 50.00),
(37, 42, 3, '2024-10-15 11:30:00', 'Queda de pelo', 'Stress', 'Realizado', 45.00), (38, 43, 4, '2024-10-20 15:00:00', 'Cansaço', 'Insuficiência cardíaca', 'Realizado', 60.00),
(39, 44, 1, '2024-11-02 09:00:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (40, 45, 2, '2024-11-08 10:30:00', 'Vómitos', 'Corpo estranho', 'Realizado', 45.00),
(41, 46, 3, '2024-11-12 14:00:00', 'Comichão', 'Alergia picada de pulga', 'Realizado', 45.00), (42, 47, 4, '2024-11-18 16:30:00', 'Desmaio', 'Arritmia', 'Realizado', 60.00),
(43, 48, 1, '2024-12-05 09:30:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (44, 49, 2, '2024-12-10 11:00:00', 'Claudicação', 'Rutura ligamento', 'Realizado', 50.00),
(45, 50, 3, '2024-12-15 15:30:00', 'Dermatite', 'Atopia', 'Realizado', 45.00), (46, 51, 4, '2024-12-20 09:00:00', 'Sopro', 'Sopro funcional', 'Realizado', 60.00),
(47, 52, 1, '2024-04-06 10:00:00', 'Check-up exóticos', 'Saudável', 'Realizado', 35.00), (48, 53, 2, '2024-04-11 14:30:00', 'Diarreia', 'Gastroenterite', 'Realizado', 45.00),
(49, 54, 3, '2024-04-16 16:00:00', 'Otite', 'Ácaros', 'Realizado', 45.00), (50, 55, 4, '2024-04-21 09:30:00', 'Tosse', 'Asma felina', 'Realizado', 60.00),
(51, 56, 1, '2024-05-03 11:30:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (52, 57, 2, '2024-05-09 15:00:00', 'Asa partida', 'Fratura rádio', 'Realizado', 50.00),
(53, 58, 3, '2024-05-13 09:00:00', 'Queda de pelo', 'Fungo', 'Realizado', 45.00), (54, 59, 4, '2024-05-19 10:30:00', 'Cansaço', 'Anemia', 'Realizado', 60.00),
(55, 60, 1, '2024-06-06 14:00:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (56, 61, 2, '2024-06-11 16:30:00', 'Ferida no olho', 'Úlcera córnea', 'Realizado', 45.00),
(57, 62, 3, '2024-06-16 09:30:00', 'Comichão', 'Piolhos', 'Realizado', 45.00), (58, 63, 4, '2024-06-21 11:00:00', 'Desmaio', 'Convulsão', 'Realizado', 60.00),
(59, 64, 1, '2024-07-03 15:30:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (60, 65, 2, '2024-07-09 09:00:00', 'Coxear', 'Displasia anca', 'Realizado', 50.00),
(61, 66, 3, '2024-07-13 10:00:00', 'Vermelhidão', 'Dermatite contacto', 'Realizado', 45.00), (62, 67, 4, '2024-07-19 14:30:00', 'Sopro', 'Doença valvular', 'Realizado', 60.00),
(63, 68, 1, '2024-08-06 16:00:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (64, 69, 2, '2024-08-11 09:30:00', 'Dor lombar', 'Hérnia discal', 'Realizado', 45.00),
(65, 70, 3, '2024-08-16 11:30:00', 'Otite', 'Malassezia', 'Realizado', 45.00), (66, 71, 4, '2024-08-21 15:00:00', 'Tosse', 'Edema pulmonar', 'Realizado', 60.00),
(67, 72, 1, '2024-09-03 09:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (68, 73, 2, '2024-09-09 10:30:00', 'Ferida', 'Abcesso', 'Realizado', 50.00),
(69, 74, 3, '2024-09-13 14:00:00', 'Queda de pelo', 'Alopecia', 'Realizado', 45.00), (70, 75, 4, '2024-09-19 16:30:00', 'Cansaço', 'Sopro grau 4', 'Realizado', 60.00),
(71, 76, 1, '2024-10-06 09:30:00', 'Check-up adoção', 'Saudável', 'Realizado', 35.00), (72, 77, 2, '2024-10-11 11:00:00', 'Vómitos', 'Indigestão', 'Realizado', 45.00),
(73, 78, 3, '2024-10-16 15:30:00', 'Comichão', 'Dermatite seborreica', 'Realizado', 45.00), (74, 79, 4, '2024-10-21 09:00:00', 'Desmaio', 'Hipoglicemia', 'Realizado', 60.00),
(75, 80, 1, '2024-11-03 10:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (76, 81, 2, '2024-11-09 14:30:00', 'Claudicação', 'Artrite', 'Realizado', 50.00),
(77, 82, 3, '2024-11-13 16:00:00', 'Dermatite', 'Pioderma', 'Realizado', 45.00), (78, 83, 4, '2024-11-19 09:30:00', 'Sopro', 'Hipertensão pulmonar', 'Realizado', 60.00),
(79, 84, 1, '2024-12-06 11:30:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (80, 85, 2, '2024-12-11 15:00:00', 'Diarreia', 'Gastroenterite hemorrágica', 'Realizado', 45.00),
(81, 86, 3, '2024-12-16 09:00:00', 'Otite', 'Infeção mista', 'Realizado', 45.00), (82, 87, 4, '2024-12-21 10:30:00', 'Tosse', 'Cardiomiopatia dilatada', 'Realizado', 60.00),
(83, 88, 1, '2024-04-07 14:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (84, 89, 2, '2024-04-12 16:30:00', 'Ferida', 'Mordedura outro cão', 'Realizado', 50.00),
(85, 90, 3, '2024-04-17 09:30:00', 'Queda de pelo', 'Demodicose', 'Realizado', 45.00), (86, 91, 4, '2024-04-22 11:00:00', 'Cansaço', 'Trombose', 'Realizado', 60.00),
(87, 92, 1, '2024-05-04 15:30:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (88, 93, 2, '2024-05-10 09:00:00', 'Vómitos', 'Torção gástrica', 'Realizado', 45.00),
(89, 94, 3, '2024-05-14 10:00:00', 'Comichão', 'Alergia ambiental', 'Realizado', 45.00), (90, 95, 4, '2024-05-20 14:30:00', 'Desmaio', 'Síncope vasovagal', 'Realizado', 60.00),
(91, 96, 1, '2024-06-07 16:00:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (92, 97, 2, '2024-06-12 09:30:00', 'Coxear', 'Rotura ligamento cruzado', 'Realizado', 50.00),
(93, 98, 3, '2024-06-17 11:30:00', 'Vermelhidão', 'Dermatite atópica', 'Realizado', 45.00), (94, 99, 4, '2024-06-22 15:00:00', 'Sopro', 'Estenose pulmonar', 'Realizado', 60.00),
(95, 100, 1, '2024-07-04 09:00:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (96, 101, 2, '2024-07-10 10:30:00', 'Dor abdominal', 'Pancreatite', 'Realizado', 45.00),
(97, 102, 3, '2024-07-14 14:00:00', 'Otite', 'Corpo estranho no ouvido', 'Realizado', 45.00), (98, 103, 4, '2024-07-20 16:30:00', 'Tosse', 'Insuficiência cardíaca congestiva', 'Realizado', 60.00),
(99, 104, 1, '2024-08-07 09:30:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (100, 105, 2, '2024-08-12 11:00:00', 'Ferida', 'Laceração', 'Realizado', 50.00),
(101, 106, 3, '2024-08-17 15:30:00', 'Queda de pelo', 'Desequilíbrio hormonal', 'Realizado', 45.00), (102, 107, 4, '2024-08-22 09:00:00', 'Cansaço', 'Anemia hemolítica', 'Realizado', 60.00),
(103, 108, 1, '2024-09-04 10:00:00', 'Check-up', 'Saudável', 'Realizado', 35.00), (104, 109, 2, '2024-09-10 14:30:00', 'Vómitos', 'Gastrite crónica', 'Realizado', 45.00),
(105, 110, 3, '2024-09-14 16:00:00', 'Comichão', 'Dermatofitose', 'Realizado', 45.00), (106, 111, 4, '2024-09-20 09:30:00', 'Desmaio', 'Epilepsia', 'Realizado', 60.00),
(107, 112, 1, '2024-10-07 11:30:00', 'Vacinação', 'Saudável', 'Realizado', 35.00), (108, 113, 2, '2024-10-12 15:00:00', 'Claudicação', 'Luxação patelar', 'Realizado', 50.00),
(109, 114, 3, '2024-10-17 09:00:00', 'Dermatite', 'Alergia alimentar', 'Realizado', 45.00), (110, 115, 4, '2024-10-22 10:30:00', 'Sopro', 'Comunicação interventricular', 'Realizado', 60.00);

-- 7. SERVIÇOS UNIFICADOS
INSERT INTO public.servicos (id_servicos, id_animal, id_funcionario, data_servicos, tipo_servico, estado, preco) VALUES 
(1, 7, 2, '2024-03-01 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (2, 6, 2, '2024-03-02 11:00:00', 'Banho', 'Realizado', 0.00),
(3, 9, 2, '2024-03-03 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (4, 1, 2, '2024-03-04 09:00:00', 'Banho', 'Realizado', 0.00),
(5, 5, 2, '2024-03-05 16:00:00', 'Tosquia', 'Realizado', 0.00), (6, 11, 2, '2024-03-12 10:00:00', 'Banho', 'Agendado', 0.00),
(7, 4, 2, '2024-03-15 15:00:00', 'Banho e Tosquia', 'Agendado', 0.00), (8, 16, 2, '2024-04-06 10:00:00', 'Banho', 'Realizado', 0.00), 
(9, 17, 2, '2024-04-11 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (10, 18, 2, '2024-04-16 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(11, 19, 2, '2024-04-21 15:00:00', 'Banho', 'Realizado', 0.00), (12, 20, 2, '2024-05-03 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(13, 21, 2, '2024-05-09 11:00:00', 'Tosquia', 'Realizado', 0.00), (14, 22, 2, '2024-05-13 14:00:00', 'Banho', 'Realizado', 0.00), 
(15, 23, 2, '2024-05-19 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (16, 24, 2, '2024-06-06 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(17, 25, 2, '2024-06-11 11:00:00', 'Banho', 'Realizado', 0.00), (18, 26, 2, '2024-06-16 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(19, 27, 2, '2024-06-21 15:00:00', 'Tosquia', 'Realizado', 0.00), (20, 28, 2, '2024-07-03 10:00:00', 'Banho', 'Realizado', 0.00), 
(21, 29, 2, '2024-07-09 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (22, 30, 2, '2024-07-13 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(23, 31, 2, '2024-07-19 15:00:00', 'Banho', 'Realizado', 0.00), (24, 32, 2, '2024-08-06 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(25, 33, 2, '2024-08-11 11:00:00', 'Tosquia', 'Realizado', 0.00), (26, 34, 2, '2024-08-16 14:00:00', 'Banho', 'Realizado', 0.00), 
(27, 35, 2, '2024-08-21 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (28, 36, 2, '2024-09-03 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(29, 37, 2, '2024-09-09 11:00:00', 'Banho', 'Realizado', 0.00), (30, 38, 2, '2024-09-13 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(31, 39, 2, '2024-09-19 15:00:00', 'Tosquia', 'Realizado', 0.00), (32, 40, 2, '2024-10-06 10:00:00', 'Banho', 'Realizado', 0.00), 
(33, 41, 2, '2024-10-11 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (34, 42, 2, '2024-10-16 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(35, 43, 2, '2024-10-21 15:00:00', 'Banho', 'Realizado', 0.00), (36, 44, 2, '2024-11-03 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(37, 45, 2, '2024-11-09 11:00:00', 'Tosquia', 'Realizado', 0.00), (38, 46, 2, '2024-11-13 14:00:00', 'Banho', 'Realizado', 0.00), 
(39, 47, 2, '2024-11-19 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (40, 48, 2, '2024-12-06 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(41, 49, 2, '2024-12-11 11:00:00', 'Banho', 'Realizado', 0.00), (42, 50, 2, '2024-12-16 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(43, 51, 2, '2024-12-21 15:00:00', 'Tosquia', 'Realizado', 0.00), (44, 52, 2, '2024-04-07 10:00:00', 'Banho', 'Realizado', 0.00), 
(45, 53, 2, '2024-04-12 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (46, 54, 2, '2024-04-17 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(47, 55, 2, '2024-04-22 15:00:00', 'Banho', 'Realizado', 0.00), (48, 56, 2, '2024-05-04 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(49, 57, 2, '2024-05-10 11:00:00', 'Tosquia', 'Realizado', 0.00), (50, 58, 2, '2024-05-14 14:00:00', 'Banho', 'Realizado', 0.00), 
(51, 59, 2, '2024-05-20 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (52, 60, 2, '2024-06-07 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(53, 61, 2, '2024-06-12 11:00:00', 'Banho', 'Realizado', 0.00), (54, 62, 2, '2024-06-17 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(55, 63, 2, '2024-06-22 15:00:00', 'Tosquia', 'Realizado', 0.00), (56, 64, 2, '2024-07-04 10:00:00', 'Banho', 'Realizado', 0.00), 
(57, 65, 2, '2024-07-10 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (58, 66, 2, '2024-07-14 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(59, 67, 2, '2024-07-20 15:00:00', 'Banho', 'Realizado', 0.00), (60, 68, 2, '2024-08-07 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(61, 69, 2, '2024-08-12 11:00:00', 'Tosquia', 'Realizado', 0.00), (62, 70, 2, '2024-08-17 14:00:00', 'Banho', 'Realizado', 0.00), 
(63, 71, 2, '2024-08-22 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (64, 72, 2, '2024-09-04 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(65, 73, 2, '2024-09-10 11:00:00', 'Banho', 'Realizado', 0.00), (66, 74, 2, '2024-09-14 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(67, 75, 2, '2024-09-20 15:00:00', 'Tosquia', 'Realizado', 0.00), (68, 76, 2, '2024-10-07 10:00:00', 'Banho', 'Realizado', 0.00), 
(69, 77, 2, '2024-10-12 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (70, 78, 2, '2024-10-17 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(71, 79, 2, '2024-10-22 15:00:00', 'Banho', 'Realizado', 0.00), (72, 80, 2, '2024-11-04 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(73, 81, 2, '2024-11-10 11:00:00', 'Tosquia', 'Realizado', 0.00), (74, 82, 2, '2024-11-14 14:00:00', 'Banho', 'Realizado', 0.00), 
(75, 83, 2, '2024-11-20 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (76, 84, 2, '2024-12-07 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(77, 85, 2, '2024-12-12 11:00:00', 'Banho', 'Realizado', 0.00), (78, 86, 2, '2024-12-17 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(79, 87, 2, '2024-12-22 15:00:00', 'Tosquia', 'Realizado', 0.00), (80, 88, 2, '2024-04-08 10:00:00', 'Banho', 'Realizado', 0.00), 
(81, 89, 2, '2024-04-13 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (82, 90, 2, '2024-04-18 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(83, 91, 2, '2024-04-23 15:00:00', 'Banho', 'Realizado', 0.00), (84, 92, 2, '2024-05-05 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(85, 93, 2, '2024-05-11 11:00:00', 'Tosquia', 'Realizado', 0.00), (86, 94, 2, '2024-05-15 14:00:00', 'Banho', 'Realizado', 0.00), 
(87, 95, 2, '2024-05-21 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (88, 96, 2, '2024-06-08 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(89, 97, 2, '2024-06-13 11:00:00', 'Banho', 'Realizado', 0.00), (90, 98, 2, '2024-06-18 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(91, 99, 2, '2024-06-23 15:00:00', 'Tosquia', 'Realizado', 0.00), (92, 100, 2, '2024-07-05 10:00:00', 'Banho', 'Realizado', 0.00), 
(93, 101, 2, '2024-07-11 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (94, 102, 2, '2024-07-15 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(95, 103, 2, '2024-07-21 15:00:00', 'Banho', 'Realizado', 0.00), (96, 104, 2, '2024-08-08 10:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(97, 105, 2, '2024-08-13 11:00:00', 'Tosquia', 'Realizado', 0.00), (98, 106, 2, '2024-08-18 14:00:00', 'Banho', 'Realizado', 0.00), 
(99, 107, 2, '2024-08-23 15:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (100, 108, 2, '2024-09-05 10:00:00', 'Tosquia', 'Realizado', 0.00), 
(101, 109, 2, '2024-09-11 11:00:00', 'Banho', 'Realizado', 0.00), (102, 110, 2, '2024-09-15 14:00:00', 'Banho e Tosquia', 'Realizado', 0.00), 
(103, 111, 2, '2024-09-21 15:00:00', 'Tosquia', 'Realizado', 0.00), (104, 112, 2, '2024-10-08 10:00:00', 'Banho', 'Realizado', 0.00), 
(105, 113, 2, '2024-10-13 11:00:00', 'Banho e Tosquia', 'Realizado', 0.00), (106, 114, 2, '2024-10-18 14:00:00', 'Tosquia', 'Realizado', 0.00), 
(107, 115, 2, '2024-10-23 15:00:00', 'Banho', 'Realizado', 0.00);

-- 8. FATURAS E EXAMES MISTURADOS (Deixamos a DB calcular todos os zeros)
INSERT INTO public.fatura (id_consulta, id_servicos, valor_total) VALUES 
(1, NULL, 0.00), (2, NULL, 0.00), (3, NULL, 0.00), (4, NULL, 0.00), (5, NULL, 0.00), (6, NULL, 0.00),
(NULL, 1, 0.00), (NULL, 2, 0.00), (NULL, 3, 0.00), (NULL, 4, 0.00), (NULL, 5, 0.00), 
(11, NULL, 0.00), (12, NULL, 0.00), (13, NULL, 0.00), (14, NULL, 0.00), (15, NULL, 0.00),
(16, NULL, 0.00), (17, NULL, 0.00), (18, NULL, 0.00), (19, NULL, 0.00), (20, NULL, 0.00),
(21, NULL, 0.00), (22, NULL, 0.00), (23, NULL, 0.00), (24, NULL, 0.00), (25, NULL, 0.00),
(26, NULL, 0.00), (27, NULL, 0.00), (28, NULL, 0.00), (29, NULL, 0.00), (30, NULL, 0.00),
(31, NULL, 0.00), (32, NULL, 0.00), (33, NULL, 0.00), (34, NULL, 0.00), (35, NULL, 0.00),
(36, NULL, 0.00), (37, NULL, 0.00), (38, NULL, 0.00), (39, NULL, 0.00), (40, NULL, 0.00),
(41, NULL, 0.00), (42, NULL, 0.00), (43, NULL, 0.00), (44, NULL, 0.00), (45, NULL, 0.00),
(46, NULL, 0.00), (47, NULL, 0.00), (48, NULL, 0.00), (49, NULL, 0.00), (50, NULL, 0.00),
(51, NULL, 0.00), (52, NULL, 0.00), (53, NULL, 0.00), (54, NULL, 0.00), (55, NULL, 0.00),
(56, NULL, 0.00), (57, NULL, 0.00), (58, NULL, 0.00), (59, NULL, 0.00), (60, NULL, 0.00),
(61, NULL, 0.00), (62, NULL, 0.00), (63, NULL, 0.00), (64, NULL, 0.00), (65, NULL, 0.00),
(66, NULL, 0.00), (67, NULL, 0.00), (68, NULL, 0.00), (69, NULL, 0.00), (70, NULL, 0.00),
(71, NULL, 0.00), (72, NULL, 0.00), (73, NULL, 0.00), (74, NULL, 0.00), (75, NULL, 0.00),
(76, NULL, 0.00), (77, NULL, 0.00), (78, NULL, 0.00), (79, NULL, 0.00), (80, NULL, 0.00),
(81, NULL, 0.00), (82, NULL, 0.00), (83, NULL, 0.00), (84, NULL, 0.00), (85, NULL, 0.00),
(86, NULL, 0.00), (87, NULL, 0.00), (88, NULL, 0.00), (89, NULL, 0.00), (90, NULL, 0.00),
(91, NULL, 0.00), (92, NULL, 0.00), (93, NULL, 0.00), (94, NULL, 0.00), (95, NULL, 0.00),
(96, NULL, 0.00), (97, NULL, 0.00), (98, NULL, 0.00), (99, NULL, 0.00), (100, NULL, 0.00),
(101, NULL, 0.00), (102, NULL, 0.00), (103, NULL, 0.00), (104, NULL, 0.00), (105, NULL, 0.00),
(106, NULL, 0.00), (107, NULL, 0.00), (108, NULL, 0.00), (109, NULL, 0.00), (110, NULL, 0.00),
(NULL, 8, 0.00), (NULL, 9, 0.00), (NULL, 10, 0.00), (NULL, 11, 0.00), (NULL, 12, 0.00),
(NULL, 13, 0.00), (NULL, 14, 0.00), (NULL, 15, 0.00), (NULL, 16, 0.00), (NULL, 17, 0.00),
(NULL, 18, 0.00), (NULL, 19, 0.00), (NULL, 20, 0.00), (NULL, 21, 0.00), (NULL, 22, 0.00),
(NULL, 23, 0.00), (NULL, 24, 0.00), (NULL, 25, 0.00), (NULL, 26, 0.00), (NULL, 27, 0.00),
(NULL, 28, 0.00), (NULL, 29, 0.00), (NULL, 30, 0.00), (NULL, 31, 0.00), (NULL, 32, 0.00),
(NULL, 33, 0.00), (NULL, 34, 0.00), (NULL, 35, 0.00), (NULL, 36, 0.00), (NULL, 37, 0.00),
(NULL, 38, 0.00), (NULL, 39, 0.00), (NULL, 40, 0.00), (NULL, 41, 0.00), (NULL, 42, 0.00),
(NULL, 43, 0.00), (NULL, 44, 0.00), (NULL, 45, 0.00), (NULL, 46, 0.00), (NULL, 47, 0.00),
(NULL, 48, 0.00), (NULL, 49, 0.00), (NULL, 50, 0.00), (NULL, 51, 0.00), (NULL, 52, 0.00),
(NULL, 53, 0.00), (NULL, 54, 0.00), (NULL, 55, 0.00), (NULL, 56, 0.00), (NULL, 57, 0.00),
(NULL, 58, 0.00), (NULL, 59, 0.00), (NULL, 60, 0.00), (NULL, 61, 0.00), (NULL, 62, 0.00),
(NULL, 63, 0.00), (NULL, 64, 0.00), (NULL, 65, 0.00), (NULL, 66, 0.00), (NULL, 67, 0.00),
(NULL, 68, 0.00), (NULL, 69, 0.00), (NULL, 70, 0.00), (NULL, 71, 0.00), (NULL, 72, 0.00),
(NULL, 73, 0.00), (NULL, 74, 0.00), (NULL, 75, 0.00), (NULL, 76, 0.00), (NULL, 77, 0.00),
(NULL, 78, 0.00), (NULL, 79, 0.00), (NULL, 80, 0.00), (NULL, 81, 0.00), (NULL, 82, 0.00),
(NULL, 83, 0.00), (NULL, 84, 0.00), (NULL, 85, 0.00), (NULL, 86, 0.00), (NULL, 87, 0.00),
(NULL, 88, 0.00), (NULL, 89, 0.00), (NULL, 90, 0.00), (NULL, 91, 0.00), (NULL, 92, 0.00),
(NULL, 93, 0.00), (NULL, 94, 0.00), (NULL, 95, 0.00), (NULL, 96, 0.00), (NULL, 97, 0.00),
(NULL, 98, 0.00), (NULL, 99, 0.00), (NULL, 100, 0.00), (NULL, 101, 0.00), (NULL, 102, 0.00),
(NULL, 103, 0.00), (NULL, 104, 0.00), (NULL, 105, 0.00), (NULL, 106, 0.00), (NULL, 107, 0.00);

-- Exames solicitados
INSERT INTO public.orienta (id_consulta, id_exame, descricao) VALUES 
(2, 7, 'Raio-X membro posterior direito para confirmação de fratura.'), (3, 11, 'Citologia para avaliar presença de malassezia.'),
(4, 5, 'Ecocardiograma para avaliar sopro e função cardíaca.'), (4, 6, 'Raio-X ao tórax para descartar edema pulmonar.'),
(5, 1, 'Hemograma para avaliar infeção.'), (5, 2, 'Bioquímica para avaliar estado do fígado e rins devido à diarreia.'),
(12, 7, 'Raio-X membro para despiste fratura'), (14, 5, 'Ecocardiograma'), (16, 2, 'Bioquímica'),
(18, 6, 'Raio-X Tórax'), (20, 1, 'Hemograma'), (22, 5, 'Ecocardiograma'), (24, 10, 'Análise Urina'),
(26, 5, 'Ecocardiograma'), (28, 7, 'Raio-X Membros'), (30, 5, 'Ecocardiograma'), (32, 4, 'Ecografia'),
(34, 6, 'Raio-X Tórax'), (36, 1, 'Hemograma'), (38, 5, 'Ecocardiograma'), (40, 2, 'Bioquímica'),
(42, 5, 'Ecocardiograma'), (44, 7, 'Raio-X Membros'), (46, 5, 'Ecocardiograma'), (48, 1, 'Hemograma'),
(50, 6, 'Raio-X Tórax'), (52, 7, 'Raio-X Membros'), (54, 1, 'Hemograma'), (56, 11, 'Citologia'),
(58, 2, 'Bioquímica'), (60, 7, 'Raio-X Membros'), (62, 5, 'Ecocardiograma'), (64, 7, 'Raio-X Membros'),
(66, 6, 'Raio-X Tórax'), (68, 1, 'Hemograma'), (70, 5, 'Ecocardiograma'), (72, 2, 'Bioquímica'),
(74, 2, 'Bioquímica'), (76, 7, 'Raio-X Membros'), (78, 5, 'Ecocardiograma'), (80, 1, 'Hemograma'),
(82, 5, 'Ecocardiograma'), (84, 1, 'Hemograma'), (86, 1, 'Hemograma'), (88, 4, 'Ecografia'),
(90, 5, 'Ecocardiograma'), (92, 7, 'Raio-X Membros'), (94, 5, 'Ecocardiograma'), (96, 2, 'Bioquímica'),
(98, 6, 'Raio-X Tórax'), (100, 1, 'Hemograma'), (102, 1, 'Hemograma'), (104, 2, 'Bioquímica'),
(106, 2, 'Bioquímica'), (108, 7, 'Raio-X Membros'), (110, 5, 'Ecocardiograma');

-- Medicamentos
INSERT INTO public.prescreve (id_consulta, id_medicamento, quantidade, descricao) VALUES 
(1, 2, 1.00, 'Administrar 1 comprimido hoje. Prevenção por 3 meses.'), (2, 5, 10.00, 'Administrar 0.5ml por dia durante 10 dias (Controlo de dor).'),
(3, 9, 20.00, 'Tomar 1/2 comprimido de 12h/12h para controlo da comichão.'), (3, 13, 1.00, 'Dar banho de 3 em 3 dias com este champô durante 2 semanas.'),
(4, 12, 30.00, '1 comprimido de 12 em 12 horas, uso contínuo.'), (5, 11, 2.00, 'Injeção administrada na clínica para travar os vómitos.'),
(5, 7, 14.00, '1 comprimido de 12 em 12 horas durante 7 dias.');




INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida) VALUES 
-- ==========================================
-- FUNCIONÁRIOS FIXOS (Segunda a Sexta, 09:00 às 18:30)
-- Sofia (6), Tiago (8) e Administrador (10)
-- ==========================================
(6, 'Segunda', '09:00', '18:30'), (8, 'Segunda', '09:00', '18:30'), (10, 'Segunda', '09:00', '18:30'),
(6, 'Terça', '09:00', '18:30'),   (8, 'Terça', '09:00', '18:30'),   (10, 'Terça', '09:00', '18:30'),
(6, 'Quarta', '09:00', '18:30'),  (8, 'Quarta', '09:00', '18:30'),  (10, 'Quarta', '09:00', '18:30'),
(6, 'Quinta', '09:00', '18:30'),  (8, 'Quinta', '09:00', '18:30'),  (10, 'Quinta', '09:00', '18:30'),
(6, 'Sexta', '09:00', '18:30'),   (8, 'Sexta', '09:00', '18:30'),   (10, 'Sexta', '09:00', '18:30'),

-- ==========================================
-- FUNCIONÁRIOS ROTATIVOS (Noites, Madrugadas e Sábado)
-- Pedro (5), Rita (7) e Hugo (9)
-- ==========================================
-- Segunda-feira
(5, 'Segunda', '18:30', '23:59'), -- Pedro (Noite)
(7, 'Segunda', '00:00', '09:00'), -- Rita (Madrugada)

-- Terça-feira
(9, 'Terça', '18:30', '23:59'),   -- Hugo (Noite)
(5, 'Terça', '00:00', '09:00'),   -- Pedro (Madrugada)

-- Quarta-feira
(7, 'Quarta', '18:30', '23:59'),  -- Rita (Noite)
(9, 'Quarta', '00:00', '09:00'),  -- Hugo (Madrugada)

-- Quinta-feira
(5, 'Quinta', '18:30', '23:59'),  -- Pedro (Noite)
(7, 'Quinta', '00:00', '09:00'),  -- Rita (Madrugada)

-- Sexta-feira
(9, 'Sexta', '18:30', '23:59'),   -- Hugo (Noite)
(5, 'Sexta', '00:00', '09:00'),   -- Pedro (Madrugada)

-- Sábado (Cobertura total do dia, noite e madrugada)
(7, 'Sábado', '09:00', '18:30'),  -- Rita (Dia)
(9, 'Sábado', '18:30', '23:59'),  -- Hugo (Noite)
(5, 'Sábado', '00:00', '09:00');  -- Pedro (Madrugada)



INSERT INTO public.horario (id_colaborador, dia_semana, hora_entrada, hora_saida) VALUES 
-- ==========================================
-- SEGUNDA-FEIRA
-- ==========================================
(1, 'Segunda', '09:00', '18:30'), -- Dr. Carlos (Dia todo - Marcações)
(2, 'Segunda', '09:00', '18:30'), -- Dra. Ana (Dia todo - Marcações)
(3, 'Segunda', '18:30', '23:59'), -- Dr. João (Noite - Urgências)
(4, 'Segunda', '00:00', '09:00'), -- Dra. Maria (Madrugada - Urgências)

-- ==========================================
-- TERÇA-FEIRA (Rodam para descansar do turno de dia)
-- ==========================================
(3, 'Terça', '09:00', '18:30'),   -- Dr. João (Dia todo - Marcações)
(4, 'Terça', '09:00', '18:30'),   -- Dra. Maria (Dia todo - Marcações)
(1, 'Terça', '18:30', '23:59'),   -- Dr. Carlos (Noite - Urgências)
(2, 'Terça', '00:00', '09:00'),   -- Dra. Ana (Madrugada - Urgências)

-- ==========================================
-- QUARTA-FEIRA (Misturamos as duplas)
-- ==========================================
(1, 'Quarta', '09:00', '18:30'),  -- Dr. Carlos (Dia todo - Marcações)
(3, 'Quarta', '09:00', '18:30'),  -- Dr. João (Dia todo - Marcações)
(2, 'Quarta', '18:30', '23:59'),  -- Dra. Ana (Noite - Urgências)
(4, 'Quarta', '00:00', '09:00'),  -- Dra. Maria (Madrugada - Urgências)

-- ==========================================
-- QUINTA-FEIRA
-- ==========================================
(2, 'Quinta', '09:00', '18:30'),  -- Dra. Ana (Dia todo - Marcações)
(4, 'Quinta', '09:00', '18:30'),  -- Dra. Maria (Dia todo - Marcações)
(3, 'Quinta', '18:30', '23:59'),  -- Dr. João (Noite - Urgências)
(1, 'Quinta', '00:00', '09:00'),  -- Dr. Carlos (Madrugada - Urgências)

-- ==========================================
-- SEXTA-FEIRA
-- ==========================================
(1, 'Sexta', '09:00', '18:30'),   -- Dr. Carlos (Dia todo - Marcações)
(2, 'Sexta', '09:00', '18:30'),   -- Dra. Ana (Dia todo - Marcações)
(4, 'Sexta', '18:30', '23:59'),   -- Dra. Maria (Noite - Urgências)
(3, 'Sexta', '00:00', '09:00'),   -- Dr. João (Madrugada - Urgências)

-- ==========================================
-- SÁBADO
-- ==========================================
(3, 'Sábado', '09:00', '18:30'),  -- Dr. João (Dia todo - Marcações)
(4, 'Sábado', '09:00', '18:30'),  -- Dra. Maria (Dia todo - Marcações)
(2, 'Sábado', '18:30', '23:59'),  -- Dra. Ana (Noite - Urgências)
(1, 'Sábado', '00:00', '09:00');  -- Dr. Carlos (Madrugada - Urgências)
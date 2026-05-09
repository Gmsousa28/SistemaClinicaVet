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
	public.alerta,
	public.logs,
	public.servicos
	RESTART IDENTITY CASCADE;
-- ============================================================
-- DADOS FICTÍCIOS EXTRA PARA TESTES
-- ============================================================

-- ****************************************************************************
-- 2. HORÁRIO DA CLÍNICA
-- ****************************************************************************

INSERT INTO public.horario_clinica (dia_semana, hora_abertura, hora_fecho) VALUES
('Segunda', '09:00', '18:00'),
('Terça', '09:00', '18:00'),
('Quarta', '09:00', '18:00'),
('Quinta', '09:00', '18:00'),
('Sexta', '09:00', '18:00'),
('Sábado', '09:00', '13:00');


-- ****************************************************************************
-- 3. LOGIN CLIENTES
-- ****************************************************************************

INSERT INTO public.login_cliente 
(nome, email, palavra_passe, telemovel, data_nascimento, morada, nif, conta_ativa)
VALUES
('Mariana Lopes', 'mariana.lopes@email.com', 'hash_mariana', 910100101, '1992-04-12', 'Rua Verde 10, Braga', 501100101, TRUE),
('Tiago Ferreira', 'tiago.ferreira@email.com', 'hash_tiago', 910100102, '1988-09-23', 'Rua Azul 20, Porto', 501100102, TRUE),
('Beatriz Martins', 'beatriz.martins@email.com', 'hash_beatriz', 910100103, '1997-01-05', 'Rua Amarela 30, Braga', 501100103, TRUE),
('Rui Almeida', 'rui.almeida@email.com', 'hash_rui', 910100104, '1985-11-17', 'Rua do Sol 40, Guimarães', 501100104, TRUE),
('Sofia Moreira', 'sofia.moreira@email.com', 'hash_sofia', 910100105, '1999-07-29', 'Rua da Lua 50, Vila Verde', 501100105, TRUE);


-- ****************************************************************************
-- 4. CLIENTES
-- ****************************************************************************

INSERT INTO public.cliente 
(id_login_cliente, nome, morada, email, nif, contacto)
VALUES
(
    (SELECT id_login_cliente FROM public.login_cliente WHERE email = 'mariana.lopes@email.com'),
    'Mariana Lopes',
    'Rua Verde 10, Braga',
    'mariana.lopes@email.com',
    501100101,
    910100101
),
(
    (SELECT id_login_cliente FROM public.login_cliente WHERE email = 'tiago.ferreira@email.com'),
    'Tiago Ferreira',
    'Rua Azul 20, Porto',
    'tiago.ferreira@email.com',
    501100102,
    910100102
),
(
    (SELECT id_login_cliente FROM public.login_cliente WHERE email = 'beatriz.martins@email.com'),
    'Beatriz Martins',
    'Rua Amarela 30, Braga',
    'beatriz.martins@email.com',
    501100103,
    910100103
),
(
    (SELECT id_login_cliente FROM public.login_cliente WHERE email = 'rui.almeida@email.com'),
    'Rui Almeida',
    'Rua do Sol 40, Guimarães',
    'rui.almeida@email.com',
    501100104,
    910100104
),
(
    (SELECT id_login_cliente FROM public.login_cliente WHERE email = 'sofia.moreira@email.com'),
    'Sofia Moreira',
    'Rua da Lua 50, Vila Verde',
    'sofia.moreira@email.com',
    501100105,
    910100105
);


-- ****************************************************************************
-- 5. LOGIN COLABORADORES
-- ****************************************************************************

INSERT INTO public.login_colaborador 
(nome, email, palavra_passe, telemovel, data_nascimento, morada, nif, cargo)
VALUES
('Dra. Inês Pereira', 'ines.pereira@clinica.pt', 'hash_ines', 920200101, '1983-03-14', 'Braga', 601200101, 'Veterinário'),
('Dr. Miguel Santos', 'miguel.santos@clinica.pt', 'hash_miguel', 920200102, '1979-12-08', 'Porto', 601200102, 'Veterinário'),
('Sara Oliveira', 'sara.oliveira@clinica.pt', 'hash_sara', 920200103, '1994-06-21', 'Braga', 601200103, 'Funcionario'),
('Pedro Nunes', 'pedro.nunes@clinica.pt', 'hash_pedro', 920200104, '1991-02-02', 'Guimarães', 601200104, 'Funcionario');


-- ****************************************************************************
-- 6. VETERINÁRIOS
-- ****************************************************************************

INSERT INTO public.veterinario 
(nome, morada, contacto, email, nif, especialidade)
VALUES
('Dra. Inês Pereira', 'Braga', 920200101, 'ines.pereira@clinica.pt', 601200101, 'Dermatologia'),
('Dr. Miguel Santos', 'Porto', 920200102, 'miguel.santos@clinica.pt', 601200102, 'Ortopedia');


-- ****************************************************************************
-- 7. FUNCIONÁRIOS
-- ****************************************************************************

INSERT INTO public.funcionario 
(nome, morada, email, nif, contacto, cargo)
VALUES
('Sara Oliveira', 'Braga', 'sara.oliveira@clinica.pt', 601200103, 920200103, 'Rececionista'),
('Pedro Nunes', 'Guimarães', 'pedro.nunes@clinica.pt', 601200104, 920200104, 'Auxiliar');


-- ****************************************************************************
-- 8. COLABORADORES
-- ****************************************************************************

INSERT INTO public.colaborador 
(id_login_colaborador, id_veterinario)
VALUES
(
    (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'ines.pereira@clinica.pt'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'ines.pereira@clinica.pt')
),
(
    (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'miguel.santos@clinica.pt'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'miguel.santos@clinica.pt')
);

INSERT INTO public.colaborador 
(id_login_colaborador, id_funcionario)
VALUES
(
    (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'sara.oliveira@clinica.pt'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'sara.oliveira@clinica.pt')
),
(
    (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'pedro.nunes@clinica.pt'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'pedro.nunes@clinica.pt')
);


-- ****************************************************************************
-- 9. HORÁRIOS DOS COLABORADORES
-- ****************************************************************************

-- Dra. Inês Pereira
INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'ines.pereira@clinica.pt'), 'Segunda', '09:00', '13:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'ines.pereira@clinica.pt'), 'Segunda', '14:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'ines.pereira@clinica.pt'), 'Quarta', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'ines.pereira@clinica.pt'), 'Sexta', '09:00', '18:00');

-- Dr. Miguel Santos
INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'miguel.santos@clinica.pt'), 'Terça', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'miguel.santos@clinica.pt'), 'Quinta', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'miguel.santos@clinica.pt'), 'Sábado', '09:00', '13:00');

-- Sara Oliveira
INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'sara.oliveira@clinica.pt'), 'Segunda', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'sara.oliveira@clinica.pt'), 'Terça', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'sara.oliveira@clinica.pt'), 'Quarta', '09:00', '18:00');

-- Pedro Nunes
INSERT INTO public.horario 
(id_colaborador, dia_semana, hora_entrada, hora_saida)
VALUES
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'pedro.nunes@clinica.pt'), 'Quinta', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'pedro.nunes@clinica.pt'), 'Sexta', '09:00', '18:00'),
((SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'pedro.nunes@clinica.pt'), 'Sábado', '09:00', '13:00');


-- ****************************************************************************
-- 10. ANIMAIS
-- ****************************************************************************

INSERT INTO public.animal 
(id_cliente, nome, especie, raca, sexo, data_nascimento, estado)
VALUES
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'mariana.lopes@email.com'),
    'Luna',
    'Cão',
    'Golden Retriever',
    'F',
    '2021-05-10',
    'Domestico'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'mariana.lopes@email.com'),
    'Tico',
    'Coelho',
    'Anão Holandês',
    'M',
    '2023-02-18',
    'Domestico'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'tiago.ferreira@email.com'),
    'Nina',
    'Gato',
    'Europeu Comum',
    'F',
    '2020-09-01',
    'Domestico'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'beatriz.martins@email.com'),
    'Max',
    'Cão',
    'Pastor Alemão',
    'M',
    '2019-03-22',
    'Domestico'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'rui.almeida@email.com'),
    'Pipoca',
    'Gato',
    'Persa',
    'F',
    '2022-12-11',
    'Adotado'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'sofia.moreira@email.com'),
    'Thor',
    'Cão',
    'Bulldog Francês',
    'M',
    '2021-08-30',
    'Domestico'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'sofia.moreira@email.com'),
    'Mel',
    'Cão',
    'Beagle',
    'F',
    '2024-01-15',
    'Resgatado'
);


-- ****************************************************************************
-- 11. MEDICAMENTOS
-- ****************************************************************************

INSERT INTO public.medicamento (nome) VALUES
('Antibiótico Vet Plus'),
('Anti-inflamatório Canino'),
('Desparasitante Interno'),
('Desparasitante Externo'),
('Suplemento Articular'),
('Colírio Veterinário'),
('Vacina Polivalente'),
('Pomada Cicatrizante');


-- ****************************************************************************
-- 12. EXAMES
-- ****************************************************************************

INSERT INTO public.exame (nome) VALUES
('Ecografia Abdominal'),
('Hemograma Completo'),
('Teste de Leishmaniose'),
('Radiografia Torácica'),
('Análise Urina'),
('Eletrocardiograma'),
('Teste FIV/FELV'),
('Citologia Cutânea');


-- ****************************************************************************
-- 13. RESGATES
-- ****************************************************************************

INSERT INTO public.resgate 
(id_animal, id_funcionario, data_resgate, idade)
VALUES
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Mel' AND c.email = 'sofia.moreira@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'pedro.nunes@clinica.pt'),
    '2026-01-20',
    'Jovem'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Pipoca' AND c.email = 'rui.almeida@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'sara.oliveira@clinica.pt'),
    '2025-11-05',
    'Adulto'
);


-- ****************************************************************************
-- 14. ADOÇÕES
-- ****************************************************************************

INSERT INTO public.adocao 
(id_animal, id_funcionario, data_adocao)
VALUES
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Pipoca' AND c.email = 'rui.almeida@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'sara.oliveira@clinica.pt'),
    '2025-12-01'
);


-- ****************************************************************************
-- 15. OCORRÊNCIAS LABORAIS
-- ****************************************************************************

INSERT INTO public.ocorrencia_laboral 
(id_colaborador, data_inicio, data_fim, tipo, observacoes)
VALUES
(
    (SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'ines.pereira@clinica.pt'),
    '2026-07-01',
    '2026-07-05',
    'Ferias',
    'Férias de verão'
),
(
    (SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'miguel.santos@clinica.pt'),
    '2026-09-10',
    '2026-09-12',
    'Ferias',
    'Férias curtas'
),
(
    (SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'sara.oliveira@clinica.pt'),
    '2026-06-15',
    '2026-06-15',
    'Falta',
    'Falta justificada'
),
(
    (SELECT c.id_colaborador FROM public.colaborador c JOIN public.login_colaborador lc ON lc.id_login_colaborador = c.id_login_colaborador WHERE lc.email = 'pedro.nunes@clinica.pt'),
    '2026-06-20',
    '2026-06-20',
    'Atraso',
    'Atraso de 20 minutos'
);


-- ****************************************************************************
-- 16. CONSULTAS
-- Datas futuras para não chocarem com triggers que bloqueiam passado
-- ****************************************************************************

INSERT INTO public.consulta 
(id_animal, id_veterinario, data_consulta, motivo)
VALUES
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Luna' AND c.email = 'mariana.lopes@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'ines.pereira@clinica.pt'),
    '2026-06-10 09:30:00',
    'Consulta dermatológica'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Tico' AND c.email = 'mariana.lopes@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'ines.pereira@clinica.pt'),
    '2026-06-10 10:30:00',
    'Perda de apetite'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Nina' AND c.email = 'tiago.ferreira@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'miguel.santos@clinica.pt'),
    '2026-06-11 11:00:00',
    'Check-up anual'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Max' AND c.email = 'beatriz.martins@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'miguel.santos@clinica.pt'),
    '2026-06-11 15:00:00',
    'Claudicação na pata traseira'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Thor' AND c.email = 'sofia.moreira@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'ines.pereira@clinica.pt'),
    '2026-06-12 14:30:00',
    'Vacinação anual'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Mel' AND c.email = 'sofia.moreira@email.com'),
    (SELECT id_veterinario FROM public.veterinario WHERE email = 'miguel.santos@clinica.pt'),
    '2026-06-13 10:00:00',
    'Avaliação pós-resgate'
);


-- ****************************************************************************
-- 17. PRESCRIÇÕES
-- ****************************************************************************

INSERT INTO public.prescreve 
(id_consulta, id_medicamento, quantidade, descricao)
VALUES
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Consulta dermatológica' LIMIT 1),
    (SELECT id_medicamento FROM public.medicamento WHERE nome = 'Pomada Cicatrizante' LIMIT 1),
    1,
    'Aplicar na zona afetada 2 vezes ao dia durante 7 dias'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Perda de apetite' LIMIT 1),
    (SELECT id_medicamento FROM public.medicamento WHERE nome = 'Suplemento Articular' LIMIT 1),
    1,
    'Administrar conforme indicação veterinária'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Claudicação na pata traseira' LIMIT 1),
    (SELECT id_medicamento FROM public.medicamento WHERE nome = 'Anti-inflamatório Canino' LIMIT 1),
    2,
    'Tomar 1 comprimido de 12 em 12 horas durante 5 dias'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Vacinação anual' LIMIT 1),
    (SELECT id_medicamento FROM public.medicamento WHERE nome = 'Vacina Polivalente' LIMIT 1),
    1,
    'Vacina administrada em consulta'
);


-- ****************************************************************************
-- 18. EXAMES ORIENTADOS
-- ****************************************************************************

INSERT INTO public.orienta 
(id_consulta, id_exame, descricao)
VALUES
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Consulta dermatológica' LIMIT 1),
    (SELECT id_exame FROM public.exame WHERE nome = 'Citologia Cutânea' LIMIT 1),
    'Recolha de amostra da pele para análise'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Check-up anual' LIMIT 1),
    (SELECT id_exame FROM public.exame WHERE nome = 'Hemograma Completo' LIMIT 1),
    'Análise geral de rotina'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Claudicação na pata traseira' LIMIT 1),
    (SELECT id_exame FROM public.exame WHERE nome = 'Radiografia Torácica' LIMIT 1),
    'Avaliar possível lesão óssea'
),
(
    (SELECT id_consulta FROM public.consulta WHERE motivo = 'Avaliação pós-resgate' LIMIT 1),
    (SELECT id_exame FROM public.exame WHERE nome = 'Teste de Leishmaniose' LIMIT 1),
    'Despiste após resgate'
);


-- ****************************************************************************
-- 19. FATURAS
-- ****************************************************************************

INSERT INTO public.fatura 
(id_consulta, valor_total)
VALUES
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Consulta dermatológica' LIMIT 1), 65.00),
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Perda de apetite' LIMIT 1), 45.00),
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Check-up anual' LIMIT 1), 55.00),
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Claudicação na pata traseira' LIMIT 1), 90.00),
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Vacinação anual' LIMIT 1), 35.00),
((SELECT id_consulta FROM public.consulta WHERE motivo = 'Avaliação pós-resgate' LIMIT 1), 70.00);


-- ****************************************************************************
-- 20. SERVIÇOS
-- ****************************************************************************

INSERT INTO public.servicos 
(id_animal, id_funcionario, data_servicos, tipo_servico)
VALUES
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Luna' AND c.email = 'mariana.lopes@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'sara.oliveira@clinica.pt'),
    '2026-06-14 10:00:00',
    'Banho'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Max' AND c.email = 'beatriz.martins@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'pedro.nunes@clinica.pt'),
    '2026-06-14 11:00:00',
    'Tosquia'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Thor' AND c.email = 'sofia.moreira@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'sara.oliveira@clinica.pt'),
    '2026-06-15 09:30:00',
    'Corte de unhas'
),
(
    (SELECT a.id_animal FROM public.animal a JOIN public.cliente c ON c.id_cliente = a.id_cliente WHERE a.nome = 'Nina' AND c.email = 'tiago.ferreira@email.com'),
    (SELECT id_funcionario FROM public.funcionario WHERE email = 'pedro.nunes@clinica.pt'),
    '2026-06-15 12:00:00',
    'Higiene'
);


-- ****************************************************************************
-- 21. ALERTAS
-- ****************************************************************************

INSERT INTO public.alerta 
(id_cliente, mensagem)
VALUES
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'mariana.lopes@email.com'),
    'A consulta da Luna está marcada para 10 de junho de 2026 às 09:30.'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'tiago.ferreira@email.com'),
    'A Nina tem check-up anual marcado para 11 de junho de 2026.'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'beatriz.martins@email.com'),
    'O Max tem uma consulta ortopédica marcada.'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'sofia.moreira@email.com'),
    'O Thor tem vacinação anual marcada.'
),
(
    (SELECT id_cliente FROM public.cliente WHERE email = 'sofia.moreira@email.com'),
    'A Mel deve fazer avaliação pós-resgate.'
);


-- ****************************************************************************
-- 22. LOGS DE COLABORADORES
-- ****************************************************************************

INSERT INTO public.logs 
(data_hora_login, data_hora_logout, id_login_colaborador)
VALUES
('2026-05-01 09:00:00', '2026-05-01 17:45:00', (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'ines.pereira@clinica.pt')),
('2026-05-02 09:10:00', '2026-05-02 18:00:00', (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'miguel.santos@clinica.pt')),
('2026-05-03 08:55:00', '2026-05-03 17:30:00', (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'sara.oliveira@clinica.pt')),
('2026-05-04 09:20:00', '2026-05-04 18:10:00', (SELECT id_login_colaborador FROM public.login_colaborador WHERE email = 'pedro.nunes@clinica.pt'));
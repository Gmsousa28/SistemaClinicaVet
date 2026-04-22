--Lista de entradas e saidas
select v.nome,h.data_hora_entrada, h.data_hora_saida ,'Veterinario' as cargo
FROM public.horario h
	
	inner JOIN public.colaborador c ON h.id_colaborador = c.id_colaborador
	inner join public.veterinario v on c.id_veterinario = v.id_veterinario
	
	union all

select f.nome,h.data_hora_entrada, h.data_hora_saida, f.cargo
FROM public.horario h
	inner JOIN public.colaborador c ON h.id_colaborador = c.id_colaborador
	inner join public.funcionario f on c.id_funcionario = f.id_funcionario

order by data_hora_entrada asc;


--Faturacao do mes por mes por veterinario

select DATE_TRUNC('month', c.data_consulta) as mes, v.nome, sum(f.valor_total) as total_faturacao
from public.veterinario v 
	
	inner join public.consulta c on v.id_veterinario = c.id_veterinario
	inner join public.fatura f on c.id_consulta = f.id_consulta

group by DATE_TRUNC('month', c.data_consulta),v.nome
order by total_faturacao desc;


--Lista de Colaboradores

select v.nome,'Veterinario' as cargo
from public.colaborador c 
	inner join public.veterinario v on c.id_veterinario = v.id_veterinario
union all
select f.nome, 'Funcionario' as cargo
from public.colaborador c 
	inner join public.funcionario f on c.id_funcionario = f.id_funcionario
order by cargo;

--Listas das Consultas com o veterinario com cliente com animal

select c.data_consulta,v.nome as Veterinario, cl.nome as Cliente, a.nome as Animal
from public.veterinario v 
	
	inner join public.consulta c on v.id_veterinario = c.id_veterinario
	inner join public.animal a on c.id_animal = a.id_animal
	inner join public.cliente cl on a.id_cliente = cl.id_cliente

order by c.data_consulta desc;

--Lista de funcionarios e as suas adocoes

select f.nome as Funcionario, a.data_adocao, an.nome as Animal
from public.funcionario f 
	
	inner join public.adocao a on f.id_funcionario = a.id_funcionario
	inner join public.animal an on a.id_animal = an.id_animal

order by data_adocao ;

--Lista de animais resgatados

select 
	a.nome,
	a.especie, 
    a.raca, 
    a.sexo,
    r.data_resgate,
    CURRENT_DATE - r.data_resgate AS dias_na_clinica
from public.resgate r

	inner join public.animal a on r.id_animal= a.id_animal

where a.estado = 'Resgatado'
order by r.data_resgate;


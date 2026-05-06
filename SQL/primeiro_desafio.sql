CREATE OR REPLACE PROCEDURE public.alertas_consultas()
LANGUAGE plpgsql
AS $$
BEGIN
    
    INSERT INTO public.alerta (id_cliente, mensagem)
    SELECT 
        c.id_cliente,
        -- Construção da mensagem concatenando os nomes e as horas na mensagem
        'Bom dia ' || c.nome || ', lembramos que tem uma consulta amanhã às ' || 
        TO_CHAR(cons.data_consulta, 'HH24:MI') || 
        ' com o seu animal ' || a.nome || '.'
    FROM public.consulta cons
    INNER JOIN public.animal a ON cons.id_animal = a.id_animal
    INNER JOIN public.cliente c ON a.id_cliente = c.id_cliente
    -- Filtra apenas as consultas cuja data seja exatamente amanhã
    WHERE DATE(cons.data_consulta) = CURRENT_DATE + INTERVAL '1 day';

END;
$$;

CREATE TABLE public.alerta(
	id_alerta SERIAL UNIQUE,
    id_cliente INT NOT NULL,
    mensagem VARCHAR(150) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    CONSTRAINT alerta_pk PRIMARY KEY (id_alerta),
    CONSTRAINT alerta_cli_fk FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente)
);

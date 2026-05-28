const pool = require('../config/db.js');

// Listar consultas
const listarConsultasBD = async () => {
    const result = await pool.query(`
        SELECT *
        FROM consulta
        ORDER BY id_consulta DESC
    `);
    return result.rows;
};

// Criar consulta
const criarConsultaBD = async (
    id_animal,
    id_veterinario,
    data_consulta,
    motivo
) => {
    const motivoSeguro = motivo.replace(/'/g, "''");
    const query = `
    DO $$
    DECLARE
        v_id_colaborador INT;
        v_dia_semana public.dia_semana;
        horario_valido BOOLEAN;
        veterinario_indisponivel BOOLEAN;
        consulta_existente BOOLEAN;
    BEGIN
        IF '${data_consulta}'::TIMESTAMP < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION
            'Operação bloqueada: Não é possível marcar consultas no passado (%).',
            '${data_consulta}';
        END IF;

        SELECT id_colaborador
        INTO v_id_colaborador
        FROM public.colaborador
        WHERE id_veterinario = ${id_veterinario};

        IF v_id_colaborador IS NULL THEN
            RAISE EXCEPTION
            'Operação bloqueada: O veterinário (ID %) não está registado como colaborador.',
            ${id_veterinario};
        END IF;

        v_dia_semana := CASE EXTRACT(DOW FROM '${data_consulta}'::TIMESTAMP)
            WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
            WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
            WHEN 2 THEN CAST('Terça' AS public.dia_semana)
            WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
            WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
            WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
            WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
        END;

        horario_valido := EXISTS (
            SELECT 1
            FROM public.horario
            WHERE id_colaborador = v_id_colaborador
            AND dia_semana = v_dia_semana
            AND CAST('${data_consulta}'::TIMESTAMP AS TIME)
                >= hora_entrada
            AND CAST(
                ('${data_consulta}'::TIMESTAMP + INTERVAL '30 minutes')
                AS TIME
            ) <= hora_saida
        );

        IF NOT horario_valido THEN
            RAISE EXCEPTION
            'Operação bloqueada: A consulta está fora do horário de trabalho do veterinário ou é dia de folga.';
        END IF;

        veterinario_indisponivel := EXISTS (
            SELECT 1
            FROM public.ocorrencia_laboral
            WHERE id_colaborador = v_id_colaborador
            AND CAST('${data_consulta}'::TIMESTAMP AS DATE)
                >= data_inicio
            AND CAST('${data_consulta}'::TIMESTAMP AS DATE)
                <= data_fim
        );

        IF veterinario_indisponivel THEN
            RAISE EXCEPTION
            'Operação bloqueada: O veterinário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
        END IF;

        consulta_existente := EXISTS (
            SELECT 1
            FROM public.consulta
            WHERE id_veterinario = ${id_veterinario}
            AND (
                '${data_consulta}'::TIMESTAMP,
                '${data_consulta}'::TIMESTAMP + INTERVAL '30 minutes'
            )
            OVERLAPS(
                data_consulta,
                data_consulta + INTERVAL '30 minutes'
            )
        );

        IF consulta_existente THEN
            RAISE EXCEPTION
            'Operação bloqueada: O veterinário já tem uma consulta a decorrer nesse horário.';
        END IF;

        INSERT INTO public.consulta
        (
            id_animal,
            id_veterinario,
            data_consulta,
            motivo
        )
        VALUES
        (
            ${id_animal},
            ${id_veterinario},
            '${data_consulta}'::TIMESTAMP,
            '${motivoSeguro}'
        );
    END $$;
    `;

    await pool.query(query);

    const result = await pool.query(
        `
        SELECT *
        FROM public.consulta
        WHERE id_animal = $1
        AND id_veterinario = $2
        AND data_consulta = $3
        ORDER BY id_consulta DESC
        LIMIT 1
        `,
        [id_animal, id_veterinario, data_consulta]
    );
    return result.rows[0];
};

// Obter consulta por ID
const obterConsultaByIdBD = async (id_consulta) => {
    const result = await pool.query(
        `
        SELECT *
        FROM consulta
        WHERE id_consulta = $1
        `,
        [id_consulta]
    );
    return result.rows[0];
};

// Atualizar consulta
const atualizarConsultaBD = async (
    id_consulta,
    id_animal,
    id_veterinario,
    data_consulta,
    motivo,
    diagnostico,
    estado,
    preco
) => {
    const query = `
        UPDATE consulta
        SET
            id_animal = $1,
            id_veterinario = $2,
            data_consulta = $3,
            motivo = $4,
            diagnostico = $5,
            estado = $6,
            preco = $7
        WHERE id_consulta = $8
        RETURNING *;
    `;
    const values = [id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco, id_consulta];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar consulta
const eliminarConsultaBD = async (id_consulta) => {
    await pool.query(
        `
        DELETE FROM fatura
        WHERE id_consulta = $1
        `,
        [id_consulta]
    );
    const result = await pool.query(
        `
        DELETE FROM consulta
        WHERE id_consulta = $1
        RETURNING *
        `,
        [id_consulta]
    );
    return result.rows[0];
};

// Obter consultas do veterinario especifico
const obterconsultasdovetespecificoBD = async (id_veterinario) => {
    const result = await pool.query(
        `
        SELECT 
        c.id_consulta,
        c.data_consulta,
        c.id_veterinario,
        c.id_animal,
        c.motivo,
        c.estado,
        a.raca AS raca_animal,
        a.nome AS nome_animal,      
        a.especie AS especie_animal, 
        cli.nome AS nome_cliente    
        FROM public.consulta c
        INNER JOIN public.animal a ON c.id_animal = a.id_animal
        INNER JOIN public.cliente cli ON a.id_cliente = cli.id_cliente
        WHERE c.id_veterinario = $1
        ORDER BY c.data_consulta ASC;
        `,
        [id_veterinario]
    );
    return result.rows;
};

// Obter consultas do animal especifico
const obterconsultasdoanipecificoBD = async (id_animal) => {
    const result = await pool.query(
        `
        SELECT 
        c.id_consulta,
        c.data_consulta,
        c.id_veterinario,
        a.id_animal,
        c.id_animal,
        c.motivo,
        v.nome AS nome_veterinario,
        a.raca AS raca_animal,
        a.nome AS nome_animal,      
        a.especie AS especie_animal, 
        cli.nome AS nome_cliente    
        FROM public.consulta c
        INNER JOIN public.veterinario v ON c.id_veterinario = v.id_veterinario
        INNER JOIN public.animal a ON c.id_animal = a.id_animal
        INNER JOIN public.cliente cli ON a.id_cliente = cli.id_cliente
        WHERE a.id_animal= $1
        ORDER BY c.data_consulta ASC;
        `,
        [id_animal]
    );
    return result.rows;
};


// Obter veterinario disponivel
const obterVeterinarioDisponivelBD = async (data_consulta) => {
    const query = `
        SELECT c.id_veterinario 
        FROM public.colaborador c
        JOIN public.horario h ON c.id_colaborador = h.id_colaborador
        WHERE c.id_veterinario IS NOT NULL
          AND h.dia_semana = CASE EXTRACT(DOW FROM $1::TIMESTAMP)
              WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
              WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
              WHEN 2 THEN CAST('Terça' AS public.dia_semana)
              WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
              WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
              WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
              WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
          END
          AND CAST($1::TIMESTAMP AS TIME) >= h.hora_entrada
          AND CAST(($1::TIMESTAMP + INTERVAL '30 minutes') AS TIME) <= h.hora_saida
          AND NOT EXISTS (
              SELECT 1 FROM public.consulta con
              WHERE con.id_veterinario = c.id_veterinario
                AND (con.data_consulta, con.data_consulta + INTERVAL '30 minutes') 
                    OVERLAPS ($1::TIMESTAMP, $1::TIMESTAMP + INTERVAL '30 minutes')
          )
        ORDER BY RANDOM() 
        LIMIT 1;
    `;
    const result = await pool.query(query, [data_consulta]);
    return result.rows[0];
};



// Obter funcionario de servico aleatorio
const obterFuncionarioServicoAleatorioBD = async (data_inicio, total_blocos) => {
    const timestampsBlocos = [];
    for (let i = 0; i < total_blocos; i++) {
        let bloco = new Date(data_inicio);
        bloco.setMinutes(bloco.getMinutes() + (i * 30));
        timestampsBlocos.push(bloco.toISOString());
    }

    const query = `
        SELECT c.id_funcionario 
        FROM public.colaborador c
        JOIN public.horario h ON c.id_colaborador = h.id_colaborador
        WHERE c.id_funcionario IS NOT NULL
          -- 2. Verifica se o dia da semana bate certo com o turno do funcionário
          AND h.dia_semana = CASE EXTRACT(DOW FROM $2::TIMESTAMP)
              WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
              WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
              WHEN 2 THEN CAST('Terça' AS public.dia_semana)
              WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
              WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
              WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
              WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
          END
          -- 3. Verifica se a duração total dos serviços cabe dentro do turno
          AND CAST($2::TIMESTAMP AS TIME) >= h.hora_entrada
          AND CAST(($2::TIMESTAMP + ($3 * INTERVAL '30 minutes')) AS TIME) <= h.hora_saida
          -- 4. Garante que ele não está noutro banho/tosquia
          AND c.id_funcionario NOT IN (
              SELECT id_funcionario 
              FROM public.servicos 
              WHERE data_servicos = ANY($1::TIMESTAMP[])
          )
        ORDER BY RANDOM() 
        LIMIT 1;
    `;

    const result = await pool.query(query, [timestampsBlocos, data_inicio, total_blocos]);
    return result.rows[0];
};

// Criar servico
const criarServicoBD = async (id_animal, id_funcionario, data_servico, tipo, preco) => {
    const query = `
        INSERT INTO public.servicos (id_animal, id_funcionario, data_servicos, tipo_servico, preco)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [id_animal, id_funcionario, data_servico, tipo, preco];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterConsultasDoClienteBD = async (id_cliente) => {
    const result = await pool.query(
        `
        SELECT 
        c.id_consulta,
        c.data_consulta AS data_hora,
        c.id_veterinario,
        a.id_animal,
        c.motivo,
        v.nome AS nome_veterinario,
        a.raca AS raca_animal,
        a.nome AS nome_animal,      
        a.especie AS especie_animal, 
        cli.nome AS nome_cliente    
        FROM public.consulta c
        INNER JOIN public.veterinario v ON c.id_veterinario = v.id_veterinario
        INNER JOIN public.animal a ON c.id_animal = a.id_animal
        INNER JOIN public.cliente cli ON a.id_cliente = cli.id_cliente
        WHERE cli.id_cliente = $1
        ORDER BY c.data_consulta ASC;
        `,
        [id_cliente]
    );
    return result.rows;
};

const guardarDiagnosticoFinalBD = async (id_consulta, diagnostico) => {
    try {
        const query = `
            UPDATE public.consulta
            SET 
                diagnostico = $1,
                estado_servico = 'Realizado'
            WHERE id_consulta = $2
            RETURNING *;
        `;
        
        const valores = [diagnostico, Number(id_consulta)];
        const resultado = await pool.query(query, valores);
        
        return resultado.rows[0];
    } catch (erro) {
        throw erro;
    }
};
module.exports = {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD,
    obterconsultasdovetespecificoBD,
    obterconsultasdoanipecificoBD,
    obterConsultasDoClienteBD,
    obterVeterinarioDisponivelBD,       
    obterFuncionarioServicoAleatorioBD, 
    criarServicoBD                      
};

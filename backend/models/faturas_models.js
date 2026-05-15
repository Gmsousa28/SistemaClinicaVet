const pool = require('../config/db.js');

const listarFaturasBD = async () => {
    const result = await pool.query('SELECT * FROM fatura ORDER BY id_fatura DESC');
    return result.rows;
};

const listarPendentesFaturacaoBD = async () => {
    const query = `
        SELECT
            'consulta' AS tipo,
            c.id_consulta AS id_origem,
            f.id_fatura,
            cli.nome AS cliente,
            cli.nif,
            a.nome || ' (' || a.especie || ')' AS animal,
            c.motivo AS servico,
            c.preco,
            c.data_consulta AS data_servico
        FROM public.consulta c
        INNER JOIN public.animal a ON c.id_animal = a.id_animal
        INNER JOIN public.cliente cli ON a.id_cliente = cli.id_cliente
        LEFT JOIN public.fatura f ON f.id_consulta = c.id_consulta
        WHERE c.estado = 'Agendado'
          AND c.data_consulta >= CURRENT_TIMESTAMP
          AND (f.id_fatura IS NULL OR f.valor_total = 0)

        UNION ALL

        SELECT
            'servico' AS tipo,
            s.id_servicos AS id_origem,
            f.id_fatura,
            cli.nome AS cliente,
            cli.nif,
            a.nome || ' (' || a.especie || ')' AS animal,
            s.tipo_servico::TEXT AS servico,
            s.preco,
            s.data_servicos AS data_servico
        FROM public.servicos s
        INNER JOIN public.animal a ON s.id_animal = a.id_animal
        INNER JOIN public.cliente cli ON a.id_cliente = cli.id_cliente
        LEFT JOIN public.fatura f ON f.id_servicos = s.id_servicos
        WHERE s.estado = 'Agendado'
          AND s.data_servicos >= CURRENT_TIMESTAMP
          AND (f.id_fatura IS NULL OR f.valor_total = 0)

        ORDER BY data_servico DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

const listarHistoricoFaturacaoBD = async () => {
    const query = `
        SELECT
            f.id_fatura,
            f.valor_total,
            COALESCE(c.data_consulta, s.data_servicos) AS data_servico,
            cli.nome AS cliente,
            cli.nif,
            a.nome || ' (' || a.especie || ')' AS animal,
            COALESCE(c.motivo, s.tipo_servico::TEXT) AS servico
        FROM public.fatura f
        LEFT JOIN public.consulta c ON f.id_consulta = c.id_consulta
        LEFT JOIN public.servicos s ON f.id_servicos = s.id_servicos
        INNER JOIN public.animal a ON a.id_animal = COALESCE(c.id_animal, s.id_animal)
        INNER JOIN public.cliente cli ON cli.id_cliente = a.id_cliente
        WHERE f.valor_total > 0
        ORDER BY f.id_fatura DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

const pagarFaturaBD = async (tipo, id_origem, valor_total) => {
    const campoOrigem = tipo === 'consulta' ? 'id_consulta' : 'id_servicos';
    const campoNulo = tipo === 'consulta' ? 'id_servicos' : 'id_consulta';
    const tabelaOrigem = tipo === 'consulta' ? 'consulta' : 'servicos';
    const campoEstadoOrigem = tipo === 'consulta' ? 'id_consulta' : 'id_servicos';
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE public.${tabelaOrigem}
             SET estado = 'Realizado'
             WHERE ${campoEstadoOrigem} = $1`,
            [id_origem]
        );

        const updateResult = await client.query(
            `UPDATE public.fatura
             SET valor_total = $1
             WHERE ${campoOrigem} = $2
             RETURNING *`,
            [valor_total, id_origem]
        );

        let fatura = updateResult.rows[0];

        if (!fatura) {
            const insertResult = await client.query(
                `INSERT INTO public.fatura (${campoOrigem}, ${campoNulo}, valor_total)
                 VALUES ($1, NULL, $2)
                 RETURNING *`,
                [id_origem, valor_total]
            );
            fatura = insertResult.rows[0];
        }

        await client.query('COMMIT');
        return fatura;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    listarFaturasBD,
    listarPendentesFaturacaoBD,
    listarHistoricoFaturacaoBD,
    pagarFaturaBD,
};

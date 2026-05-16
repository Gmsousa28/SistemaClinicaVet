const pool = require('../config/db.js');

const criarOcorrenciaBD = async (
    id_colaborador,
    data_inicio,
    data_fim,
    tipo,
    observacoes
) => {

    const query = `
        INSERT INTO public.ocorrencia_laboral 
        (
            id_colaborador,
            data_inicio,
            data_fim,
            tipo,
            observacoes
        ) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;
    `;

    const values = [
        id_colaborador,
        data_inicio,
        data_fim,
        tipo,
        observacoes
    ];

    const result =
        await pool.query(query, values);

    return result.rows[0];
};

const listarOcorrenciasBD = async () => {

    const query = `
        SELECT 
            o.*,
            c.cargo AS nome_colaborador

        FROM public.ocorrencia_laboral o

        INNER JOIN public.colaborador c
            ON o.id_colaborador = c.id_colaborador

        ORDER BY o.data_inicio DESC;
    `;

    const result =
        await pool.query(query);

    return result.rows;
};

const listarFeriasAdminBD = async () => {

    const query = `
        SELECT *
        FROM public.ocorrencia_laboral
        ORDER BY data_inicio DESC;
    `;

    const result =
        await pool.query(query);

    return result.rows;
};

const atualizarOcorrenciaBD = async (
    id_colaborador,
    data_inicio,
    data_fim,
    tipo,
    observacoes
) => {

    const query = `
        UPDATE public.ocorrencia_laboral
        SET
            data_inicio = $1,
            data_fim = $2,
            tipo = $3,
            observacoes = $4
        WHERE id_colaborador = $5
        RETURNING *;
    `;

    const values = [
        data_inicio,
        data_fim,
        tipo,
        observacoes,
        id_colaborador
    ];

    const result =
        await pool.query(query, values);

    return result.rows[0];
};

module.exports = {

    criarOcorrenciaBD,

    listarOcorrenciasBD,

    listarFeriasAdminBD,

    atualizarOcorrenciaBD
};
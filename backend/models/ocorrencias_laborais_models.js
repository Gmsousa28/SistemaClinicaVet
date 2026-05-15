const pool = require('../config/db.js');

// =======================================================
// LISTAR OCORRÊNCIAS
// =======================================================
const listarOcorrenciasLaboraisBD = async () => {

    const result = await pool.query(
        'SELECT * FROM ocorrencia_laboral ORDER BY id_colaborador DESC'
    );

    return result.rows;
};

// =======================================================
// CRIAR OCORRÊNCIA
// =======================================================
const criarOcorrenciaLaboralBD = async (
    id_colaborador,
    data_inicio,
    data_fim,
    tipo,
    observacoes
) => {

    const query = `
        INSERT INTO ocorrencia_laboral
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

    const result = await pool.query(query, values);

    return result.rows[0];
};

// =======================================================
// ATUALIZAR OCORRÊNCIA
// =======================================================
const atualizarOcorrenciaLaboralBD = async (
    id_colaborador,
    data_inicio,
    data_fim,
    tipo,
    observacoes
) => {

    const query = `
        UPDATE ocorrencia_laboral
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

    const result = await pool.query(query, values);

    return result.rows[0];
};

// =======================================================
// ELIMINAR OCORRÊNCIA
// =======================================================
const eliminarOcorrenciaLaboralBD = async (
    id_colaborador
) => {

    const result = await pool.query(
        'DELETE FROM ocorrencia_laboral WHERE id_colaborador = $1 RETURNING *',
        [id_colaborador]
    );

    return result.rows[0];
};

module.exports = {
    listarOcorrenciasLaboraisBD,
    criarOcorrenciaLaboralBD,
    atualizarOcorrenciaLaboralBD,
    eliminarOcorrenciaLaboralBD,
};
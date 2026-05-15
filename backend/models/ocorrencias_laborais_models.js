const pool = require('../config/db.js');

const criarOcorrenciaBD = async (id_colaborador, data_inicio, data_fim, tipo, observacoes) => {
    const query = `
        INSERT INTO public.ocorrencia_laboral (id_colaborador, data_inicio, data_fim, tipo, observacoes) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;
    `;
    const values = [id_colaborador, data_inicio, data_fim, tipo, observacoes];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    criarOcorrenciaBD
};
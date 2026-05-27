const pool = require('../config/db.js');

const orientaMedicamentoBD = async (id_consulta, id_medicamento, descricao) => {
    try {
        const query = `
            INSERT INTO public.precreve (id_consulta, id_medicamento, quantidade, descricao) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const valores = [id_consulta, id_medicamento, quantidade, descricao];
        const resultado = await pool.query(query, valores);
        return resultado.rows[0];
    } catch (erro) {
        throw erro;
    }
}

// CORREÇÃO: Usar module.exports em vez de apenas exports
module.exports = {
    orientaMedicamentoBD
};
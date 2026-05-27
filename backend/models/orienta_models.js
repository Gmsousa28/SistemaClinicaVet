const pool = require('../config/db.js');

// Adicionado 'quantidade' aos argumentos da função
const orientaMedicamentoBD = async (id_consulta, id_medicamento, quantidade, descricao) => {
    try {
        const query = `
            INSERT INTO public.prescreve (id_consulta, id_medicamento, quantidade, descricao) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *;
        `; // 💡 Corrigido "prescreve" e adicionado o $4
        
        const valores = [id_consulta, id_medicamento, quantidade, descricao];
        const resultado = await pool.query(query, valores);
        return resultado.rows[0];
    } catch (erro) {
        throw erro;
    }
}

module.exports = {
    orientaMedicamentoBD
};
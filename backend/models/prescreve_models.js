const pool = require('../config/db.js'); // Ajusta o caminho para a tua ligação à BD

// Função para inserir um único exame na tabela orienta
const prescreverExameBD = async (id_consulta, id_exame, descricao) => {
    try {
        const query = `
            INSERT INTO public.orienta (id_consulta, id_exame, descricao) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const valores = [id_consulta, id_exame, descricao];
        const resultado = await pool.query(query, valores);
        return resultado.rows[0];
    } catch (erro) {
        throw erro;
    }
};

module.exports = {
    prescreverExameBD
};
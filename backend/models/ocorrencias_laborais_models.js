const pool = require('../config/db.js');

// 1. Função para CRIAR nova falta/atraso
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

// 2. Função para LISTAR as faltas e atrasos
const listarOcorrenciasBD = async () => {
    const query = `
        SELECT o.*, c.nome as nome_colaborador 
        FROM public.ocorrencia_laboral o
        INNER JOIN public.colaborador c ON o.id_colaborador = c.id_colaborador
        ORDER BY o.data_inicio DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

// 3. Exportar as duas funções para o Controller
module.exports = {
    criarOcorrenciaBD,
    listarOcorrenciasBD
};
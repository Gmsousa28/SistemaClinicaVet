const pool = require('../config/db.js');

// Listar exames
const listarExamesBD = async () => {
    const result = await pool.query('SELECT * FROM exame ORDER BY id_exame DESC');
    return result.rows;
};

// Criar exame
const criarExameBD = async (nome, valor_cobrado) => {
    const query = `
        INSERT INTO exame (nome, valor_cobrado) 
        VALUES ($1, $2) 
        RETURNING *;
    `;
    const values = [nome, valor_cobrado];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obter exame por ID
const obterExameByIdBD = async (id_exame) => {
    const result = await pool.query('SELECT * FROM exame WHERE id_exame = $1', [id_exame]);
    return result.rows[0];
};

// Obter exame por nome
const obterExameByNameBD = async (nome) => {
    const result = await pool.query('SELECT * FROM exame WHERE nome = $1', [nome]);
    return result.rows[0];
};

// Atualizar exame
const atualizarExameBD = async (id_exame, nome, valor_cobrado) => {
    const query = `
        UPDATE exame 
        SET nome = $1, valor_cobrado = $2 
        WHERE id_exame = $3 
        RETURNING *;
    `;
    const values = [nome, valor_cobrado, id_exame];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar exame
const eliminarExameBD = async (id_exame) => {
    const result = await pool.query('DELETE FROM exame WHERE id_exame = $1 RETURNING *', [id_exame]);
    return result.rows[0];
};

module.exports = {
    listarExamesBD,
    criarExameBD,
    obterExameByIdBD,
    obterExameByNameBD,
    atualizarExameBD,
    eliminarExameBD
};



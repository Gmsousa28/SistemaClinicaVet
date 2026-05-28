const pool = require('../config/db.js');


/**
 * Lista todas as adoções.
 * @param {number} id_cliente 
 * @returns {Promise<Array>} Lista de adoções
 */
// Listar adocoes
const listarAdocoesBD = async () => {
    const result = await pool.query('SELECT * FROM adocao ORDER BY data_adocao DESC');
    return result.rows;
};

// Criar adocao
const criarAdocaoBD = async (id_animal, id_cliente, data_adocao) => {
    const query = `
        INSERT INTO adocao (id_animal, id_cliente, data_adocao) 
        VALUES ($1, $2, $3) 
        RETURNING *;
    `;
    const values = [id_animal, id_cliente, data_adocao];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obter adocao por ID do animal
const obterAdocaoPorIdAnimalBD = async (id_animal) => {
    const result = await pool.query('SELECT * FROM adocao WHERE id_adocao = $1', [id_animal]);
    return result.rows[0];
};

// Obter adocao por ID
const obterAdocaoPorIdBD = async (id_adocao) => {
    const result = await pool.query('SELECT * FROM adocao WHERE id_adocao = $1', [id_adocao]);
    return result.rows[0];
};

// Eliminar adocao
const eliminarAdocaoBD = async (id_adocao) => {
    const result = await pool.query('DELETE FROM adocao WHERE id_adocao = $1 RETURNING *', [id_adocao]);
    return result.rows[0];
};

module.exports = {
    listarAdocoesBD,
    criarAdocaoBD,
    obterAdocaoPorIdAnimalBD,
    obterAdocaoPorIdBD,
    eliminarAdocaoBD
};

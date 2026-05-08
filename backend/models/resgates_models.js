const pool = require('../config/db.js');

const listarResgatesBD = async () => {
    const result = await pool.query('SELECT * FROM resgate ORDER BY data_resgate DESC');
    return result.rows;
};

const criarResgateBD = async (id_animal, id_funcionario, data_resgate, idade) => {
    const query = `
        INSERT INTO resgate (id_animal, id_funcionario, data_resgate, idade) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
    `;
    const values = [id_animal, id_funcionario, data_resgate, idade];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterResgatePorIdBD = async (id_resgate) => {
    const result = await pool.query('SELECT * FROM resgate WHERE id_resgate = $1', [id_resgate]);
    return result.rows[0];
};

const atualizarResgateBD = async (id_resgate, id_animal, id_funcionario, data_resgate, idade) => {
    const query = `
        UPDATE resgate 
        SET id_animal = $1, id_funcionario = $2, data_resgate = $3, idade = $4 
        WHERE id_resgate = $5 
        RETURNING *;
    `;
    const values = [id_animal, id_funcionario, data_resgate, idade, id_resgate];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarResgateBD = async (id_resgate) => {
    const result = await pool.query('DELETE FROM resgate WHERE id_resgate = $1 RETURNING *', [id_resgate]);
    return result.rows[0];
};

module.exports = {
    listarResgatesBD,
    criarResgateBD,
    obterResgatePorIdBD,
    atualizarResgateBD,
    eliminarResgateBD
};
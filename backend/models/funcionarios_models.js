const pool = require('../config/db.js');

const listarFuncionariosBD = async () => {
    const result = await pool.query('SELECT * FROM funcionario ORDER BY nome ASC');
    return result.rows;
};

const criarFuncionarioBD = async (nome, morada, email, nif, contacto, cargo) => {
    const query = `
        INSERT INTO funcionario (nome, morada, email, nif, contacto, cargo) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
    `;
    const values = [nome, morada, email, nif, contacto, cargo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterFuncionarioPorIdBD = async (id_funcionario) => {
    const result = await pool.query('SELECT * FROM funcionario WHERE id_funcionario = $1', [id_funcionario]);
    return result.rows[0];
};

const atualizarFuncionarioBD = async (id_funcionario, nome, morada, email, nif, contacto, cargo) => {
    const query = `
        UPDATE funcionario 
        SET nome = $1, morada = $2, email = $3, nif = $4, contacto = $5, cargo = $6 
        WHERE id_funcionario = $7 
        RETURNING *;
    `;
    const values = [nome, morada, email, nif, contacto, cargo, id_funcionario];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarFuncionarioBD = async (id_funcionario) => {
    const result = await pool.query('DELETE FROM funcionario WHERE id_funcionario = $1 RETURNING *', [id_funcionario]);
    return result.rows[0];
};

module.exports = {
    listarFuncionariosBD,
    criarFuncionarioBD,
    obterFuncionarioPorIdBD,
    atualizarFuncionarioBD,
    eliminarFuncionarioBD
};
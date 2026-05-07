const pool = require('../config/db.js');

// 1. Listar todos os clientes (ordenados por nome)
const listarClientesBD = async () => {
    const result = await pool.query('SELECT * FROM cliente ORDER BY nome ASC');
    return result.rows;
};

// 2. Criar um novo cliente
// Nota: Incluímos o id_login_cliente que é obrigatório (NOT NULL)
const criarClienteBD = async (id_login_cliente, nome, morada, email, nif, contacto) => {
    const query = `
        INSERT INTO cliente (id_login_cliente, nome, morada, email, nif, contacto) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
    `;
    const values = [id_login_cliente, nome, morada, email, nif, contacto];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// 3. Obter um cliente específico pelo ID
const obterClientePorIdBD = async (id_cliente) => {
    const result = await pool.query('SELECT * FROM cliente WHERE id_cliente = $1', [id_cliente]);
    return result.rows[0];
};

// 4. Atualizar os dados de um cliente
const atualizarClienteBD = async (id_cliente, id_login_cliente, nome, morada, email, nif, contacto) => {
    const query = `
        UPDATE cliente 
        SET id_login_cliente = $1, nome = $2, morada = $3, email = $4, nif = $5, contacto = $6 
        WHERE id_cliente = $7 
        RETURNING *;
    `;
    const values = [id_login_cliente, nome, morada, email, nif, contacto, id_cliente];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// 5. Eliminar um cliente
const eliminarClienteBD = async (id_cliente) => {
    const result = await pool.query('DELETE FROM cliente WHERE id_cliente = $1 RETURNING *', [id_cliente]);
    return result.rows[0];
};

module.exports = {
    listarClientesBD,
    criarClienteBD,
    obterClientePorIdBD,
    atualizarClienteBD,
    eliminarClienteBD
};
const pool = require('../config/db.js');

const listarVeterinariosBD = async () => {
    const result = await pool.query('SELECT * FROM veterinario ORDER BY nome ASC');
    return result.rows;
};

const criarVeterinarioBD = async (nome, morada, contacto, email, nif, especialidade) => {
    const query = `
        INSERT INTO veterinario (nome, morada, contacto, email, nif, especialidade) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
    `;
    const values = [nome, morada, contacto, email, nif, especialidade];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterVeterinarioPorIdBD = async (id_veterinario) => {
    const result = await pool.query('SELECT * FROM veterinario WHERE id_veterinario = $1', [id_veterinario]);
    return result.rows[0];
};

const atualizarVeterinarioBD = async (id_veterinario, nome, morada, contacto, email, nif, especialidade) => {
    const query = `
        UPDATE veterinario 
        SET nome = $1, morada = $2, contacto = $3, email = $4, nif = $5, especialidade = $6 
        WHERE id_veterinario = $7 
        RETURNING *;
    `;
    const values = [nome, morada, contacto, email, nif, especialidade, id_veterinario];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarVeterinarioBD = async (id_veterinario) => {
    const result = await pool.query('DELETE FROM veterinario WHERE id_veterinario = $1 RETURNING *', [id_veterinario]);
    return result.rows[0];
};

module.exports = {
    listarVeterinariosBD,
    criarVeterinarioBD,
    obterVeterinarioPorIdBD,
    atualizarVeterinarioBD,
    eliminarVeterinarioBD
};
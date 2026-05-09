const pool = require('../config/db.js');

const listarAnimaisBD = async () => {
    // Usamos o nome exato da tabela: animal
    const result = await pool.query('SELECT * FROM animal ORDER BY nome ASC');
    return result.rows;
};

const criarAnimalBD = async (id_cliente, nome, especie, raca, sexo, data_nascimento, estado) => {
    const query = `
        INSERT INTO animal (id_cliente, nome, especie, raca, sexo, data_nascimento, estado) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
    `;
    const values = [id_cliente, nome, especie, raca, sexo, data_nascimento, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterAnimalPorIdBD = async (id_animal) => {
    // Usamos o id_animal na condição
    const result = await pool.query('SELECT * FROM animal WHERE id_animal = $1', [id_animal]);
    return result.rows[0];
};

const atualizarAnimalBD = async (id_animal, id_cliente, nome, especie, raca, sexo, data_nascimento, estado) => {
    const query = `
        UPDATE animal 
        SET id_cliente = $1, nome = $2, especie = $3, raca = $4, sexo = $5, data_nascimento = $6, estado = $7 
        WHERE id_animal = $8 
        RETURNING *;
    `;
    const values = [id_cliente, nome, especie, raca, sexo, data_nascimento, estado, id_animal];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarAnimalBD = async (id_animal) => {
    const result = await pool.query('DELETE FROM animal WHERE id_animal = $1 RETURNING *', [id_animal]);
    return result.rows[0];
};

module.exports = {
    listarAnimaisBD,
    criarAnimalBD,
    obterAnimalPorIdBD,
    atualizarAnimalBD,
    eliminarAnimalBD
};
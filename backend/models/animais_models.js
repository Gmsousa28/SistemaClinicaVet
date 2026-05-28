const pool = require('../config/db.js');


// Listar animais
const listarAnimaisBD = async () => {
    const query = `
        SELECT 
            animal.*, 
            cliente.nome AS nome_cliente,
            cliente.nif AS nif_cliente 
        FROM animal 
        LEFT JOIN cliente ON animal.id_cliente = cliente.id_cliente 
        ORDER BY animal.nome ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
};



// Criar animal
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

// Obter animal por ID
const obterAnimalPorIdBD = async (id_animal) => {
    const result = await pool.query('SELECT * FROM animal WHERE id_animal = $1', [id_animal]);
    return result.rows[0];
};

// Atualizar animal
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

// Eliminar animal
const eliminarAnimalBD = async (id_animal) => {
    const result = await pool.query('DELETE FROM animal WHERE id_animal = $1 RETURNING *', [id_animal]);
    return result.rows[0];
};

// Listar animais por dono
const listarAnimaisPorDonoBD = async (nif) => {
    const query = `
        SELECT 
            animal.* FROM animal
        INNER JOIN cliente ON animal.id_cliente = cliente.id_cliente
        WHERE cliente.nif = $1
        ORDER BY animal.nome ASC;
    `;
    const result = await pool.query(query, [nif]);
    return result.rows;
};


module.exports = {
    listarAnimaisBD,
    criarAnimalBD,
    obterAnimalPorIdBD,
    atualizarAnimalBD,
    eliminarAnimalBD,
    listarAnimaisPorDonoBD,
};

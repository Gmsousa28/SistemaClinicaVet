const pool = require('../config/db.js');

const listarResgatesBD = async () => {

    const query = `

        SELECT
            r.*,
            a.especie,
            a.raca,
            a.estado

        FROM resgate r

        INNER JOIN animal a
            ON r.id_animal = a.id_animal

        ORDER BY r.data_resgate DESC

    `;

    const result =
        await pool.query(query);

    return result.rows;
};

const criarResgateBD = async (
    id_animal,
    id_funcionario,
    data_resgate,
    idade
) => {

    const query = `
        INSERT INTO resgate 
        (
            id_animal,
            id_funcionario,
            data_resgate,
            idade
        ) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
    `;

    const values = [
        id_animal,
        id_funcionario,
        data_resgate,
        idade
    ];

    const result =
        await pool.query(query, values);

    return result.rows[0];
};

const obterResgatePorIdBD = async (
    id_resgate
) => {

    const query = `

        SELECT
            r.*,
            a.especie,
            a.raca,
            a.estado

        FROM resgate r

        INNER JOIN animal a
            ON r.id_animal = a.id_animal

        WHERE r.id_resgate = $1

    `;

    const result =
        await pool.query(query, [id_resgate]);

    return result.rows[0];
};

const atualizarResgateBD = async (
    id_resgate,
    id_animal,
    id_funcionario,
    data_resgate,
    idade
) => {

    const query = `
        UPDATE resgate 
        SET 
            id_animal = $1,
            id_funcionario = $2,
            data_resgate = $3,
            idade = $4 
        WHERE id_resgate = $5 
        RETURNING *;
    `;

    const values = [
        id_animal,
        id_funcionario,
        data_resgate,
        idade,
        id_resgate
    ];

    const result =
        await pool.query(query, values);

    return result.rows[0];
};

const eliminarResgateBD = async (
    id_resgate
) => {

    const query = `
        DELETE FROM resgate
        WHERE id_resgate = $1
        RETURNING *;
    `;

    const result =
        await pool.query(query, [id_resgate]);

    return result.rows[0];
};

module.exports = {

    listarResgatesBD,

    criarResgateBD,

    obterResgatePorIdBD,

    atualizarResgateBD,

    eliminarResgateBD
};
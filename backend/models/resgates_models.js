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



const listarResgatesPainelBD = async () => {
    const query = `
        SELECT r.*, r.idade AS idade_aprox, a.nome, a.especie, a.raca, a.estado
        FROM resgate r
        INNER JOIN animal a ON r.id_animal = a.id_animal
        WHERE a.estado != 'Adotado' -- <--- Esta linha faz a magia de esconder!
        ORDER BY r.data_resgate DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
};


const criarResgateCompletoBD = async (nome, especie, raca, idade, data_resgate, id_funcionario) => {
    // Insere o animal e usa o ID gerado para inserir o resgate
    const query = `
        WITH novo_animal AS (
            INSERT INTO animal (id_cliente, nome, especie, raca, sexo, data_nascimento, estado)
            VALUES (1, $1, $2, $3, 'M', CURRENT_DATE, 'Resgatado') 
            RETURNING id_animal
        )
        INSERT INTO resgate (id_animal, id_funcionario, data_resgate, idade)
        VALUES ((SELECT id_animal FROM novo_animal), $6, $4, $5)
        RETURNING *;
    `;
    const values = [nome || 'Sem Nome', especie, raca, data_resgate, idade, id_funcionario];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// NOVA FUNÇÃO: Formalizar a Adoção
const formalizarAdocaoBD = async (id_animal, nif_cliente) => {
    
    // 1. Procurar qual é o id_cliente através do NIF
    const queryCliente = await pool.query('SELECT id_cliente FROM cliente WHERE nif = $1', [nif_cliente]);
    
    if (queryCliente.rows.length === 0) {
        throw new Error("Cliente não encontrado na base de dados.");
    }
    
    const id_cliente_novo = queryCliente.rows[0].id_cliente;

    // 2. Atualizar o animal com o novo dono (e mudar o estado para Adotado)
    const queryUpdate = `
        UPDATE animal 
        SET id_cliente = $1, estado = 'Adotado' 
        WHERE id_animal = $2 
        RETURNING *;
    `;
    
    const result = await pool.query(queryUpdate, [id_cliente_novo, id_animal]);
    return result.rows[0];
};

const listarAdocoesArquivoBD = async () => {
    const query = `
        SELECT 
            a.id_animal, 
            a.nome AS nome_animal, 
            c.nome AS nome_dono, 
            c.nif, 
            r.data_resgate
        FROM animal a
        INNER JOIN cliente c ON a.id_cliente = c.id_cliente
        INNER JOIN resgate r ON a.id_animal = r.id_animal
        WHERE a.estado = 'Adotado'
        ORDER BY r.data_resgate DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {

    listarResgatesBD,
    listarResgatesPainelBD,
    criarResgateCompletoBD,
    criarResgateBD,
    formalizarAdocaoBD,
    obterResgatePorIdBD,
    atualizarResgateBD,
    eliminarResgateBD,
    listarAdocoesArquivoBD
};
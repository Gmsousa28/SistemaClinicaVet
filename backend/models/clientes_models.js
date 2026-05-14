const pool = require('../config/db.js');

const listarClientesBD = async () => {
    // Usamos o nome exato da tabela: cliente e a coluna id_cliente
    const result = await pool.query('SELECT * FROM cliente ORDER BY id_cliente ASC');
    return result.rows;
};

const obterClienteByIDBD = async(id_cliente) => {
    // Correção: a coluna chama-se id_cliente e não apenas id
    const result = await pool.query('SELECT * FROM cliente WHERE id_cliente = $1', [id_cliente]);
    return result.rows[0];
};

const obterClienteByNifBD = async(nif) => {
    const result = await pool.query('SELECT * FROM cliente WHERE nif = $1', [nif]);
    return result.rows[0];
};

const criarClienteBD = async (nome, morada, email, nif, contacto) => {
    // Pedimos um "client" de ligação ao pool para fazer a transação dupla
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicia a transação

        // 1º Passo: Criar o login com a password fixa "1234"
        const queryLogin = `
            INSERT INTO public.login_cliente (email, palavra_passe, conta_ativa) 
            VALUES ($1, $2, true) 
            RETURNING id_login_cliente;
        `;
        // Vê aqui: passamos o texto '1234' diretamente!
        const resLogin = await client.query(queryLogin, [email, '1234']); 
        const idNovoLogin = resLogin.rows[0].id_login_cliente;

        // 2º Passo: Criar o cliente com o ID do login acabado de gerar
        const queryCliente = `
            INSERT INTO public.cliente (id_login_cliente, nome, morada, email, nif, contacto) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const resCliente = await client.query(queryCliente, [idNovoLogin, nome, morada, email, nif, contacto]);

        await client.query('COMMIT'); // Confirma tudo na base de dados

        return resCliente.rows[0]; // Devolve o cliente criado
    } catch (err) {
        await client.query('ROLLBACK'); // Se der erro, cancela tudo
        throw err;
    } finally {
        client.release(); // Liberta a ligação
    }
};

const atualizarClienteBD = async (id_cliente, nome, morada, email, nif, contacto) => {
    const query = `
        UPDATE public.cliente 
        SET nome = $1, morada = $2, email = $3, nif = $4, contacto = $5 
        WHERE id_cliente = $6 
        RETURNING *;
    `;
    const values = [nome, morada, email, nif, contacto, id_cliente];
    
    const result = await pool.query(query, values);
    
    return result.rows[0];
};

const eliminarClienteByIdBD = async (id_cliente) => {
    const result = await pool.query('DELETE FROM cliente WHERE id_cliente = $1 RETURNING *', [id_cliente]);
    return result.rows[0];
};


module.exports = {
    listarClientesBD,
    obterClienteByIDBD,
    obterClienteByNifBD,
    criarClienteBD,
    atualizarClienteBD,
    eliminarClienteByIdBD
};
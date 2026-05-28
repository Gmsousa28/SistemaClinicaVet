const pool = require('../config/db.js');

// Listar clientes
const listarClientesBD = async () => {
    
    const result = await pool.query('SELECT * FROM cliente ORDER BY id_cliente ASC');
    return result.rows;
};

// Obter cliente por ID
const obterClienteByIDBD = async(id_cliente) => {
    
    const result = await pool.query('SELECT * FROM cliente WHERE id_cliente = $1', [id_cliente]);
    return result.rows[0];
};

// Obter cliente por NIF
const obterClienteByNifBD = async(nif) => {
    const result = await pool.query('SELECT * FROM cliente WHERE nif = $1', [nif]);
    return result.rows[0];
};

// Criar cliente
const criarClienteBD = async (nome, morada, email, nif, contacto) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 
        const queryLogin = `
            INSERT INTO public.login_cliente (email, palavra_passe, conta_ativa) 
            VALUES ($1, $2, true) 
            RETURNING id_login_cliente;
        `;
        const resLogin = await client.query(queryLogin, [email, '1234']); 
        const idNovoLogin = resLogin.rows[0].id_login_cliente;


        const queryCliente = `
            INSERT INTO public.cliente (id_login_cliente, nome, morada, email, nif, contacto) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const resCliente = await client.query(queryCliente, [idNovoLogin, nome, morada, email, nif, contacto]);

        await client.query('COMMIT'); 

        return resCliente.rows[0]; 
    } catch (err) {
        await client.query('ROLLBACK'); 
        throw err;
    } finally {
        client.release(); 
    }
};

// Atualizar cliente
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

// Eliminar cliente por ID
const eliminarClienteByIdBD = async (id_cliente) => {
    const result = await pool.query('DELETE FROM cliente WHERE id_cliente = $1 RETURNING *', [id_cliente]);
    return result.rows[0];
};


// Registar cliente completo
const registarClienteCompletoBD = async (dados) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const queryLogin = `
            INSERT INTO public.login_cliente (email, palavra_passe, conta_ativa)
            VALUES ($1, $2, TRUE)
            RETURNING id_login_cliente; -- Puxa o ID que o PostgreSQL acabou de gerar!
        `;
        const resLogin = await client.query(queryLogin, [dados.email, dados.palavra_passe]);
        const idLoginGerado = resLogin.rows[0].id_login_cliente;

        const queryCliente = `
            INSERT INTO public.cliente (id_login_cliente, nome, morada, email, nif, contacto)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const valoresCliente = [
            idLoginGerado,     
            dados.nome,         
            dados.morada,     
            dados.email,        
            dados.nif,         
            dados.contacto      
        ];
        
        await client.query(queryCliente, valoresCliente);

        await client.query('COMMIT');
        return { sucesso: true };

    } catch (erro) {
        await client.query('ROLLBACK');
        throw erro;
    } finally {
        client.release();
    }
};




module.exports = {
    listarClientesBD,
    obterClienteByIDBD,
    obterClienteByNifBD,
    criarClienteBD,
    atualizarClienteBD,
    eliminarClienteByIdBD,
    registarClienteCompletoBD
};

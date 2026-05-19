const pool = require('../config/db.js');

const listarLoginsColaboradoresBD = async () => {
    const result = await pool.query('SELECT * FROM login_colaborador ORDER BY id_login_colaborador DESC');
    return result.rows;
};

const verificarLoginColaboradorBD = async (email) => {
    const query = `
        SELECT 
            c.id_colaborador, 
            c.id_funcionario, 
            c.id_veterinario, 
            COALESCE(f.nome, v.nome) AS nome,
            lc.email, 
            lc.palavra_passe
        FROM 
            public.colaborador c
        INNER JOIN 
            public.login_colaborador lc ON c.id_login_colaborador = lc.id_login_colaborador
        LEFT JOIN 
            public.funcionario f ON c.id_funcionario = f.id_funcionario
        LEFT JOIN 
            public.veterinario v ON c.id_veterinario = v.id_veterinario
        WHERE 
            lc.email = $1 AND lc.conta_ativa = TRUE;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0]; 
};

// MANTIDA PARA A ROTA DE PERFIL: Procura diretamente pelo id_colaborador (vido da URL)
const obterPerfilColaboradorBD = async (id_colaborador) => {
    const query = `
        SELECT 
            c.id_colaborador, 
            lc.email,
            COALESCE(f.nome, v.nome) AS nome,
            COALESCE(f.nif, v.nif) AS nif,
            COALESCE(f.contacto, v.contacto) AS telefone, 
            COALESCE(f.morada, v.morada) AS morada
        FROM 
            public.colaborador c
        INNER JOIN 
            public.login_colaborador lc ON c.id_login_colaborador = lc.id_login_colaborador
        LEFT JOIN 
            public.funcionario f ON c.id_funcionario = f.id_funcionario
        LEFT JOIN 
            public.veterinario v ON c.id_veterinario = v.id_veterinario
        WHERE 
            c.id_colaborador = $1;
    `;
    const result = await pool.query(query, [id_colaborador]);
    return result.rows[0]; 
};

const obterPerfilPorLoginColabBD = async (id_login_colaborador) => {
    const query = `
        SELECT 
            c.id_colaborador, 
            c.cargo, -- 👈 ADICIONADO: Puxa o cargo real da tabela colaborador ('Veterinário', 'Funcionário', 'Admin')
            lc.email,
            COALESCE(f.nome, v.nome) AS nome,
            COALESCE(f.nif, v.nif) AS nif,
            COALESCE(f.contacto, v.contacto) AS telefone, 
            COALESCE(f.morada, v.morada) AS morada
        FROM 
            public.colaborador c
        INNER JOIN 
            public.login_colaborador lc ON c.id_login_colaborador = lc.id_login_colaborador
        LEFT JOIN 
            public.funcionario f ON c.id_funcionario = f.id_funcionario
        LEFT JOIN 
            public.veterinario v ON c.id_veterinario = v.id_veterinario
        WHERE 
            lc.id_login_colaborador = $1;
    `;
    
    const result = await pool.query(query, [id_login_colaborador]);
    return result.rows[0]; 
};

// Chama a function realizar_login_colab que está no PostgreSQL
const realizarLoginColaboradorBD = async (email, palavra_passe) => {
    const query = `
        SELECT * FROM public.realizar_login_colab($1, $2);
    `;
    const result = await pool.query(query, [email, palavra_passe]);
    return result.rows[0]; 
};

// Chama a function logout_dispositivo_colab que está no PostgreSQL
const logoutDispositivoColabBD = async (id_colaborador, id_logs) => {
    // A MAGIA ESTÁ AQUI NA QUERY: 
    // Em vez de enviarmos o $1 (ex: 7) diretamente, pedimos ao PostgreSQL para 
    // descobrir primeiro qual é o id_login_colaborador (ex: 8) que lhe corresponde!
    const query = `
        SELECT public.logout_dispositivo_colab(
            (SELECT id_login_colaborador FROM public.colaborador WHERE id_colaborador = $1), 
            $2
        );
    `;
    
    const result = await pool.query(query, [id_colaborador, id_logs]);
    
    return result.rows[0]; 
};

module.exports = {
    listarLoginsColaboradoresBD,
    verificarLoginColaboradorBD,
    obterPerfilColaboradorBD,
    obterPerfilPorLoginColabBD,
    realizarLoginColaboradorBD,
    logoutDispositivoColabBD
};
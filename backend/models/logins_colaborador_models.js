const pool = require('../config/db.js');

const listarLoginsColaboradoresBD = async () => {
    const result = await pool.query('SELECT * FROM login_colaborador ORDER BY id_login_colaborador DESC');
    return result.rows;
};

const verificarLoginColaboradorBD = async (email) => {
    const query = `
        SELECT 
            c.id_colaborador, 
            c.id_funcionario, -- <--- AGORA TAMBÉM PUXAMOS O ID VERDADEIRO DO FUNCIONÁRIO!
            c.id_veterinario, -- (Aproveitamos e puxamos o do vet também para o futuro)
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


// NOVA FUNÇÃO: Procura a ficha completa do colaborador juntando as duas tabelas
const obterPerfilColaboradorBD = async (id_colaborador) => {
    const query = `
        SELECT 
            c.id_colaborador, 
            lc.email,
            COALESCE(f.nome, v.nome) AS nome,
            COALESCE(f.nif, v.nif) AS nif,
            
            -- AQUI ESTÁ A CORREÇÃO MÁGICA: Vai buscar o 'contacto' mas chama-lhe 'telefone'
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
// Lembra-te de adicionar obterPerfilColaboradorBD no module.exports lá no fundo!

module.exports = {
    listarLoginsColaboradoresBD,
    verificarLoginColaboradorBD,
    obterPerfilColaboradorBD
};
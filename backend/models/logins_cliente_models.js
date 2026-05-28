const pool = require('../config/db.js');

// Listar logins de clientes
const listarLoginsClientesBD = async () => {
    const result = await pool.query('SELECT * FROM login_cliente ORDER BY id_login_cliente DESC');
    return result.rows;
};

// Verificar login de cliente
const verificarLoginClienteBD = async (email) => {
    // Atenção: Usa as crases (`) para poderes ter várias linhas
    const result = await pool.query(`
        SELECT 
            c.id_cliente, 
            lc.email, 
            lc.palavra_passe
        FROM 
            public.cliente c
        INNER JOIN 
            public.login_cliente lc ON c.id_login_cliente = lc.id_login_cliente
        WHERE 
            lc.email = $1 AND lc.conta_ativa = TRUE;
    `, [email]);
    
    // Devolve o cliente se o encontrar
    return result.rows[0]; 
};

module.exports = {
    listarLoginsClientesBD,
    verificarLoginClienteBD
};

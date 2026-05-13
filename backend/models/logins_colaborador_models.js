const pool = require('../config/db.js');

const listarLoginsColaboradoresBD = async () => {
    const result = await pool.query('SELECT * FROM login_colaborador ORDER BY id_login_colaborador DESC');
    return result.rows;
};

const verificarLoginColaboradorBD = async (email) => {
    const result = await pool.query(`
        SELECT 
            c.id_colaborador, 
            lc.email, 
            lc.palavra_passe
        FROM 
            public.colaborador c
        INNER JOIN 
            public.login_colaborador lc ON c.id_login_colaborador = lc.id_login_colaborador
        WHERE 
            lc.email = $1 AND lc.conta_ativa = TRUE;
    `, [email]);
    
    // Devolve o colaborador se o encontrar
    return result.rows[0]; 
};


module.exports = {
    listarLoginsColaboradoresBD,
    verificarLoginColaboradorBD
};
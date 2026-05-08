const pool = require('../config/db.js');

const listarLoginsColaboradoresBD = async () => {
    const result = await pool.query('SELECT * FROM login_colaborador ORDER BY id_login_colaborador DESC');
    return result.rows;
};

module.exports = {
    listarLoginsColaboradoresBD,
};
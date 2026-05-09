const pool = require('../config/db.js');

const listarLoginsClientesBD = async () => {
    const result = await pool.query('SELECT * FROM login_cliente ORDER BY id_login_cliente DESC');
    return result.rows;
};

module.exports = {
    listarLoginsClientesBD,
};
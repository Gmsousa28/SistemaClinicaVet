const pool = require('../config/db.js');

const listarFaturasBD = async () => {
    const result = await pool.query('SELECT * FROM fatura ORDER BY id_fatura DESC');
    return result.rows;
};

module.exports = {
    listarFaturasBD,
};

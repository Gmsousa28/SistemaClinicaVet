const pool = require('../config/db.js');

// Listar servicos
const listarServicosBD = async () => {
    const result = await pool.query('SELECT * FROM servicos ORDER BY id_servicos DESC');
    return result.rows;
};

module.exports = {
    listarServicosBD,
};

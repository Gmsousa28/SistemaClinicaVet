const pool = require('../config/db.js');

const listarMedicamentosBD = async () => {
    const result = await pool.query('SELECT * FROM medicamento ORDER BY nome ASC');
    return result.rows;
};

module.exports = {
    listarMedicamentosBD
};
const pool = require('../config/db.js');

const listarOcorrenciasLaboraisBD = async () => {
    const result = await pool.query('SELECT * FROM ocorrencia_laboral ORDER BY id_colaborador DESC');
    return result.rows;
};

module.exports = {
    listarOcorrenciasLaboraisBD,
};
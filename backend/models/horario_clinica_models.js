const pool = require('../config/db.js');

const listarHorariosClinicaBD = async () => {
    const result = await pool.query('SELECT * FROM horario_clinica ORDER BY dia_semana ASC');
    return result.rows;
};

const criarHorarioClinicaBD = async (dia_semana, hora_abertura, hora_fecho) => {
    const query = `
        INSERT INTO horario_clinica (dia_semana, hora_abertura, hora_fecho) 
        VALUES ($1, $2, $3) 
        RETURNING *;
    `;
    const values = [dia_semana, hora_abertura, hora_fecho];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obterHorarioClinicaByDiaSemanaBD = async (dia_semana) => {
    const result = await pool.query('SELECT * FROM horario_clinica WHERE dia_semana = $1', [dia_semana]);
    return result.rows[0];
};

const atualizarHorarioClinicaBD = async (dia_semana, hora_abertura, hora_fecho) => {
    const query = `
        UPDATE horario_clinica 
        SET hora_abertura = $1, hora_fecho = $2 
        WHERE dia_semana = $3 
        RETURNING *;
    `;
    const values = [hora_abertura, hora_fecho, dia_semana];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarHorarioClinicaBD = async (dia_semana) => {
    const result = await pool.query('DELETE FROM horario_clinica WHERE dia_semana = $1 RETURNING *', [dia_semana]);
    return result.rows[0];
};

module.exports = {
    listarHorariosClinicaBD,
    criarHorarioClinicaBD,
    obterHorarioClinicaByDiaSemanaBD,
    atualizarHorarioClinicaBD,
    eliminarHorarioClinicaBD
};
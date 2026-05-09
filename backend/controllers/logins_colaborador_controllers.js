const {
    listarLoginsColaboradoresBD,
} = require('../models/logins_colaborador_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarLoginsColaboradores = async (req, res, next) => {
    try {
        const loginsColaboradores = await listarLoginsColaboradoresBD();
        handleResponse(res, 200, "Lista de logins de colaboradores carregada", loginsColaboradores);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarLoginsColaboradores,
};
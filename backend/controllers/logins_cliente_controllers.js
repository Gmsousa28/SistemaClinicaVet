const {
    listarLoginsClientesBD,
} = require('../models/logins_cliente_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarLoginsClientes = async (req, res, next) => {
    try {
        const loginsClientes = await listarLoginsClientesBD();
        handleResponse(res, 200, "Lista de logins de clientes carregada", loginsClientes);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarLoginsClientes,
};
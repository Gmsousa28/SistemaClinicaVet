const {
    listarServicosBD
} = require('../models/servicos_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

// Listar servicos
const listarServicos = async (req, res, next) => {
    try {
        const servicos = await listarServicosBD();
        handleResponse(res, 200, "Lista de serviços carregada", servicos);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarServicos,
};

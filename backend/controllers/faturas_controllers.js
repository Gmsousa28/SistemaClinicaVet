const {
    listarFaturasBD,
    criarFaturaBD,
    obterFaturaByIdBD
} = require('../models/faturas_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarFaturas = async (req, res, next) => {
    try {
        const faturas = await listarFaturasBD();
        handleResponse(res, 200, "Lista de faturas carregada", faturas);
    } catch (err) {
        next(err);
    }
};


module.exports = {
    listarFaturas,
};

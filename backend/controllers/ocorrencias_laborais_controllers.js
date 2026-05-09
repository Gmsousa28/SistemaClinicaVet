const {
    listarOcorrenciasLaboraisBD,
} = require('../models/ocorrencias_laborais_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarOcorrenciasLaborais = async (req, res, next) => {
    try {
        // AQUI ESTAVA O ERRO: Faltava o "r" na palavra "listar"
        const OcorrenciasLaborais = await listarOcorrenciasLaboraisBD();
        handleResponse(res, 200, "Lista de ocorrencias laborais carregadas", OcorrenciasLaborais);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarOcorrenciasLaborais,
};
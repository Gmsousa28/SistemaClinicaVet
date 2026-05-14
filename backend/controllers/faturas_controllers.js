const {
    listarFaturasBD,
    listarPendentesFaturacaoBD,
    listarHistoricoFaturacaoBD,
    pagarFaturaBD
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

const listarPendentesFaturacao = async (req, res, next) => {
    try {
        const pendentes = await listarPendentesFaturacaoBD();
        handleResponse(res, 200, "Lista de faturação pendente carregada", pendentes);
    } catch (err) {
        next(err);
    }
};

const listarHistoricoFaturacao = async (req, res, next) => {
    try {
        const historico = await listarHistoricoFaturacaoBD();
        handleResponse(res, 200, "Histórico de faturação carregado", historico);
    } catch (err) {
        next(err);
    }
};

const pagarFatura = async (req, res, next) => {
    const { tipo, id_origem, valor_total } = req.body;

    if (!['consulta', 'servico'].includes(tipo)) {
        return handleResponse(res, 400, "Tipo de faturação inválido");
    }

    if (!id_origem || Number(valor_total) < 0) {
        return handleResponse(res, 400, "Dados de pagamento inválidos");
    }

    try {
        const fatura = await pagarFaturaBD(tipo, id_origem, valor_total);
        handleResponse(res, 201, "Pagamento registado com sucesso", fatura);
    } catch (err) {
        next(err);
    }
};


module.exports = {
    listarFaturas,
    listarPendentesFaturacao,
    listarHistoricoFaturacao,
    pagarFatura,
};

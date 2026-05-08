const{
    listarExamesBD,
    criarExameBD,
    obterExameByIdBD,
    obterExameByNameBD,
    atualizarExameBD,
    eliminarExameBD
} = require('../models/exame_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarTodosExames = async (req, res, next) => {
    try {
        const exames = await listarExamesBD();
        handleResponse(res, 200, "Lista de exames carregada", exames);
    } catch (err) {
        next(err);
    }
};

const criarExame = async (req, res, next) => {
    const { nome, descricao } = req.body;
    try {
        const novoExame = await criarExameBD(nome, descricao);
        handleResponse(res, 201, "Novo exame registado com sucesso", novoExame);
    } catch (err) {
        next(err);
    }
};

const obterExamePorId = async (req, res, next) => {
    try {
        const exame = await obterExameByIdBD(req.params.id);
        if (!exame) return handleResponse(res, 404, "Exame não encontrado");
        handleResponse(res, 200, "Dados do exame recuperados", exame);
    } catch (err) {
        next(err);
    }
};

const obterExamePorNome = async (req, res, next) => {
    try {
        const exame = await obterExameByNameBD(req.params.nome);
        if (!exame) return handleResponse(res, 404, "Exame não encontrado");
        handleResponse(res, 200, "Dados do exame recuperados", exame);
    } catch (err) {
        next(err);
    }
};

const atualizarExame = async (req, res, next) => {
    const { nome, descricao } = req.body;
    try {
        const atualizado = await atualizarExameBD(req.params.id, nome, descricao);
        if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o exame");
        handleResponse(res, 200, "Ficha do exame atualizada", atualizado);
    } catch (err) {
        next(err);
    }
};

const eliminarExame = async (req, res, next) => {
    try {
        const eliminado = await eliminarExameBD(req.params.id);
        if (!eliminado) return handleResponse(res, 404, "Exame não encontrado para remoção");
        handleResponse(res, 200, "Exame removido do sistema", eliminado);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarTodosExames,
    criarExame,
    obterExamePorId,
    obterExamePorNome,
    atualizarExame,
    eliminarExame
};

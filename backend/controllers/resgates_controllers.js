const {
  listarResgatesBD,
  criarResgateBD,
  obterResgatePorIdBD,
  atualizarResgateBD,
  eliminarResgateBD
} = require("../models/resgates_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const listarTodosResgates = async (req, res, next) => {
  try {
    const resgates = await listarResgatesBD();
    handleResponse(res, 200, "Lista de resgates carregada", resgates);
  } catch (err) {
    next(err);
  }
};

const criarResgate = async (req, res, next) => {
  const { id_animal, id_funcionario, data_resgate, idade } = req.body;
  try {
    const novoResgate = await criarResgateBD(id_animal, id_funcionario, data_resgate, idade);
    handleResponse(res, 201, "Novo resgate registado com sucesso", novoResgate);
  } catch (err) {
    next(err);
  }
};

const obterResgatePorId = async (req, res, next) => {
  try {
    const resgate = await obterResgatePorIdBD(req.params.id);
    if (!resgate) return handleResponse(res, 404, "Registo de resgate não encontrado");
    handleResponse(res, 200, "Dados do resgate recuperados", resgate);
  } catch (err) {
    next(err);
  }
};

const atualizarResgate = async (req, res, next) => {
  const { id_animal, id_funcionario, data_resgate, idade } = req.body;
  try {
    const atualizado = await atualizarResgateBD(req.params.id, id_animal, id_funcionario, data_resgate, idade);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o registo de resgate");
    handleResponse(res, 200, "Registo de resgate atualizado", atualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarResgate = async (req, res, next) => {
  try {
    const eliminado = await eliminarResgateBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Registo de resgate não encontrado para remoção");
    handleResponse(res, 200, "Registo de resgate removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosResgates,
  criarResgate,
  obterResgatePorId,
  atualizarResgate,
  eliminarResgate
};
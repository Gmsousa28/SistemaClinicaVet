const {
  listarFuncionariosBD,
  criarFuncionarioBD,
  obterFuncionarioPorIdBD,
  atualizarFuncionarioBD,
  eliminarFuncionarioBD
} = require("../models/funcionarios_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const listarTodosFuncionarios = async (req, res, next) => {
  try {
    const funcionarios = await listarFuncionariosBD();
    handleResponse(res, 200, "Lista de funcionários carregada", funcionarios);
  } catch (err) {
    next(err);
  }
};

const criarFuncionario = async (req, res, next) => {
  const { nome, morada, email, nif, contacto, cargo } = req.body;
  try {
    const novoFuncionario = await criarFuncionarioBD(nome, morada, email, nif, contacto, cargo);
    handleResponse(res, 201, "Novo funcionário registado com sucesso", novoFuncionario);
  } catch (err) {
    next(err);
  }
};

const obterFuncionarioPorId = async (req, res, next) => {
  try {
    const funcionario = await obterFuncionarioPorIdBD(req.params.id);
    if (!funcionario) return handleResponse(res, 404, "Funcionário não encontrado");
    handleResponse(res, 200, "Dados do funcionário recuperados", funcionario);
  } catch (err) {
    next(err);
  }
};

const atualizarFuncionario = async (req, res, next) => {
  const { nome, morada, email, nif, contacto, cargo } = req.body;
  try {
    const atualizado = await atualizarFuncionarioBD(req.params.id, nome, morada, email, nif, contacto, cargo);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o funcionário");
    handleResponse(res, 200, "Ficha do funcionário atualizada", atualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarFuncionario = async (req, res, next) => {
  try {
    const eliminado = await eliminarFuncionarioBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Funcionário não encontrado para remoção");
    handleResponse(res, 200, "Funcionário removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosFuncionarios,
  criarFuncionario,
  obterFuncionarioPorId,
  atualizarFuncionario,
  eliminarFuncionario
};
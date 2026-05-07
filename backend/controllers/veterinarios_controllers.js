const {
  listarVeterinariosBD,
  criarVeterinarioBD,
  obterVeterinarioPorIdBD,
  atualizarVeterinarioBD,
  eliminarVeterinarioBD
} = require("../models/veterinarios_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const listarTodosVeterinarios = async (req, res, next) => {
  try {
    const veterinarios = await listarVeterinariosBD();
    handleResponse(res, 200, "Lista de veterinários carregada", veterinarios);
  } catch (err) {
    next(err);
  }
};

const criarVeterinario = async (req, res, next) => {
  const { nome, morada, contacto, email, nif, especialidade } = req.body;
  try {
    const novoVeterinario = await criarVeterinarioBD(nome, morada, contacto, email, nif, especialidade);
    handleResponse(res, 201, "Novo veterinário registado com sucesso", novoVeterinario);
  } catch (err) {
    next(err);
  }
};

const obterVeterinarioPorId = async (req, res, next) => {
  try {
    const veterinario = await obterVeterinarioPorIdBD(req.params.id);
    if (!veterinario) return handleResponse(res, 404, "Veterinário não encontrado");
    handleResponse(res, 200, "Dados do veterinário recuperados", veterinario);
  } catch (err) {
    next(err);
  }
};

const atualizarVeterinario = async (req, res, next) => {
  const { nome, morada, contacto, email, nif, especialidade } = req.body;
  try {
    const atualizado = await atualizarVeterinarioBD(req.params.id, nome, morada, contacto, email, nif, especialidade);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o veterinário");
    handleResponse(res, 200, "Ficha do veterinário atualizada", atualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarVeterinario = async (req, res, next) => {
  try {
    const eliminado = await eliminarVeterinarioBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Veterinário não encontrado para remoção");
    handleResponse(res, 200, "Veterinário removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosVeterinarios,
  criarVeterinario,
  obterVeterinarioPorId,
  atualizarVeterinario,
  eliminarVeterinario
};
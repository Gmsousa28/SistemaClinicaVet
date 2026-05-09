const {
  listarAnimaisBD,
  criarAnimalBD,
  obterAnimalPorIdBD,
  atualizarAnimalBD,
  eliminarAnimalBD
} = require("../models/animais_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const listarTodosAnimais = async (req, res, next) => {
  try {
    const animais = await listarAnimaisBD();
    handleResponse(res, 200, "Lista de pacientes (animais) carregada", animais);
  } catch (err) {
    next(err);
  }
};

const criarAnimal = async (req, res, next) => {
  // Recebe exatamente os campos da tua tabela
  const { id_cliente, nome, especie, raca, sexo, data_nascimento, estado } = req.body;
  try {
    const novoAnimal = await criarAnimalBD(id_cliente, nome, especie, raca, sexo, data_nascimento, estado);
    handleResponse(res, 201, "Novo animal registado com sucesso", novoAnimal);
  } catch (err) {
    next(err);
  }
};

const obterAnimalPorId = async (req, res, next) => {
  try {
    const animal = await obterAnimalPorIdBD(req.params.id);
    if (!animal) return handleResponse(res, 404, "Animal não encontrado");
    handleResponse(res, 200, "Dados do animal recuperados", animal);
  } catch (err) {
    next(err);
  }
};

const atualizarAnimal = async (req, res, next) => {
  const { id_cliente, nome, especie, raca, sexo, data_nascimento, estado } = req.body;
  try {
    const atualizado = await atualizarAnimalBD(req.params.id, id_cliente, nome, especie, raca, sexo, data_nascimento, estado);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o animal");
    handleResponse(res, 200, "Ficha do animal atualizada", atualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarAnimal = async (req, res, next) => {
  try {
    const eliminado = await eliminarAnimalBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Animal não encontrado para remoção");
    handleResponse(res, 200, "Animal removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosAnimais,
  criarAnimal,
  obterAnimalPorId,
  atualizarAnimal,
  eliminarAnimal
};
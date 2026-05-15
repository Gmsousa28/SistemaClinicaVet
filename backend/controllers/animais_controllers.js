const {
  listarAnimaisBD,
  criarAnimalBD,
  obterAnimalPorIdBD,
  atualizarAnimalBD,
  eliminarAnimalBD,
  listarAnimaisPorDonoBD
} = require("../models/animais_models.js");


// Adiciona esta linha lá no topo, junto aos outros requires
const { obterClienteByNifBD } = require('../models/clientes_models.js');
// Função auxiliar para manter as respostas do servidor sempre organizadas
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
  const { nif_cliente, nome, especie, raca, sexo, data_nascimento, estado } = req.body;
  try {
    const resultadoBusca = await obterClienteByNifBD(nif_cliente);
    const cliente = Array.isArray(resultadoBusca) ? resultadoBusca[0] : resultadoBusca;
    
    if (!cliente || !cliente.id_cliente) {
        return handleResponse(res, 404, `Erro: O NIF ${nif_cliente} não pertence a nenhum cliente registado no sistema!`);
    }

    const novoAnimal = await criarAnimalBD(cliente.id_cliente, nome, especie, raca, sexo, data_nascimento, estado);
    handleResponse(res, 201, "Novo animal registado com sucesso", novoAnimal);
  } catch (err) {
    // 🛡️ NOVO ESCUDO: Apanha o erro da data no futuro! (O código 23514 é o de check_violation)
    if (err.constraint === 'chk_data_nascimento_valida' || err.code === '23514') {
        return handleResponse(res, 400, "Erro: A data de nascimento não pode ser no futuro!");
    }
    next(err);
  }
};

const atualizarAnimal = async (req, res, next) => {
  const { nif_cliente, nome, especie, raca, sexo, data_nascimento, estado } = req.body;
  try {
    const resultadoBusca = await obterClienteByNifBD(nif_cliente);
    const cliente = Array.isArray(resultadoBusca) ? resultadoBusca[0] : resultadoBusca;
    
    if (!cliente || !cliente.id_cliente) {
        return handleResponse(res, 404, `Erro: O NIF ${nif_cliente} não pertence a nenhum cliente registado no sistema!`);
    }

    const atualizado = await atualizarAnimalBD(req.params.id, cliente.id_cliente, nome, especie, raca, sexo, data_nascimento, estado);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o animal");
    handleResponse(res, 200, "Ficha do animal atualizada", atualizado);
  } catch (err) {
    // 🛡️ NOVO ESCUDO também na atualização!
    if (err.constraint === 'chk_data_nascimento_valida' || err.code === '23514') {
        return handleResponse(res, 400, "Erro: A data de nascimento não pode ser no futuro!");
    }
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


const eliminarAnimal = async (req, res, next) => {
  try {
    const eliminado = await eliminarAnimalBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Animal não encontrado para remoção");
    handleResponse(res, 200, "Animal removido do sistema", eliminado);
  } catch (err) {
    // 23503 é o código oficial do PostgreSQL para "Foreign Key Violation"
    if (err.code === '23503') {
      return handleResponse(res, 400, "Não podes eliminar este animal porque ele já tem consultas ou banhos registados no histórico!");
    }
    next(err);
  }
};

const listarAnimaisPorDono = async (req, res, next) => {
  try {
    const animais = await listarAnimaisPorDonoBD(req.params.nif);
    handleResponse(res, 200, "Animais do cliente carregados", animais);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosAnimais,
  criarAnimal,
  obterAnimalPorId,
  atualizarAnimal,
  eliminarAnimal,
  listarAnimaisPorDono
};
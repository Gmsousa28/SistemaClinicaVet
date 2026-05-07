const {
  listarClientesBD,
  criarClienteBD,
  obterClientePorIdBD,
  atualizarClienteBD,
  eliminarClienteBD
} = require("../models/clientes_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

const listarTodosClientes = async (req, res, next) => {
  try {
    const clientes = await listarClientesBD();
    handleResponse(res, 200, "Lista de clientes carregada", clientes);
  } catch (err) {
    next(err);
  }
};

const criarCliente = async (req, res, next) => {
  // Recebe exatamente os campos da tabela cliente
  const { id_login_cliente, nome, morada, email, nif, contacto } = req.body;
  try {
    const novoCliente = await criarClienteBD(id_login_cliente, nome, morada, email, nif, contacto);
    handleResponse(res, 201, "Novo cliente registado com sucesso", novoCliente);
  } catch (err) {
    next(err);
  }
};

const obterClientePorId = async (req, res, next) => {
  try {
    const cliente = await obterClientePorIdBD(req.params.id);
    if (!cliente) return handleResponse(res, 404, "Cliente não encontrado");
    handleResponse(res, 200, "Dados do cliente recuperados", cliente);
  } catch (err) {
    next(err);
  }
};

const atualizarCliente = async (req, res, next) => {
  const { id_login_cliente, nome, morada, email, nif, contacto } = req.body;
  try {
    const atualizado = await atualizarClienteBD(req.params.id, id_login_cliente, nome, morada, email, nif, contacto);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o cliente");
    handleResponse(res, 200, "Ficha do cliente atualizada", atualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarCliente = async (req, res, next) => {
  try {
    const eliminado = await eliminarClienteBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Cliente não encontrado para remoção");
    handleResponse(res, 200, "Cliente removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarTodosClientes,
  criarCliente,
  obterClientePorId,
  atualizarCliente,
  eliminarCliente
};
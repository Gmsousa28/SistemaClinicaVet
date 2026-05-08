const {
    listarClientesBD,
    obterClienteByIDBD,
    obterClienteByNifBD,
    criarClienteBD,
    atualizarClienteBD,
    eliminarClienteByIdBD
} = require('../models/clientes_models.js');

const handleResponse = (res, status, message, data = null) => { 
    res.status(status).json({ status, message, data }); 
};

const listarClientes = async (req, res, next) => {
    try {
        const clientes = await listarClientesBD();
        handleResponse(res, 200, "Lista de clientes carregada", clientes);
    } catch (err) {
        next(err);
    }
};

const obterClienteByID = async (req, res, next) => {
    try {
        const cliente = await obterClienteByIDBD(req.params.id);
        if (!cliente) return handleResponse(res, 404, "Cliente não encontrado");
        handleResponse(res, 200, "Dados do cliente recuperados", cliente);
    } catch (err) {
        next(err);
    }
};

const obterClienteByNif = async (req, res, next) => {
    try {
        const cliente = await obterClienteByNifBD(req.params.nif);
        if (!cliente) return handleResponse(res, 404, "Cliente não encontrado");
        handleResponse(res, 200, "Dados do cliente recuperados", cliente);
    } catch (err) {
        next(err);
    }
};

const criarCliente = async (req, res, next) => {
    const { id_login_cliente, nome, morada, email, nif, contacto } = req.body;
    try {
        const novoCliente = await criarClienteBD(id_login_cliente, nome, morada, email, nif, contacto);
        handleResponse(res, 201, "Novo cliente registado com sucesso", novoCliente);
    } catch (err) {
        next(err);
    }
};

const atualizarCliente = async (req, res, next) => {
    // CORREÇÃO: Removido o id_login_cliente daqui, pois não o queremos atualizar
    const { nome, morada, email, nif, contacto } = req.body;
    try {
        // CORREÇÃO: Removido o id_login_cliente da chamada à função
        const atualizado = await atualizarClienteBD(req.params.id, nome, morada, email, nif, contacto);
        
        if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o cliente");
        handleResponse(res, 200, "Dados do cliente atualizados", atualizado);
    } catch (err) {
        next(err);
    }
};

const eliminarClienteById = async (req, res, next) => {
    try {
        const eliminado = await eliminarClienteByIdBD(req.params.id);
        if (!eliminado) return handleResponse(res, 404, "Cliente não encontrado para remoção");
        handleResponse(res, 200, "Cliente removido do sistema", eliminado);
    } catch (err) {
        next(err);
    }
};


const obterClientePorNIF = async (req, res, next) => {
  try {
    // O nome do parâmetro aqui deve ser igual ao que definires na rota (:NIF)
    const cliente = await obterClientePorNIFBD(req.params.NIF);
    
    if (!cliente) {
        return handleResponse(res, 404, "Não existe nenhum cliente registado com esse NIF");
    }
    
    handleResponse(res, 200, "Cliente encontrado com sucesso", cliente);
  } catch (err) {
    next(err);
  }
};


module.exports = {
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById
};
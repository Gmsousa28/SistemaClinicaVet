const {
    listarClientesBD,
    obterClienteByIDBD,
    obterClienteByNifBD,
    criarClienteBD,
    atualizarClienteBD,
    eliminarClienteByIdBD,
    registarClienteCompletoBD
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
    // Agora extrai e passa SÓ os 5 campos que vêm do Frontend
    const { nome, morada, email, nif, contacto } = req.body; 
    
    try {
        const novoCliente = await criarClienteBD(nome, morada, email, nif, contacto);
        handleResponse(res, 201, "Novo cliente registado com sucesso", novoCliente);
    } catch (err) {

        if (err.code === '23505') {
            // Juntámos as duas chaves de e-mail (a do login e a da tabela cliente)
            if (err.constraint === 'login_cliente_email_key' || err.constraint === 'cliente_email_key') {
                return handleResponse(res, 400, "Erro: Este E-mail já está registado noutro cliente!");
            }
            if (err.constraint === 'cliente_nif_key' || err.constraint.includes('nif')) {
                return handleResponse(res, 400, "Erro: Este NIF já está registado no sistema!");
            }
            if (err.constraint === 'cliente_contacto_key' || err.constraint.includes('contacto')) {
                return handleResponse(res, 400, "Erro: Este número de telemóvel já está em uso!");
            }
            
            return handleResponse(res, 400, "Erro: Já existe um registo com estes dados únicos.");
        }
        
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

        if (err.code === '23505') {
            // Juntámos as duas chaves de e-mail (a do login e a da tabela cliente)
            if (err.constraint === 'login_cliente_email_key' || err.constraint === 'cliente_email_key') {
                return handleResponse(res, 400, "Erro: Este E-mail já está registado noutro cliente!");
            }
            if (err.constraint === 'cliente_nif_key' || err.constraint.includes('nif')) {
                return handleResponse(res, 400, "Erro: Este NIF já está registado no sistema!");
            }
            if (err.constraint === 'cliente_contacto_key' || err.constraint.includes('contacto')) {
                return handleResponse(res, 400, "Erro: Este número de telemóvel já está em uso!");
            }
            
            return handleResponse(res, 400, "Erro: Já existe um registo com estes dados únicos.");
        }
        
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


// Importa o model lá em cima:
// const { registarClienteCompletoBD } = require('../models/clientes_models');

const registarNovoCliente = async (req, res) => {
    try {
        // Desempacota os dados que vieram do Frontend
        const { nome, email, palavra_passe, contacto, data_nascimento, morada, nif } = req.body;

        // Validação básica de segurança
        if (!nome || !email || !palavra_passe || !nif || !contacto) {
            return res.status(400).json({ status: 400, message: "Campos obrigatórios em falta." });
        }

        // Chama a função do Model com a transação SQL
        await registarClienteCompletoBD({
            nome, 
            email, 
            palavra_passe, // Nota: Num projeto real, usaríamos o bcrypt para encriptar isto antes de guardar!
            contacto, 
            morada, 
            nif
        });

        return res.status(201).json({ status: 201, message: "Cliente criado com sucesso!" });

    } catch (err) {
        console.error("Erro ao registar cliente:", err);

        // 23505 é o código de erro do PostgreSQL para o UNIQUE (Duplicados)
        if (err.code === '23505') {
            // Vamos descobrir exatamente qual foi a restrição violada para dar um aviso melhor ao utilizador
            let detalhe = "O Email, NIF ou Contacto já estão em uso.";
            if (err.constraint === 'login_cliente_email_key' || err.constraint === 'cliente_email_key') {
                detalhe = "Este endereço de email já está registado.";
            } else if (err.constraint === 'cliente_nif_key') {
                detalhe = "Este NIF já se encontra associado a outra conta.";
            } else if (err.constraint === 'cliente_contacto_key') {
                detalhe = "Este número de telemóvel já está em uso.";
            }
            return res.status(400).json({ status: 400, message: detalhe });
        }

        return res.status(500).json({ status: 500, message: "Erro interno do servidor." });
    }
};




module.exports = {
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById,
    registarNovoCliente
};
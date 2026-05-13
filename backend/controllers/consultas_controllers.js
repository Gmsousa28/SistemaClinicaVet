const {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD,
    obterconsultasdovetespecificoBD
}= require('../models/consultas_models');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
}

const listarConsultas = async (req, res, next) => {
    try {
        const consultas = await listarConsultasBD();
        handleResponse(res, 200, "Lista de consultas carregada", consultas);
    } catch (err) {
        next(err);
    }
};

const criarConsulta = async (req, res, next) => {
    const { id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco } = req.body;
    try {
        const novaConsulta = await criarConsultaBD(id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco);
        handleResponse(res, 201, "Nova consulta criada com sucesso", novaConsulta);
    } catch (err) {
        next(err);
    }
};

const obterConsultaById = async (req, res, next) => {
    try {
        const consulta = await obterConsultaByIdBD(req.params.id);
        if (!consulta) return handleResponse(res, 404, "Consulta não encontrada");
        handleResponse(res, 200, "Dados da consulta recuperados", consulta);
    } catch (err) {
        next(err);
    }
};

const atualizarConsulta = async (req, res, next) => {
    const { id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco } = req.body;
    try {
        const atualizado = await atualizarConsultaBD(req.params.id, id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco);
        if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar a consulta");
        handleResponse(res, 200, "Consulta atualizada com sucesso", atualizado);
    } catch (err) {
        next(err);
    }
};

const eliminarConsulta = async (req, res, next) => {
    try {
        const eliminado = await eliminarConsultaBD(req.params.id);
        if (!eliminado) return handleResponse(res, 404, "Não foi possível eliminar a consulta");
        handleResponse(res, 200, "Consulta eliminada com sucesso", eliminado);
    } catch (err) {
        next(err);
    }
};

const listarConsultasDoVeterinario = async (req, res, next) => {
    try {
        // 1. Apanhar o ID do veterinário que vem no URL do pedido
        const id_veterinario = req.params.id; 

        // 2. Passar esse ID para a tua função da base de dados
        const consultas = await obterconsultasdovetespecicifoBD(id_veterinario);

        // 3. Enviar a resposta para o Frontend (usando a tua estrutura habitual)
        res.status(200).json({ status: 200, message: "Consultas carregadas", data: consultas });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    listarConsultas,
    criarConsulta,
    obterConsultaById,
    atualizarConsulta,
    eliminarConsulta,
    listarConsultasDoVeterinario
};
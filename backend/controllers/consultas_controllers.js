const {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD
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

const criarConsulta = async (req, res) => {
    // 1. Só extraímos os 4 campos que a base de dados agora pede
    const { id_animal, id_veterinario, data_consulta, motivo } = req.body;
    
    try {
        const novaConsulta = await criarConsultaBD(id_animal, id_veterinario, data_consulta, motivo);
        handleResponse(res, 201, "Nova consulta criada com sucesso", novaConsulta);
        
    } catch (err) {
        // 2. Isto vai imprimir o erro limpo no teu terminal
        console.error(">>> ERRO A GRAVAR NA BD:", err.message);

        // 3. Se o erro for uma das regras da tua professora (Bloco DO $$)
        if (err.message && err.message.includes('Operação bloqueada')) {
            // Mandamos um erro 400 (Bad Request) e o texto da base de dados!
            return handleResponse(res, 400, err.message);
        }

        // 4. Se for um erro diferente (tipo servidor abaixo ou colunas erradas)
        return handleResponse(res, 500, "Erro interno no servidor: " + err.message);
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

module.exports = {
    listarConsultas,
    criarConsulta,
    obterConsultaById,
    atualizarConsulta,
    eliminarConsulta
};
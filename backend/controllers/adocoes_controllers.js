const {
    listarAdocoesBD,
    criarAdocaoBD,
    obterAdocaoPorIdAnimalBD,
    obterAdocaoPorIdBD,
    eliminarAdocaoBD
} = require('../models/adocoes_models.js');

const listarAdocoes = async (req, res) => {
    try {
        const adocoes = await listarAdocoesBD();
        res.status(200).json({ status: 200, message: "Lista de adoções carregada", data: adocoes });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao carregar as adoções", error: err.message });
    }
};

const criarAdocao = async (req, res) => {
    const { id_animal, id_cliente, data_adocao } = req.body;
    try {
        const novaAdocao = await criarAdocaoBD(id_animal, id_cliente, data_adocao);
        res.status(201).json({ status: 201, message: "Nova adoção criada com sucesso", data: novaAdocao });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao criar a adoção", error: err.message });
    }
};

const obterAdocaoPorIdAnimal = async (req, res) => {
    try {
        const adocao = await obterAdocaoPorIdAnimalBD(req.params.id_animal);
        if (!adocao) return res.status(404).json({ status: 404, message: "Adoção não encontrada para o animal especificado" });
        res.status(200).json({ status: 200, message: "Dados da adoção recuperados", data: adocao });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao recuperar a adoção", error: err.message });
    }
};

const obterAdocaoPorId = async (req, res) => {
    try {
        const adocao = await obterAdocaoPorIdBD(req.params.id);
        if (!adocao) return res.status(404).json({ status: 404, message: "Adoção não encontrada para o ID especificado" });
        res.status(200).json({ status: 200, message: "Dados da adoção recuperados", data: adocao });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao recuperar a adoção", error: err.message });
    }
};

const eliminarAdocao = async (req, res) => {
    try {
        const eliminado = await eliminarAdocaoBD(req.params.id);
        if (!eliminado) return res.status(404).json({ status: 404, message: "Adoção não encontrada para remoção" });
        res.status(200).json({ status: 200, message: "Adoção removida do sistema", data: eliminado });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao eliminar a adoção", error: err.message });
    }
};

module.exports = {
    listarAdocoes,
    criarAdocao,
    obterAdocaoPorIdAnimal,
    obterAdocaoPorId,
    eliminarAdocao
};

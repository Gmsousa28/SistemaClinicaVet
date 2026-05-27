const {
    listarMedicamentosBD
}= require('../models/medicamentos_models.js');

const listarMedicamentos = async (req, res) => {
    try {
        const medicamentos = await listarMedicamentosBD();
        return res.status(200).json({
            status: 200,
            message: "Lista de medicamentos recuperada com sucesso!",
            data: medicamentos
        });
    } catch (erro) {
        console.error("Erro ao listar medicamentos:", erro);
        return res.status(500).json({
            status: 500,
            message: "Erro interno do servidor ao listar medicamentos."
        });
    }
};

module.exports = {
    listarMedicamentos
};

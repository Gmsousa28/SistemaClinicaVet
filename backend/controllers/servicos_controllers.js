const {
    listarServicosBD,
    apagarServicoBD
} = require('../models/servicos_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarServicos = async (req, res, next) => {
    try {
        const servicos = await listarServicosBD();
        handleResponse(res, 200, "Lista de serviços carregada", servicos);
    } catch (err) {
        next(err);
    }
};
// ==========================================
// FUNÇÃO NOVA: Apagar o Serviço (Cancelar Banho/Tosquia)
// ==========================================
const apagarServico = async (req, res) => {
    try {
        const idServico = req.params.id; 
        
        // 2. MUDANÇA AQUI: Chamamos a função diretamente em vez de usar "servicosModels."
        const apagado = await apagarServicoBD(idServico);

        if (apagado) {
            res.status(200).json({ status: 200, message: "Serviço cancelado com sucesso!" });
        } else {
            res.status(404).json({ status: 404, message: "Serviço não encontrado na Base de Dados." });
        }
    } catch (error) {
        console.error("Erro no controlador ao apagar serviço:", error);
        res.status(500).json({ status: 500, message: "Erro interno do servidor." });
    }
};
module.exports = {
    listarServicos,
    apagarServico
};
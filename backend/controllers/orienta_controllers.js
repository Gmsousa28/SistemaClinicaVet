// CORREÇÃO: Importar exatamente o nome exportado pelo model
const {
    orientaMedicamentoBD 
} = require('../models/orienta_models.js');

const orientaMedicamentos = async (req, res) => {
    try {
        const { id_consulta, id_medicamento } = req.body;

        // Adicionei Array.isArray para garantir que o utilizador envia um array de facto
        if (!id_consulta || !id_medicamento || !Array.isArray(id_medicamento) || id_medicamento.length === 0) {
            return res.status(400).json({ 
                status: 400, 
                message: "Faltam dados: id_consulta ou lista de medicamentos vazia/inválida." 
            });
        }

        const resultados = [];
        const descricaoPadrao = "Medicamento prescrito durante a consulta médica.";

        // CORREÇÃO: Variáveis do loop ajustadas para evitar confusão com os nomes
        for (let i = 0; i < id_medicamento.length; i++) {
            const medicamentoAtual = id_medicamento[i]; 
            const medicamentoGravado = await orientaMedicamentoBD(id_consulta, medicamentoAtual, descricaoPadrao);
            resultados.push(medicamentoGravado);
        }

        return res.status(201).json({
            status: 201,
            message: "Medicamentos prescritos com sucesso!",
            data: resultados
        });

    } catch (erro) {
        console.error("Erro ao prescrever medicamentos:", erro);
        
        if (erro.code === '23505') {
            return res.status(409).json({ 
                status: 409, 
                message: "Aviso: Um ou mais destes medicamentos já foram prescritos nesta consulta." 
            });
        }

        return res.status(500).json({ 
            status: 500, 
            message: "Erro interno do servidor ao prescrever medicamentos." 
        });
    }
};

module.exports = {
    orientaMedicamentos
};
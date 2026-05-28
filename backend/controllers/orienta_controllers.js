const { orientaMedicamentoBD } = require('../models/orienta_models.js');

const orientaMedicamentos = async (req, res) => {
    try {
        const { id_consulta, id_medicamento } = req.body;

        if (!id_consulta || !id_medicamento || !Array.isArray(id_medicamento) || id_medicamento.length === 0) {
            return res.status(400).json({ 
                status: 400, 
                message: "Faltam dados: id_consulta ou lista de medicamentos vazia/inválida." 
            });
        }

        const resultados = [];
        const descricaoPadrao = "Medicamento prescrito durante a consulta médica.";
        const quantidadePadrao = 1.00; // 💡 Define uma quantidade padrão já que a BD exige NUMERIC

        for (let i = 0; i < id_medicamento.length; i++) {
            // Se o item for um objeto {id_medicamento: 14}, extraímos só o número. Se for número puro, usa-o.
            const item = id_medicamento[i];
            const medicamentoIdPuro = typeof item === 'object' ? (item.id_medicamento || item.id) : Number(item);

            // Chamada ao Model com os 4 parâmetros corretos
            const medicamentoGravado = await orientaMedicamentoBD(
                Number(id_consulta), 
                medicamentoIdPuro, 
                quantidadePadrao, 
                descricaoPadrao
            );
            resultados.push(medicamentoGravado);
        }

        return res.status(201).json({
            status: 201,
            message: "Medicamentos prescritos com sucesso!",
            data: resultados
        });

    } catch (erro) {
        console.error("Erro ao prescrever medicamentos no Terminal:", erro);
        
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
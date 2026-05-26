const {
    prescreverExameBD
} = require('../models/prescreve_models.js');

const prescreverExames = async (req, res) => {
    try {
        // Os dados que vêm do fetch no frontend (exame.js) ou do Postman
        const { id_consulta, exames } = req.body;

        // Validação de segurança
        if (!id_consulta || !exames || exames.length === 0) {
            return res.status(400).json({ 
                status: 400, 
                message: "Faltam dados: id_consulta ou lista de exames vazia." 
            });
        }

        const resultados = [];
        const descricaoPadrao = "Exame prescrito durante a consulta médica.";

        // Como "exames" é uma lista (Array), fazemos um loop para gravar todos
        for (let i = 0; i < exames.length; i++) {
            const id_exame = exames[i];
            
            // 👉 CORREÇÃO AQUI: Chamar diretamente a função, sem o "exameModel."
            const exameGravado = await prescreverExameBD(id_consulta, id_exame, descricaoPadrao);
            
            resultados.push(exameGravado);
        }

        // Responde ao frontend com sucesso
        return res.status(201).json({
            status: 201,
            message: "Exames prescritos com sucesso!",
            data: resultados
        });

    } catch (erro) {
        console.error("Erro ao prescrever exames:", erro);
        
        // Verifica se o erro é de chave duplicada (ex: o médico clicou duas vezes no mesmo exame)
        if (erro.code === '23505') {
            return res.status(409).json({ 
                status: 409, 
                message: "Aviso: Um ou mais destes exames já foram prescritos nesta consulta." 
            });
        }

        return res.status(500).json({ 
            status: 500, 
            message: "Erro interno do servidor ao prescrever exames." 
        });
    }
};

module.exports = {
    prescreverExames
};
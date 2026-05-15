const { criarOcorrenciaBD } = require('../models/ocorrencias_laborais_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const criarOcorrencia = async (req, res, next) => {
    // O Frontend só nos vai mandar 1 data (data_ocorrencia)
    const { id_colaborador, data_ocorrencia, tipo, observacoes } = req.body;
    
    try {
        // Usamos a mesma data para início e fim para registos de 1 único dia
        const data_inicio = data_ocorrencia;
        const data_fim = data_ocorrencia;

        const novaOcorrencia = await criarOcorrenciaBD(id_colaborador, data_inicio, data_fim, tipo, observacoes);
        handleResponse(res, 201, "Registo guardado com sucesso!", novaOcorrencia);
    } catch (err) {
        // 23505 é o erro de violação da Primary Key (já existe registo para esta pessoa neste dia)
        if (err.code === '23505') {
            return handleResponse(res, 400, "Erro: Este colaborador já tem um registo de assiduidade nesta data.");
        }
        // Se der erro no ENUM (ex: mandaste 'Falta' mas na BD o enum é 'falta' em minúsculas)
        if (err.code === '22P02') {
            return handleResponse(res, 400, "Erro: O tipo de registo não é válido para a base de dados.");
        }
        next(err);
    }
};

module.exports = {
    criarOcorrencia
};
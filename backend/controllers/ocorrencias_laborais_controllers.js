const { criarOcorrenciaBD, listarOcorrenciasBD } = require('../models/ocorrencias_laborais_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

// 1. Função para LER os dados
const listarOcorrenciasLaborais = async (req, res, next) => {
    try {
        const ocorrencias = await listarOcorrenciasBD();
        handleResponse(res, 200, "Lista de assiduidade carregada", ocorrencias);
    } catch (err) {
        next(err);
    }
};

// 2. Função para CRIAR os dados (Exatamente como pede a BD)
const criarOcorrenciaLaboral = async (req, res, next) => {
    const { id_colaborador, data_ocorrencia, tipo, observacoes } = req.body;
    
    try {
        // O Frontend envia 1 data, a BD pede 2 (inicio e fim). Duplicamos aqui:
        const data_inicio = data_ocorrencia;
        const data_fim = data_ocorrencia;

        const novaOcorrencia = await criarOcorrenciaBD(
            id_colaborador, 
            data_inicio, 
            data_fim, 
            tipo, // Passa exatamente como vem ("Falta", "Atraso", etc.)
            observacoes
        );
        
        handleResponse(res, 201, "Registo de assiduidade guardado com sucesso!", novaOcorrencia);
    } catch (err) {
        if (err.code === '23505') {
            return handleResponse(res, 400, "Erro: Este colaborador já tem um registo para esta data.");
        }
        if (err.code === '22P02') {
            return handleResponse(res, 400, "Erro: O tipo de ocorrência enviado não é reconhecido pela base de dados.");
        }
        next(err);
    }
};

// 3. Exportar as duas funções para as Rotas
module.exports = {
    listarOcorrenciasLaborais,
    criarOcorrenciaLaboral
};
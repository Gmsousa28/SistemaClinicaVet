const {
    criarOcorrenciaBD,
    listarOcorrenciasBD,
    listarFeriasAdminBD,
    atualizarOcorrenciaBD
} = require('../models/ocorrencias_laborais_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

// Listar ocorrencias laborais
const listarOcorrenciasLaborais = async (req, res, next) => {
    try {
        const ocorrencias = await listarFeriasAdminBD();
        handleResponse(res, 200, "Lista de assiduidade carregada", ocorrencias);
    } catch (err) {
        next(err);
    }
};

// Criar ocorrencia laboral
const criarOcorrenciaLaboral = async (req, res, next) => {
    const {
        id_colaborador,
        data_ocorrencia,
        tipo,
        observacoes
    } = req.body;

    try {
        const data_inicio = data_ocorrencia;
        const data_fim = data_ocorrencia;

        const novaOcorrencia = await criarOcorrenciaBD(
            id_colaborador,
            data_inicio,
            data_fim,
            tipo,
            observacoes
        );

        handleResponse(
            res,
            201,
            "Registo de assiduidade guardado com sucesso!",
            novaOcorrencia
        );
    } catch (err) {
        if (err.code === '23505') {
            return handleResponse(
                res,
                400,
                "Erro: Este colaborador jÃ¡ tem um registo para esta data."
            );
        }

        if (err.code === '22P02') {
            return handleResponse(
                res,
                400,
                "Erro: O tipo de ocorrÃªncia enviado nÃ£o Ã© reconhecido pela base de dados."
            );
        }

        next(err);
    }
};

// Atualizar ocorrencia laboral
const atualizarOcorrenciaLaboral = async (req, res, next) => {
    const {
        data_inicio,
        data_fim,
        tipo,
        observacoes
    } = req.body;

    try {
        const ocorrenciaAtualizada = await atualizarOcorrenciaBD(
            req.params.id,
            data_inicio,
            data_fim,
            tipo,
            observacoes
        );

        handleResponse(
            res,
            200,
            "OcorrÃªncia atualizada com sucesso!",
            ocorrenciaAtualizada
        );
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listarOcorrenciasLaborais,
    criarOcorrenciaLaboral,
    atualizarOcorrenciaLaboral
};

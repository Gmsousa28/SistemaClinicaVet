const {
    listarOcorrenciasLaboraisBD,
    criarOcorrenciaLaboralBD,
    atualizarOcorrenciaLaboralBD,
    eliminarOcorrenciaLaboralBD
} = require('../models/ocorrencias_laborais_models.js');

const handleResponse = (
    res,
    status,
    message,
    data = null
) => {

    res.status(status).json({
        status,
        message,
        data
    });
};

// =======================================================
// LISTAR OCORRÊNCIAS
// =======================================================
const listarOcorrenciasLaborais = async (
    req,
    res,
    next
) => {

    try {

        const ocorrencias =
            await listarOcorrenciasLaboraisBD();

        handleResponse(
            res,
            200,
            "Lista de ocorrências laborais carregada",
            ocorrencias
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

// =======================================================
// CRIAR OCORRÊNCIA
// =======================================================
const criarOcorrenciaLaboral = async (
    req,
    res,
    next
) => {

    const {
        id_colaborador,
        data_inicio,
        data_fim,
        tipo,
        observacoes
    } = req.body;

    try {

        const novaOcorrencia =
            await criarOcorrenciaLaboralBD(
                id_colaborador,
                data_inicio,
                data_fim,
                tipo,
                observacoes
            );

        handleResponse(
            res,
            201,
            "Ocorrência criada com sucesso",
            novaOcorrencia
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

// =======================================================
// ATUALIZAR OCORRÊNCIA
// =======================================================
const atualizarOcorrenciaLaboral = async (
    req,
    res,
    next
) => {

    const {
        data_inicio,
        data_fim,
        tipo,
        observacoes
    } = req.body;

    try {

        const atualizada =
            await atualizarOcorrenciaLaboralBD(
                req.params.id,
                data_inicio,
                data_fim,
                tipo,
                observacoes
            );

        if (!atualizada) {

            return handleResponse(
                res,
                404,
                "Ocorrência não encontrada"
            );
        }

        handleResponse(
            res,
            200,
            "Ocorrência atualizada com sucesso",
            atualizada
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

// =======================================================
// ELIMINAR OCORRÊNCIA
// =======================================================
const eliminarOcorrenciaLaboral = async (
    req,
    res,
    next
) => {

    try {

        const eliminada =
            await eliminarOcorrenciaLaboralBD(
                req.params.id
            );

        if (!eliminada) {

            return handleResponse(
                res,
                404,
                "Ocorrência não encontrada"
            );
        }

        handleResponse(
            res,
            200,
            "Ocorrência eliminada com sucesso",
            eliminada
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    listarOcorrenciasLaborais,
    criarOcorrenciaLaboral,
    atualizarOcorrenciaLaboral,
    eliminarOcorrenciaLaboral,
};
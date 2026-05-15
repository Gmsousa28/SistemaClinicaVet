const express = require('express');

const {
    listarOcorrenciasLaborais,
    criarOcorrenciaLaboral,
    atualizarOcorrenciaLaboral
} = require("../controllers/ocorrencias_laborais_controllers.js");

const router = express.Router();

router.get(
    "/ocorrencias_laborais",
    listarOcorrenciasLaborais
);

router.post(
    "/ocorrencias_laborais",
    criarOcorrenciaLaboral
);

router.put(
    "/ocorrencias_laborais/:id",
    atualizarOcorrenciaLaboral
);

module.exports = router;
const express = require('express');

const {
    listarOcorrenciasLaborais,
} = require("../controllers/ocorrencias_laborais_controllers.js");

const router = express.Router();

router.get("/ocorrencias_laborais", listarOcorrenciasLaborais);

module.exports = router;
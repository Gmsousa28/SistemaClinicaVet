const express = require('express');

// Importar as DUAS funções do Controller
const {
    listarOcorrenciasLaborais,
    criarOcorrenciaLaboral
} = require("../controllers/ocorrencias_laborais_controllers.js");

const router = express.Router();

// Rota para LER as ocorrências (GET)
router.get("/ocorrencias_laborais", listarOcorrenciasLaborais);

// Rota para CRIAR uma nova ocorrência (POST)
router.post("/ocorrencias_laborais", criarOcorrenciaLaboral);

// Exportar o router para o server.js
module.exports = router;
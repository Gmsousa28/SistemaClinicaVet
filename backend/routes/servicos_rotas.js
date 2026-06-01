const express = require('express');

const {
    listarServicos,
    apagarServico
} = require("../controllers/servicos_controllers.js");

const router = express.Router();

// Rotas de servicos
router.get("/servicos", listarServicos);
// --- NOVA ROTA PARA APAGAR SERVIÇOS ---
router.delete("/servicos/:id", apagarServico);

module.exports = router;


const express = require('express');

const {
    listarServicos,
} = require("../controllers/servicos_controllers.js");

const router = express.Router();

// Rotas de servicos
router.get("/servicos", listarServicos);

module.exports = router;


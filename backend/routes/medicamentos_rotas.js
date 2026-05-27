const {
    listarMedicamentos
} = require('../controllers/medicamentos_controllers.js');

const express = require('express');

const router = express.Router();

// Rota para listar medicamentos
router.get('/medicamentos', listarMedicamentos);

module.exports = router;
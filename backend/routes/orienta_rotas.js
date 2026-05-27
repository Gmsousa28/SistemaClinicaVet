const express = require('express');
const {
    orientaMedicamentos
} = require('../controllers/orienta_controllers.js');

const router = express.Router();

// Rota para prescrever medicamentos
router.post('/orienta-medicamentos', orientaMedicamentos);

module.exports = router;
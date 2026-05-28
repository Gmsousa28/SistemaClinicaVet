const express = require('express');
const { 
    prescreverExames
} = require('../controllers/prescreve_controllers.js');

const router = express.Router();

// Rotas de prescrever exames
router.post('/prescrever-exames', prescreverExames);

module.exports = router;


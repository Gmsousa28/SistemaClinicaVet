const express = require('express');
const { 
    prescreverExames
} = require('../controllers/prescreve_controllers.js');

const router = express.Router();

// Rota para prescrever exames (POST)
router.post('/prescrever-exames', prescreverExames);

module.exports = router;


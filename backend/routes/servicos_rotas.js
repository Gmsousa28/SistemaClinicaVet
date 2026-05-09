const express = require('express');

const {
    listarServicos,
} = require("../controllers/servicos_controllers.js");

const router = express.Router();

router.get("/servicos", listarServicos);

module.exports = router;


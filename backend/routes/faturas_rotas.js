const express = require('express');

const {
    listarFaturas
} = require("../controllers/faturas_controllers.js");

const router = express.Router();

router.get("/faturas", listarFaturas);

module.exports = router;
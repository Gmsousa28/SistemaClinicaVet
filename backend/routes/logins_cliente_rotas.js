const express = require('express');

const {
    listarLoginsClientes,
} = require("../controllers/logins_cliente_controllers.js");

const router = express.Router();

router.get("/logins_clientes", listarLoginsClientes);

module.exports = router;
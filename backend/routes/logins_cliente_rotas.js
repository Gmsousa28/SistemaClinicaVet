const express = require('express');

const {
    listarLoginsClientes,
    fazerLoginCliente
} = require("../controllers/logins_cliente_controllers.js");

const router = express.Router();

// Rotas de logins dos clientes
router.get("/logins_clientes", listarLoginsClientes);
router.post("/login_cliente", fazerLoginCliente);

module.exports = router;

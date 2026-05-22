const express = require('express');

const {
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById,
    registarNovoCliente
} = require("../controllers/clientes_controllers.js");

const router = express.Router();

router.get("/clientes", listarClientes);
router.get("/clientes/id/:id", obterClienteByID);
router.get("/clientes/nif/:nif", obterClienteByNif);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarClienteById);
router.post("/clientes/registo", registarNovoCliente);


module.exports = router;

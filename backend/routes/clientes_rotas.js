const express = require('express');

const {
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById
} = require("../controllers/clientes_controllers.js");

const router = express.Router();

<<<<<<< HEAD
=======


// CORREÇÃO 2: Usar essas funções limpas em cada rota
>>>>>>> cc09b54bd5f894775bd1cf4075d26ebc772ffcf3
router.get("/clientes", listarClientes);
router.get("/clientes/id/:id", obterClienteByID);
router.get("/clientes/nif/:nif", obterClienteByNif);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarClienteById);

module.exports = router;

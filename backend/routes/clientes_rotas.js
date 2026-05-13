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


// CORREÇÃO 2: Usar essas funções limpas em cada rota
router.get("/clientes", listarClientes);
router.get("/clientes/id/:id", obterClienteByID);
router.get("/clientes/nif/:nif", obterClienteByNif);
router.post("/clientes", criarCliente);

// Nos métodos PUT e DELETE não há conflito de palavras, mas se quiseres 
// manter a consistência com o GET, podes usar "/clientes/id/:id" aqui também!
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarClienteById);

module.exports = router;

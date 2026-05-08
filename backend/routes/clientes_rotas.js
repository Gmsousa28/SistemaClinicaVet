const express = require('express');

const {
<<<<<<< HEAD
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById
=======
  listarTodosClientes,
  obterClientePorId,
  criarCliente,
  atualizarCliente,
  eliminarCliente,
  obterClientePorNIF
>>>>>>> 27675fc4444e5b89983d48557e236d01c5e5feea
} = require("../controllers/clientes_controllers.js");

const router = express.Router();

<<<<<<< HEAD
console.log('Router de clientes carregado!');
=======
router.get("/clientes", listarTodosClientes);
router.get("/clientes/:id", obterClientePorId);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarCliente);
router.get("/clientes/nif/:NIF", obterClientePorNIF);
>>>>>>> 27675fc4444e5b89983d48557e236d01c5e5feea

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

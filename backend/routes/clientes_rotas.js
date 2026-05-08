const express = require('express');

<<<<<<< HEAD
// CORREÇÃO 1: Importar os nomes corretos do teu Controlador (sem o "BD")
const {
    listarClientes,
    obterClienteByID,
    obterClienteByNif,
    criarCliente,
    atualizarCliente,
    eliminarClienteById
=======
const {
  listarTodosClientes,
  obterClientePorId,
  criarCliente,
  atualizarCliente,
  eliminarCliente
>>>>>>> 9690dfb8861bfba0970fdb617f1d9847a93a2335
} = require("../controllers/clientes_controllers.js");

const router = express.Router();

<<<<<<< HEAD
console.log('Router de clientes carregado!');

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
=======
router.get("/clientes", listarTodosClientes);
router.get("/clientes/:id", obterClientePorId);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarCliente);

module.exports = router;
>>>>>>> 9690dfb8861bfba0970fdb617f1d9847a93a2335

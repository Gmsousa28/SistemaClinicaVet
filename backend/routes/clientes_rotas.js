const express = require('express');

const {
  listarTodosClientes,
  obterClientePorId,
  criarCliente,
  atualizarCliente,
  eliminarCliente
} = require("../controllers/clientes_controllers.js");

const router = express.Router();

router.get("/clientes", listarTodosClientes);
router.get("/clientes/:id", obterClientePorId);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", eliminarCliente);

module.exports = router;
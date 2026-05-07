const express = require('express');

const {
  listarTodosFuncionarios,
  obterFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  eliminarFuncionario
} = require("../controllers/funcionarios_controllers.js");

const router = express.Router();

router.get("/funcionarios", listarTodosFuncionarios);
router.get("/funcionarios/:id", obterFuncionarioPorId);
router.post("/funcionarios", criarFuncionario);
router.put("/funcionarios/:id", atualizarFuncionario);
router.delete("/funcionarios/:id", eliminarFuncionario);

module.exports = router;
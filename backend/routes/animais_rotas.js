const express = require('express');

const {
  listarTodosAnimais,
  obterAnimalPorId,
  criarAnimal,
  atualizarAnimal,
  eliminarAnimal,
  listarAnimaisDoCliente,
  listarAnimaisPorDono
} = require("../controllers/animais_controllers.js");

const router = express.Router();

// Rotas de animais
router.get("/animais", listarTodosAnimais);
router.get("/animais/:id", obterAnimalPorId);
router.post("/animais", criarAnimal); 
router.put("/animais/:id", atualizarAnimal);
router.delete("/animais/:id", eliminarAnimal);
router.get("/animais/cliente/:id", listarAnimaisDoCliente);
router.get("/animais/nif/:nif", listarAnimaisPorDono);


module.exports = router;

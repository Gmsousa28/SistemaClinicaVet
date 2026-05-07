const express = require('express');

const {
  listarTodosAnimais,
  obterAnimalPorId,
  criarAnimal,
  atualizarAnimal,
  eliminarAnimal
} = require("../controllers/animais_controllers.js");

const router = express.Router();

router.get("/animais", listarTodosAnimais);
router.get("/animais/:id", obterAnimalPorId);
router.post("/animais", criarAnimal); 
router.put("/animais/:id", atualizarAnimal);
router.delete("/animais/:id", eliminarAnimal);

module.exports = router;
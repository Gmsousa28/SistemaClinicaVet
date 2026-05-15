const express = require('express');

const {
  listarTodosVeterinarios,
  obterVeterinarioPorId,
  criarVeterinario,
  atualizarVeterinario,
  eliminarVeterinario,
  obterPerfilVeterinario
} = require("../controllers/veterinarios_controllers.js");

const router = express.Router();

router.get("/veterinarios", listarTodosVeterinarios);
router.get("/veterinarios/:id", obterVeterinarioPorId);
router.post("/veterinarios", criarVeterinario);
router.put("/veterinarios/:id", atualizarVeterinario);
router.delete("/veterinarios/:id", eliminarVeterinario);
router.get("/veterinarios/perfil/:id", obterPerfilVeterinario);

module.exports = router;
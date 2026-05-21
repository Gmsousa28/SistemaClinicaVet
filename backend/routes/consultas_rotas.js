const express = require('express');

const {
  listarConsultas,
  criarConsulta,
  obterConsultaById,
  atualizarConsulta,
  eliminarConsulta,
  listarConsultasDoVeterinario
} = require("../controllers/consultas_controllers.js");

const router = express.Router();

router.get("/consultas", listarConsultas);
router.get("/consultas/:id", obterConsultaById);
router.post("/consultas", criarConsulta);
router.put("/consultas/:id", atualizarConsulta);
router.delete("/consultas/:id", eliminarConsulta);
router.get("/consultas/veterinario/:id", listarConsultasDoVeterinario);

module.exports = router;
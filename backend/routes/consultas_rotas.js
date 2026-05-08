const express = require('express');

const {
  listarTodasConsultas,
  obterConsultaPorId,
  criarConsulta,
  atualizarConsulta,
  eliminarConsulta
} = require("../controllers/consultas_controllers.js");

const router = express.Router();

router.get("/consultas", listarTodasConsultas);
router.get("/consultas/:id", obterConsultaPorId);
router.post("/consultas", criarConsulta);
router.put("/consultas/:id", atualizarConsulta);
router.delete("/consultas/:id", eliminarConsulta);

module.exports = router;
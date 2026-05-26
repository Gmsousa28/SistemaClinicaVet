const express = require('express');

const {
  listarConsultas,
  criarConsulta,
  obterConsultaById,
  atualizarConsulta,
  eliminarConsulta,
  listarConsultasDoVeterinario,
  listarConsultasDoAnimal,
  listarConsultasDoCliente
} = require("../controllers/consultas_controllers.js");

const router = express.Router();

router.get("/consultas", listarConsultas);
router.get("/consultas/:id", obterConsultaById);
router.post("/consultas", criarConsulta);
router.put("/consultas/:id", atualizarConsulta);
router.delete("/consultas/:id", eliminarConsulta);
router.get("/consultas/veterinario/:id", listarConsultasDoVeterinario);
router.get("/consultas/animal/:id", listarConsultasDoAnimal);
router.get("/consultas/cliente/:id", listarConsultasDoCliente);

module.exports = router;

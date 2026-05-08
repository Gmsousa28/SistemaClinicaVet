const express = require('express');

const {
  listarTodosResgates,
  obterResgatePorId,
  criarResgate,
  atualizarResgate,
  eliminarResgate
} = require("../controllers/resgates_controllers.js");

const router = express.Router();

router.get("/resgates", listarTodosResgates);
router.get("/resgates/:id", obterResgatePorId);
router.post("/resgates", criarResgate);
router.put("/resgates/:id", atualizarResgate);
router.delete("/resgates/:id", eliminarResgate);

module.exports = router;
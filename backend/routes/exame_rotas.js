const express = require('express');

const {
    listarTodosExames,
    criarExame,
    obterExamePorId,
    obterExamePorNome,
    atualizarExame,
    eliminarExame
} = require("../controllers/exame_controllers.js");

const router = express.Router();

router.get("/exames", listarTodosExames);
router.get("/exames/:id", obterExamePorId);
router.get("/exames/nome/:nome", obterExamePorNome);
router.post("/exames", criarExame);
router.put("/exames/:id", atualizarExame);
router.delete("/exames/:id", eliminarExame);

module.exports = router;
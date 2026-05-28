const express = require('express');

const {
    listarAdocoes,
    criarAdocao,
    obterAdocaoPorIdAnimal,
    obterAdocaoPorId,
    eliminarAdocao
} = require("../controllers/adocoes_controllers.js");

const router = express.Router();

// Rotas de adocoes
router.get("/adocoes", listarAdocoes);
router.post("/adocoes", criarAdocao);
router.get("/adocoes/animal/:id_animal", obterAdocaoPorIdAnimal);
router.get("/adocoes/:id", obterAdocaoPorId);
router.delete("/adocoes/:id", eliminarAdocao);

module.exports = router;




const express = require('express');

const {
  listarTodosResgates,
  obterResgatePorId,
  criarResgate,
  atualizarResgate,
  eliminarResgate,
  listarResgatesPainel,
  criarNovoResgatePainel,
  formalizarAdocao,
  listarAdocoesArquivo
} = require("../controllers/resgates_controllers.js");

const router = express.Router();

// A TUA NOVA ROTA (Coloca-a aqui no topo para segurança!)
router.get("/resgates-painel", listarResgatesPainel); 

// As tuas rotas antigas mantêm-se iguais!
router.get("/resgates", listarTodosResgates);
router.get("/resgates/:id", obterResgatePorId);
router.post("/resgates", criarResgate);
router.put("/resgates/:id", atualizarResgate);
router.delete("/resgates/:id", eliminarResgate);
router.post("/resgates-painel", criarNovoResgatePainel);
router.post("/adocao", formalizarAdocao);
router.get("/adocoes-arquivo", listarAdocoesArquivo);


module.exports = router;
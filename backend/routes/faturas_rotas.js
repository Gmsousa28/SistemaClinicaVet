const express = require('express');

const {
    listarFaturas,
    listarPendentesFaturacao,
    listarHistoricoFaturacao,
    pagarFatura,
    eliminarFatura
} = require("../controllers/faturas_controllers.js");

const router = express.Router();

router.get("/faturas", listarFaturas);

router.get(
    "/faturas/pendentes",
    listarPendentesFaturacao
);

router.get(
    "/faturas/historico",
    listarHistoricoFaturacao
);

router.post("/faturas/pagar", pagarFatura);



module.exports = router;
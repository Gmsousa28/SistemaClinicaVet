const express = require('express');

const {
    listarLoginsColaboradores,
    fazerLoginColaborador,
    fazerLogoutColaborador, // <-- 1. Importamos a nova função de logout
    obterPerfilColaborador
} = require("../controllers/logins_colaborador_controllers.js");

const router = express.Router();

router.get("/logins_colaboradores", listarLoginsColaboradores);
router.post("/login_colaborador", fazerLoginColaborador);
router.post("/logout_colaborador", fazerLogoutColaborador); // <-- 2. Criamos o endpoint para o site chamar
router.get("/colaboradores/:id", obterPerfilColaborador);

module.exports = router;
const express = require('express');

const {
    listarLoginsColaboradores,
    fazerLoginColaborador,
    fazerLogoutColaborador,
    obterPerfilColaborador
} = require("../controllers/logins_colaborador_controllers.js");

const router = express.Router();

// Rotas de logins dos colaboradores
router.get("/logins_colaboradores", listarLoginsColaboradores);
router.post("/login_colaborador", fazerLoginColaborador);
router.post("/logout_colaborador", fazerLogoutColaborador);
router.get("/colaboradores/:id", obterPerfilColaborador);

module.exports = router;

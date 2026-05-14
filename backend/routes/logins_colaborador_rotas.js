const express = require('express');

const {
    listarLoginsColaboradores,
    fazerLoginColaborador
} = require("../controllers/logins_colaborador_controllers.js");

const router = express.Router();

router.get("/logins_colaboradores", listarLoginsColaboradores);
router.post("/login_colaborador", fazerLoginColaborador);

module.exports = router;
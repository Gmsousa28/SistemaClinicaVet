const express = require('express');

const {
    listarLoginsColaboradores,
} = require("../controllers/logins_colaborador_controllers.js");

const router = express.Router();

router.get("/logins_colaboradores", listarLoginsColaboradores);

module.exports = router;
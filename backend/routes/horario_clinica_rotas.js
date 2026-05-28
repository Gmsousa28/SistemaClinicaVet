const express = require('express');

const {
    listarHorariosClinica,
    criarHorarioClinica,
    obterHorarioClinicaByDiaSemana,
    atualizarHorarioClinica,
    eliminarHorarioClinica
} = require("../controllers/horario_clinica_controllers.js");

const router = express.Router();

// Rotas de horarios da clinica
router.get("/horarios_clinica", listarHorariosClinica);
router.get("/horarios_clinica/:dia_semana", obterHorarioClinicaByDiaSemana);
router.post("/horarios_clinica", criarHorarioClinica);
router.put("/horarios_clinica/:dia_semana", atualizarHorarioClinica);
router.delete("/horarios_clinica/:dia_semana", eliminarHorarioClinica);

module.exports = router;

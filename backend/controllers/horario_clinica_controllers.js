const {
    listarHorariosClinicaBD,
    criarHorarioClinicaBD,
    obterHorarioClinicaByDiaSemanaBD,
    atualizarHorarioClinicaBD,
    eliminarHorarioClinicaBD
} = require('../models/horario_clinica_models.js');

const listarHorariosClinica = async (req, res) => {
    try {
        const horarios = await listarHorariosClinicaBD();
        res.status(200).json({ status: 200, message: "Lista de horários da clínica carregada", data: horarios });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao carregar os horários da clínica", error: err.message });
    }
};

const criarHorarioClinica = async (req, res) => {
    const { dia_semana, hora_abertura, hora_fecho } = req.body;
    try {
        const novoHorario = await criarHorarioClinicaBD(dia_semana, hora_abertura, hora_fecho);
        res.status(201).json({ status: 201, message: "Novo horário da clínica criado com sucesso", data: novoHorario });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao criar o horário da clínica", error: err.message });
    }
};

const obterHorarioClinicaByDiaSemana = async (req, res) => {
    try {
        const horario = await obterHorarioClinicaByDiaSemanaBD(req.params.dia_semana);
        if (!horario) return res.status(404).json({ status: 404, message: "Horário da clínica não encontrado para o dia especificado" });
        res.status(200).json({ status: 200, message: "Dados do horário da clínica recuperados", data: horario });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao recuperar o horário da clínica", error: err.message });
    }
};

const atualizarHorarioClinica = async (req, res) => {
    const { hora_abertura, hora_fecho } = req.body;
    try {
        const atualizado = await atualizarHorarioClinicaBD(req.params.dia_semana, hora_abertura, hora_fecho);
        if (!atualizado) return res.status(404).json({ status: 404, message: "Não foi possível atualizar o horário da clínica para o dia especificado" });
        res.status(200).json({ status: 200, message: "Horário da clínica atualizado com sucesso", data: atualizado });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao atualizar o horário da clínica", error: err.message });
    }
};

const eliminarHorarioClinica = async (req, res) => {
    try {
        const eliminado = await eliminarHorarioClinicaBD(req.params.dia_semana);
        if (!eliminado) return res.status(404).json({ status: 404, message: "Horário da clínica não encontrado para remoção no dia especificado" });
        res.status(200).json({ status: 200, message: "Horário da clínica removido do sistema", data: eliminado });
    } catch (err) {
        res.status(500).json({ status: 500, message: "Erro ao eliminar o horário da clínica", error: err.message });
    }
};

module.exports = {
    listarHorariosClinica,
    criarHorarioClinica,
    obterHorarioClinicaByDiaSemana,
    atualizarHorarioClinica,
    eliminarHorarioClinica
};
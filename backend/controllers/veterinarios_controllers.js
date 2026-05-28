const {
  listarVeterinariosBD,
  criarVeterinarioBD,
  obterVeterinarioPorIdBD,
  atualizarVeterinarioBD,
  eliminarVeterinarioBD,
  obterPerfilVetBD
} = require("../models/veterinarios_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// Listar todos os veterinarios
const listarTodosVeterinarios = async (req, res, next) => {
  try {
    const veterinarios = await listarVeterinariosBD();
    handleResponse(res, 200, "Lista de veterinários carregada", veterinarios);
  } catch (err) {
    next(err);
  }
};

// Criar veterinario
const criarVeterinario = async (req, res, next) => {
  const { nome, morada, contacto, email, nif, especialidade } = req.body;
  try {
    const novoVeterinario = await criarVeterinarioBD(nome, morada, contacto, email, nif, especialidade);
    handleResponse(res, 201, "Novo veterinário registado com sucesso", novoVeterinario);
  } catch (err) {
    next(err);
  }
};

// Obter veterinario por ID
const obterVeterinarioPorId = async (req, res, next) => {
  try {
    const veterinario = await obterVeterinarioPorIdBD(req.params.id);
    if (!veterinario) return handleResponse(res, 404, "Veterinário não encontrado");
    handleResponse(res, 200, "Dados do veterinário recuperados", veterinario);
  } catch (err) {
    next(err);
  }
};

// Atualizar veterinario
const atualizarVeterinario = async (req, res, next) => {
  const { nome, morada, contacto, email, nif, especialidade } = req.body;
  try {
    const atualizado = await atualizarVeterinarioBD(req.params.id, nome, morada, contacto, email, nif, especialidade);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o veterinário");
    handleResponse(res, 200, "Ficha do veterinário atualizada", atualizado);
  } catch (err) {
    next(err);
  }
};

// Eliminar veterinario
const eliminarVeterinario = async (req, res, next) => {
  try {
    const eliminado = await eliminarVeterinarioBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Veterinário não encontrado para remoção");
    handleResponse(res, 200, "Veterinário removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};

// Obter perfil do veterinario
const obterPerfilVeterinario = async (req, res) => {
  try {
      const idColaborador = req.params.id;
      const perfil = await obterPerfilVetBD(idColaborador);

      if (!perfil) {
          return res.status(404).json({ 
              status: 404, 
              message: "Perfil não encontrado na base de dados." 
          });
      }

      return res.status(200).json({ 
          status: 200, 
          message: "Perfil carregado com sucesso", 
          data: perfil 
      });

  } catch (err) {
      console.error("Erro ao obter perfil do veterinário:", err);
      return res.status(500).json({ 
          status: 500, 
          message: "Erro interno do servidor." 
      });
  }
};

module.exports = {
  listarTodosVeterinarios,
  criarVeterinario,
  obterVeterinarioPorId,
  atualizarVeterinario,
  eliminarVeterinario,
  obterPerfilVeterinario
};

const {
  listarResgatesBD,
  criarResgateBD,
  obterResgatePorIdBD,
  atualizarResgateBD,
  listarResgatesPainelBD,
  eliminarResgateBD,
  criarResgateCompletoBD,
  formalizarAdocaoBD,
  listarAdocoesArquivoBD
} = require("../models/resgates_models.js");

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// Listar todos os resgates
const listarTodosResgates = async (req, res, next) => {
  try {
    const resgates = await listarResgatesBD();
    handleResponse(res, 200, "Lista de resgates carregada", resgates);
  } catch (err) {
    next(err);
  }
};

// Criar resgate
const criarResgate = async (req, res, next) => {
  const { id_animal, id_funcionario, data_resgate, idade } = req.body;
  try {
    const novoResgate = await criarResgateBD(id_animal, id_funcionario, data_resgate, idade);
    handleResponse(res, 201, "Novo resgate registado com sucesso", novoResgate);
  } catch (err) {
    next(err);
  }
};

// Obter resgate por ID
const obterResgatePorId = async (req, res, next) => {
  try {
    const resgate = await obterResgatePorIdBD(req.params.id);
    if (!resgate) return handleResponse(res, 404, "Registo de resgate não encontrado");
    handleResponse(res, 200, "Dados do resgate recuperados", resgate);
  } catch (err) {
    next(err);
  }
};

// Atualizar resgate
const atualizarResgate = async (req, res, next) => {
  const { id_animal, id_funcionario, data_resgate, idade } = req.body;
  try {
    const atualizado = await atualizarResgateBD(req.params.id, id_animal, id_funcionario, data_resgate, idade);
    if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar o registo de resgate");
    handleResponse(res, 200, "Registo de resgate atualizado", atualizado);
  } catch (err) {
    next(err);
  }
};

// Eliminar resgate
const eliminarResgate = async (req, res, next) => {
  try {
    const eliminado = await eliminarResgateBD(req.params.id);
    if (!eliminado) return handleResponse(res, 404, "Registo de resgate não encontrado para remoção");
    handleResponse(res, 200, "Registo de resgate removido do sistema", eliminado);
  } catch (err) {
    next(err);
  }
};


// Listar resgates do painel
const listarResgatesPainel = async (req, res, next) => {
    try {
        const resgates = await listarResgatesPainelBD(); // Usa o novo model
        res.status(200).json({ status: 200, message: "Cartões de resgate carregados", data: resgates });
    } catch (err) {
        next(err);
    }
};


// Criar novo resgate no painel
const criarNovoResgatePainel = async (req, res, next) => {
    try {
        const { nome_animal, especie, raca, idade_aprox, data_resgate, id_funcionario } = req.body;
        
        const novoResgate = await criarResgateCompletoBD(
            nome_animal, especie, raca, idade_aprox, data_resgate, id_funcionario
        );
        
        res.status(201).json({ status: 201, message: "Resgate criado com sucesso!", data: novoResgate });
    } catch (err) {
        console.error("Erro ao criar resgate:", err);
        res.status(500).json({ status: 500, message: "Erro ao criar resgate." });
    }
};


// Formalizar adocao
const formalizarAdocao = async (req, res, next) => {
    try {
        const { id_animal, nif_cliente } = req.body;
        
        const animalAdotado = await formalizarAdocaoBD(id_animal, nif_cliente);
        
        res.status(200).json({ 
            status: 200, 
            message: "Adoção formalizada com sucesso!", 
            data: animalAdotado 
        });
    } catch (err) {
        console.error("Erro na adoção:", err);
        res.status(500).json({ status: 500, message: err.message || "Erro ao processar adoção." });
    }
};

// Listar adocoes do arquivo
const listarAdocoesArquivo = async (req, res, next) => {
    try {
        const adocoes = await listarAdocoesArquivoBD();
        res.status(200).json({ status: 200, data: adocoes });
    } catch (err) {
        console.error("Erro ao puxar arquivo:", err);
        res.status(500).json({ status: 500, message: "Erro ao carregar arquivo." });
    }
};

module.exports = {
  listarTodosResgates,
  criarResgate,
  obterResgatePorId,
  atualizarResgate,
  eliminarResgate,
  listarResgatesPainel,
  criarNovoResgatePainel,
  formalizarAdocao,
  listarAdocoesArquivo
};

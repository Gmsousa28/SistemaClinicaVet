const {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD,
    obterconsultasdovetespecificoBD
}= require('../models/consultas_models');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
}

const listarConsultas = async (req, res, next) => {
    try {
        const consultas = await listarConsultasBD();
        handleResponse(res, 200, "Lista de consultas carregada", consultas);
    } catch (err) {
        next(err);
    }
};

const criarConsulta = async (req, res) => {
    // 1. Extraímos os 4 campos do frontend
    const { id_animal, id_veterinario, data_consulta, motivo } = req.body;
    
    try {
        // 2. Transformar a string "consulta, banho" numa lista: ['consulta', 'banho']
        const motivosArray = motivo.split(',').map(m => m.trim().toLowerCase());
        
        const temConsulta = motivosArray.includes('consulta');
        const outrosServicos = motivosArray.filter(m => m !== 'consulta'); // Isola banhos e tosquias

        let resposta = { consulta: null, servicos: [] };

        // ==========================================
        // ROTA A: É PARA A TABELA DE CONSULTAS
        // ==========================================
        if (temConsulta) {
            // Usa a tua função com as regras da professora (Bloco DO $$)
            resposta.consulta = await criarConsultaBD(id_animal, id_veterinario, data_consulta, 'Consulta');
        }

        // ==========================================
        // ROTA B: É PARA A TABELA DE SERVIÇOS
        // ==========================================
        if (outrosServicos.length > 0) {
            // 1. Vai pescar um funcionário à sorte que NÃO seja Médico
            const funcionario = await obterFuncionarioServicoAleatorioBD();
            
            if (!funcionario) {
                return handleResponse(res, 400, "Erro: Não há auxiliares/banhistas registados para fazer o serviço.");
            }

            // 2. Faz o INSERT para cada serviço extra (banho, tosquia, etc.)
            for (const tipo of outrosServicos) {
                // Primeira letra maiúscula para o ENUM da base de dados aceitar (ex: 'Banho', 'Tosquia')
                const tipoEnum = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                
                // Preço base obrigatório (já que a tua tabela não tem DEFAULT para preço)
                const precoServico = tipo === 'tosquia' ? 25.00 : 20.00;

                const novoServico = await criarServicoBD(
                    id_animal, 
                    funcionario.id_funcionario, 
                    data_consulta, 
                    tipoEnum, 
                    precoServico
                );
                resposta.servicos.push(novoServico);
            }
        }

        // 3. Tudo correu bem!
        return handleResponse(res, 201, "Marcação efetuada com sucesso e distribuída pelas tabelas!", resposta);
        
    } catch (err) {
        console.error(">>> ERRO A GRAVAR MARCAÇÃO:", err.message);

        // Apanha as mensagens da tua professora do Bloco DO $$
        if (err.message && err.message.includes('Operação bloqueada')) {
            return handleResponse(res, 400, err.message);
        }

        // Se for um erro diferente (tipo servidor abaixo ou colunas erradas)
        return handleResponse(res, 500, "Erro interno no servidor: " + err.message);
    }
};

const obterConsultaById = async (req, res, next) => {
    try {
        const consulta = await obterConsultaByIdBD(req.params.id);
        if (!consulta) return handleResponse(res, 404, "Consulta não encontrada");
        handleResponse(res, 200, "Dados da consulta recuperados", consulta);
    } catch (err) {
        next(err);
    }
};

const atualizarConsulta = async (req, res, next) => {
    const { id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco } = req.body;
    try {
        const atualizado = await atualizarConsultaBD(req.params.id, id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco);
        if (!atualizado) return handleResponse(res, 404, "Não foi possível atualizar a consulta");
        handleResponse(res, 200, "Consulta atualizada com sucesso", atualizado);
    } catch (err) {
        next(err);
    }
};

const eliminarConsulta = async (req, res, next) => {
    try {
        const eliminado = await eliminarConsultaBD(req.params.id);
        if (!eliminado) return handleResponse(res, 404, "Não foi possível eliminar a consulta");
        handleResponse(res, 200, "Consulta eliminada com sucesso", eliminado);
    } catch (err) {
        next(err);
    }
};

const listarConsultasDoVeterinario = async (req, res, next) => {
    try {
        // 1. Apanhar o ID do veterinário que vem no URL do pedido
        const id_veterinario = req.params.id; 

        // 2. Passar esse ID para a tua função da base de dados
        const consultas = await obterconsultasdovetespecicifoBD(id_veterinario);

        // 3. Enviar a resposta para o Frontend (usando a tua estrutura habitual)
        res.status(200).json({ status: 200, message: "Consultas carregadas", data: consultas });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    listarConsultas,
    criarConsulta,
    obterConsultaById,
    atualizarConsulta,
    eliminarConsulta,
    listarConsultasDoVeterinario
};
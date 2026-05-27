const {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD,
    obterFuncionarioServicoAleatorioBD,
    criarServicoBD,
    obterconsultasdovetespecificoBD,
    obterconsultasdoanipecificoBD,
    obterVeterinarioDisponivelBD, // 🛡️ Faltava importar isto!
    obterConsultasDoClienteBD,
    guardarDiagnosticoFinalBD
} = require('../models/consultas_models');

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

// O teu novo controlador:
const listarConsultasDoCliente = async (req, res, next) => {
    try {
        const id_cliente = req.params.id; 
        const consultas = await obterConsultasDoClienteBD(id_cliente);
        
        // Usando a tua função handleResponse habitual
        handleResponse(res, 200, "Consultas do cliente carregadas", consultas);
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
            let vetIdFinal = id_veterinario;

            // 🛡️ O ESCUDO: Intercetar o zero!
            // Usamos String() para garantir que apanhamos "0" ou 0
            if (String(vetIdFinal) === "0") {
                console.log(">>> A rececionista pediu Qualquer Médico (ID 0). A procurar quem está de serviço...");
                
                const vetDisponivel = await obterVeterinarioDisponivelBD(data_consulta);
                
                if (!vetDisponivel) {
                    return handleResponse(res, 400, "Erro: Não encontrámos nenhum veterinário de serviço com a agenda livre para o dia e hora selecionados.");
                }
                
                // Trocamos o 0 pelo ID real do médico antes de mandar para a BD!
                vetIdFinal = vetDisponivel.id_veterinario;
                console.log(">>> Sucesso! A consulta foi atribuída ao Médico ID:", vetIdFinal);
            }

            // Executa a gravação já com o ID real
            resposta.consulta = await criarConsultaBD(id_animal, vetIdFinal, data_consulta, 'Consulta');
        }

        // ==========================================
        // ROTA B: É PARA A TABELA DE SERVIÇOS
        // ==========================================
        if (outrosServicos.length > 0) {
            const totalBlocosEstetica = outrosServicos.length;

            // 1. Encontra UM único funcionário aleatório com a agenda livre para o combo completo
            const funcionarioElegivel = await obterFuncionarioServicoAleatorioBD(data_consulta, totalBlocosEstetica);
            
            if (!funcionarioElegivel) {
                return handleResponse(res, 400, "Erro: Não encontrámos nenhum funcionário com disponibilidade contínua para realizar todos os serviços de estética selecionados neste horário.");
            }

            // 2. Com o funcionário garantido para todo o percurso, fazemos os INSERTS em cascata
            for (let i = 0; i < outrosServicos.length; i++) {
                const tipo = outrosServicos[i];
                
                // Calcula a hora exata de cada bloco (ex: 1º serviço às 11:30, 2º às 12:00)
                let dataSlot = new Date(data_consulta);
                dataSlot.setMinutes(dataSlot.getMinutes() + (i * 30));

                // Primeira letra maiúscula para o ENUM
                const tipoEnum = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                
                // Preço base estipulado
                const precoServico = tipo === 'tosquia' ? 25.00 : 20.00;

                // Gravamos na tabela 'servicos'
                const novoServico = await criarServicoBD(
                    id_animal, 
                    funcionarioElegivel.id_funcionario, // O mesmo funcionário faz a sequência toda!
                    dataSlot, 
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

        // 2. Passar esse ID para a tua função da base de dados (CORRIGIDO: "especifico")
        const consultas = await obterconsultasdovetespecificoBD(id_veterinario);

        // 3. Enviar a resposta para o Frontend (usando a tua estrutura habitual)
        res.status(200).json({ status: 200, message: "Consultas carregadas", data: consultas });
    } catch (err) {
        next(err);
    }
};

const listarConsultasDoAnimal = async (req, res, next) => {
    try {
        const id_animal = req.params.id; 
        const consultas = await obterconsultasdoanipecificoBD(id_animal);
        res.status(200).json({ status: 200, message: "Consultas do animal carregadas", data: consultas });
    } catch (err) {
        next(err);
    }
};

const finalizarConsulta = async (req, res) => {

    try {

        const { id_consulta, diagnostico } = req.body;

        // Validação dos dados
        if (!id_consulta || !diagnostico) {
            return res.status(400).json({
                status: 400,
                message: "Faltam dados: ID da consulta ou o diagnóstico está vazio."
            });
        }

        // Guarda na BD
        const consultaAtualizada = await guardarDiagnosticoFinalBD(
            id_consulta,
            diagnostico
        );

        // Consulta não encontrada
        if (!consultaAtualizada) {
            return res.status(404).json({
                status: 404,
                message: "Consulta não encontrada."
            });
        }

        // Sucesso
        return res.status(200).json({
            status: 200,
            message: "Diagnóstico guardado com sucesso.",
            consulta: consultaAtualizada
        });

    } catch (erro) {

        console.error("Erro ao finalizar consulta:", erro);

        return res.status(500).json({
            status: 500,
            message: "Erro interno do servidor."
        });
    }
};

module.exports = {
    listarConsultas,
    criarConsulta,
    obterConsultaById,
    atualizarConsulta,
    eliminarConsulta,
    listarConsultasDoVeterinario,
    listarConsultasDoAnimal,
    listarConsultasDoCliente,
    finalizarConsulta
};
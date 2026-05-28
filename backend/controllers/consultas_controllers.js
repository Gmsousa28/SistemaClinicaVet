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
    obterVeterinarioDisponivelBD 
} = require('../models/consultas_models');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
}

// Listar consultas
const listarConsultas = async (req, res, next) => {
    try {
        const consultas = await listarConsultasBD();
        handleResponse(res, 200, "Lista de consultas carregada", consultas);
    } catch (err) {
        next(err);
    }
};

// Criar consulta
const criarConsulta = async (req, res) => {
    
    const { id_animal, id_veterinario, data_consulta, motivo } = req.body;
    
    try {
        
        const motivosArray = motivo.split(',').map(m => m.trim().toLowerCase());
        
        const temConsulta = motivosArray.includes('consulta');
        const outrosServicos = motivosArray.filter(m => m !== 'consulta'); 

        let resposta = { consulta: null, servicos: [] };

        
        if (temConsulta) {
            let vetIdFinal = id_veterinario;

            
            if (String(vetIdFinal) === "0") {
                console.log(">>> A rececionista pediu Qualquer Médico (ID 0). A procurar quem está de serviço...");
                
                const vetDisponivel = await obterVeterinarioDisponivelBD(data_consulta);
                
                if (!vetDisponivel) {
                    return handleResponse(res, 400, "Erro: Não encontrámos nenhum veterinário de serviço com a agenda livre para o dia e hora selecionados.");
                }
                
                
                vetIdFinal = vetDisponivel.id_veterinario;
                console.log(">>> Sucesso! A consulta foi atribuída ao Médico ID:", vetIdFinal);
            }

            
            resposta.consulta = await criarConsultaBD(id_animal, vetIdFinal, data_consulta, 'Consulta');
        }

        
        if (outrosServicos.length > 0) {
            const totalBlocosEstetica = outrosServicos.length;

            
            const funcionarioElegivel = await obterFuncionarioServicoAleatorioBD(data_consulta, totalBlocosEstetica);
            
            if (!funcionarioElegivel) {
                return handleResponse(res, 400, "Erro: Não encontrámos nenhum funcionário com disponibilidade contínua para realizar todos os serviços de estética selecionados neste horário.");
            }

            
            for (let i = 0; i < outrosServicos.length; i++) {
                const tipo = outrosServicos[i];
                
                
                let dataSlot = new Date(data_consulta);
                dataSlot.setMinutes(dataSlot.getMinutes() + (i * 30));
      
                const tipoEnum = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                
                const precoServico = tipo === 'tosquia' ? 25.00 : 20.00;

                const novoServico = await criarServicoBD(
                    id_animal, 
                    funcionarioElegivel.id_funcionario, 
                    dataSlot, 
                    tipoEnum, 
                    precoServico
                );
                resposta.servicos.push(novoServico);
            }
        }
        
        return handleResponse(res, 201, "Marcação efetuada com sucesso e distribuída pelas tabelas!", resposta);
        
    } catch (err) {
        console.error(">>> ERRO A GRAVAR MARCAÇÃO:", err.message);

        if (err.message && err.message.includes('Operação bloqueada')) {
            return handleResponse(res, 400, err.message);
        }
 
        return handleResponse(res, 500, "Erro interno no servidor: " + err.message);
    }
};


// Obter consulta por ID
const obterConsultaById = async (req, res, next) => {
    try {
        const consulta = await obterConsultaByIdBD(req.params.id);
        if (!consulta) return handleResponse(res, 404, "Consulta não encontrada");
        handleResponse(res, 200, "Dados da consulta recuperados", consulta);
    } catch (err) {
        next(err);
    }
};


// Atualizar consulta
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


// Eliminar consulta
const eliminarConsulta = async (req, res, next) => {
    try {
        const eliminado = await eliminarConsultaBD(req.params.id);
        if (!eliminado) return handleResponse(res, 404, "Não foi possível eliminar a consulta");
        handleResponse(res, 200, "Consulta eliminada com sucesso", eliminado);
    } catch (err) {
        next(err);
    }
};


// Listar consultas do veterinario
const listarConsultasDoVeterinario = async (req, res, next) => {
    try {
        const id_veterinario = req.params.id; 

        const consultas = await obterconsultasdovetespecificoBD(id_veterinario);

        res.status(200).json({ status: 200, message: "Consultas carregadas", data: consultas });
    } catch (err) {
        next(err);
    }
};

// Listar consultas do animal
const listarConsultasDoAnimal = async (req, res, next) => {
    try {
        const id_animal = req.params.id; 
        const consultas = await obterconsultasdoanipecificoBD(id_animal);
        res.status(200).json({ status: 200, message: "Consultas do animal carregadas", data: consultas });
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
    listarConsultasDoVeterinario,
    listarConsultasDoAnimal
};

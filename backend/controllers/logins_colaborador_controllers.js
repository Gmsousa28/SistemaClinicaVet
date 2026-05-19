const {
    listarLoginsColaboradoresBD,
    obterPerfilColaboradorBD,
    obterPerfilPorLoginColabBD,
    realizarLoginColaboradorBD,
    logoutDispositivoColabBD
} = require('../models/logins_colaborador_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarLoginsColaboradores = async (req, res, next) => {
    try {
        const loginsColaboradores = await listarLoginsColaboradoresBD();
        handleResponse(res, 200, "Lista de logins de colaboradores carregada", loginsColaboradores);
    } catch (err) {
        next(err);
    }
};

const fazerLoginColaborador = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: "Por favor, insere o email e a palavra-passe." 
            });
        }

        // 1. A BD trata de validar as credenciais e aplicar as regras das 12h
        const sessao = await realizarLoginColaboradorBD(email, password);

        if (!sessao) {
            return res.status(401).json({ 
                status: 401, 
                message: "Email ou palavra-passe incorreta." 
            });
        }

        // 2. Extraímos os retornos gerados pela tua procedure SQL
        const idLoginColab = sessao.id_colaborador || sessao.id_resultado;
        const idSessao = sessao.id_sessao || sessao.id_logs;

        // 3. Procura o perfil pelo id_login_colaborador correspondente (Rita / Tiago corrigido!)
        const utilizadorCompleto = await obterPerfilPorLoginColabBD(idLoginColab);

        if (!utilizadorCompleto) {
            return res.status(404).json({ status: 404, message: "Perfil do colaborador não encontrado." });
        }

        // Limpeza de segurança
        if (utilizadorCompleto.palavra_passe) {
            delete utilizadorCompleto.palavra_passe;
        }

        // 4. Devolve a resposta compatível com o código dos teus colegas + o id_sessao
        return res.status(200).json({ 
            status: 200, 
            message: "Login efetuado com sucesso!", 
            id_sessao: idSessao, // O teu identificador para a auditoria
            data: utilizadorCompleto // O objeto intacto que o frontend deles espera
        });

    } catch (err) {
        // Apanha os erros disparados pelo RAISE EXCEPTION do PostgreSQL (ex: Conta suspensa ou Já Logado)
        console.error("Bloqueio no login:", err.message);
        return res.status(403).json({ 
            status: 403, 
            message: err.message 
        });
    }
};

// --- ADICIONADA: Função que gere o Logout vindo do botão da Sidebar ---
const fazerLogoutColaborador = async (req, res) => {
    try {
        const { id_colaborador, id_sessao } = req.body; 

        if (!id_colaborador || !id_sessao) {
            return res.status(400).json({ status: 400, message: "Dados de sessão em falta para efetuar logout." });
        }

        const resultado = await logoutDispositivoColabBD(id_colaborador, id_sessao);

        if (resultado && resultado.logout_dispositivo_colab === true) {
            return res.status(200).json({ status: 200, message: "Sessão encerrada com sucesso." });
        } else {
            return res.status(400).json({ status: 400, message: "Sessão já se encontrava encerrada ou os IDs não coincidem." });
        }
    } catch (err) {
        console.error("Erro no logout:", err.message);
        return res.status(500).json({ status: 500, message: "Erro interno do servidor." });
    }
};

const obterPerfilColaborador = async (req, res) => {
    try {
        const { id } = req.params; 
        
        // Mantém a pesquisa pelo ID do colaborador tradicional para a rota GET
        const colaborador = await obterPerfilColaboradorBD(id);
        
        if (!colaborador) {
            return res.status(404).json({ status: 404, message: "Colaborador não encontrado." });
        }
        
        return res.status(200).json({ 
            status: 200, 
            message: "Perfil carregado com sucesso!", 
            data: colaborador 
        });
    } catch (err) {
        console.error("Erro ao obter perfil:", err);
        return res.status(500).json({ status: 500, message: "Erro interno do servidor." });
    }
};

module.exports = {
    listarLoginsColaboradores,
    fazerLoginColaborador,
    fazerLogoutColaborador, // Exportado corretamente para as tuas rotas
    obterPerfilColaborador
};
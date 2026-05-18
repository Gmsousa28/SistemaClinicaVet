const {
    listarLoginsColaboradoresBD,
    verificarLoginColaboradorBD,
    obterPerfilColaboradorBD
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
    try{
        // 1. Apanhar os dados que o JavaScript do frontend nos enviou (POST)
        const { email, password } = req.body;

        // 2. Validação básica de segurança
        if (!email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: "Por favor, insere o email e a palavra-passe." 
            });
        }

        // 3. Vai à Base de Dados procurar APENAS por este email usando a tua função
        const utilizador = await verificarLoginColaboradorBD(email);

        // 4. Se a BD não devolveu nada, é porque o email não existe (ou a conta está inativa)
        if (!utilizador) {
            return res.status(401).json({ 
                status: 401, 
                message: "Email não encontrado ou conta inativa." 
            });
        }

        // 5. Comparar as passwords! 
        // Vê se a password do site é igual à 'palavra_passe' da base de dados
        if (password === utilizador.palavra_passe) {
            
            // SUCESSO! 
            // Por segurança, vamos apagar a password da resposta antes de a enviar para o frontend
            delete utilizador.palavra_passe;

            return res.status(200).json({ 
                status: 200, 
                message: "Login efetuado com sucesso!", 
                data: utilizador // O frontend vai guardar isto (id_colaborador e email) na memória
            });

        } else {
            // Se as passwords não baterem certo...
            return res.status(401).json({ 
                status: 401, 
                message: "Palavra-passe incorreta." 
            });
        }
    }
    catch (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ 
            status: 500, 
            message: "Erro interno do servidor." 
        });
    }
};


// Importa o obterPerfilColaboradorBD no topo do ficheiro!
// const { obterPerfilColaboradorBD } = require('../models/logins_colaborador_models.js');

const obterPerfilColaborador = async (req, res) => {
    try {
        const { id } = req.params; // Apanha o ID que vem na URL (ex: 6)
        
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

// Lembra-te de adicionar obterPerfilColaborador no module.exports lá no fundo!

module.exports = {
    listarLoginsColaboradores,
    fazerLoginColaborador,
    obterPerfilColaborador
};
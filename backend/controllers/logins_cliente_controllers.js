const {
    listarLoginsClientesBD,
    verificarLoginClienteBD
} = require('../models/logins_cliente_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

const listarLoginsClientes = async (req, res) => {
    try {
        const loginsClientes = await listarLoginsClientesBD();
        handleResponse(res, 200, "Lista de logins de clientes carregada", loginsClientes);
    } catch (err) {
        console.error("Erro ao listar logins de clientes:", err);
        handleResponse(res, 500, "Erro interno do servidor.");
    }
};

const fazerLoginCliente = async (req, res) => {
    try {
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
        const utilizador = await verificarLoginClienteBD(email);

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
                data: utilizador // O frontend vai guardar isto (id_cliente e email) na memória
            });

        } else {
            // Se as passwords não baterem certo...
            return res.status(401).json({ 
                status: 401, 
                message: "A palavra-passe está incorreta." 
            });
        }

    } catch (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ 
            status: 500, 
            message: "Erro interno do servidor." 
        });
    }
};

module.exports = {
    listarLoginsClientes,
    fazerLoginCliente
};
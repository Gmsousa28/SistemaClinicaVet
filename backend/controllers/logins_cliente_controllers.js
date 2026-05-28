const {
    listarLoginsClientesBD,
    verificarLoginClienteBD
} = require('../models/logins_cliente_models.js');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

// Listar logins de clientes
const listarLoginsClientes = async (req, res) => {
    try {
        const loginsClientes = await listarLoginsClientesBD();
        handleResponse(res, 200, "Lista de logins de clientes carregada", loginsClientes);
    } catch (err) {
        console.error("Erro ao listar logins de clientes:", err);
        handleResponse(res, 500, "Erro interno do servidor.");
    }
};

// Fazer login de cliente
const fazerLoginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: "Por favor, insere o email e a palavra-passe." 
            });
        }
o
        const utilizador = await verificarLoginClienteBD(email);

        if (!utilizador) {
            return res.status(401).json({ 
                status: 401, 
                message: "Email não encontrado ou conta inativa." 
            });
        }


        if (password === utilizador.palavra_passe) {
            
            delete utilizador.palavra_passe;

            return res.status(200).json({ 
                status: 200, 
                message: "Login efetuado com sucesso!", 
                data: utilizador 
            });

        } else {
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

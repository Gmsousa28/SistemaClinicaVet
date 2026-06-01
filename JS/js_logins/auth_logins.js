/* auth.js - Lógica para Registo e Login da Clínica Miacãomigo */

function avancarPasso() {
    const pass1 = document.getElementById('inputPassword1').value;
    const pass2 = document.getElementById('inputPassword2').value;

    if (pass1 === "" || pass2 === "") {
        alert("Por favor, preenche a palavra-passe e a confirmação.");
        return; 
    }

    if (pass1 !== pass2) {
        alert("As palavras-passe não coincidem. Tenta novamente!");
        return; 
    }

    document.getElementById('passo1').classList.add('d-none');
    document.getElementById('passo2').classList.remove('d-none');
}




function voltarPasso() {
    document.getElementById('passo2').classList.add('d-none');
    document.getElementById('passo1').classList.remove('d-none');
}



async function fazerLogin(event) {
    // Evita que a página faça refresh
    event.preventDefault();

    // Limpa o browser logo no início para garantir que não há lixo de sessões anteriores
    localStorage.clear();

    // Apanha os valores do formulário HTML
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const tipoUtilizador = document.getElementById('tipo_utilizador').value;

    try {
        let urlAPI = '';

        // Verifica o tipo de utilizador (apenas para decidir qual a rota a chamar) assim torna se mais eficiente
        if (tipoUtilizador === 'cliente') {
            urlAPI = 'http://localhost:8008/api/login_cliente';
        } else if (tipoUtilizador === 'colaborador') {
            urlAPI = 'http://localhost:8008/api/login_colaborador'; 
        } else {
            alert("Por favor, seleciona um tipo de conta válido.");
            return; 
        }
        
        // Envia o email e password para o backend
        const resposta = await fetch(urlAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput,
                password: passwordInput
            })
        });

        const dados = await resposta.json();

        // Se o backend disser que os dados estão errados (ex: 401 ou 500)
        if (!resposta.ok) {
            throw new Error(dados.message || "Email ou password incorretos.");
        }

        // --- SUCESSO ---
        
        // Grava os dados do login na memória do browser
        localStorage.setItem('utilizadorLogado', JSON.stringify(dados.data));
        
        const cargoBD = dados.data.cargo ? dados.data.cargo.toLowerCase() : '';
        let cargoFinal = tipoUtilizador; 
        
        if (cargoBD.includes('vet')) {
            cargoFinal = 'veterinario';
        } else if (cargoBD.includes('func') || cargoBD.includes('recep')) {
            cargoFinal = 'funcionario';
        } else if (cargoBD.includes('admin')) {
            cargoFinal = 'admin';
        }

        
        localStorage.setItem('tipoUtilizador', cargoFinal);
        
        
        localStorage.setItem('id_sessao', dados.id_sessao); 

        alert("Login efetuado com sucesso!");
  
        if (cargoFinal === 'cliente') {
            window.location.href = '/frontend/Pag/Cliente/dashboard_cliente.html'; 
            
        } else if (cargoFinal === 'veterinario') {
            window.location.href = '/frontend/Pag/Veterinário/dashboard_vet.html'; 
            
        } else if (cargoFinal === 'admin') {
            window.location.href = '/frontend/Pag/Admin/admin_dashboard.html'; 
            
        } else if (cargoFinal === 'funcionario') {
            window.location.href = '/frontend/Pag/Receção/rececionista.html'; 
        }

    } catch (erro) {
        console.error("Erro ao tentar fazer login:", erro);
        alert(erro.message || "Erro de ligação. O servidor está ligado?");
    }
}



 
async function fazerLogout(event) {
    // Coloquei o 'if' para evitar erros caso o botão chame a função sem enviar o event
    if (event) event.preventDefault();

    // Vai buscar a memória da sessão
    const idSessao = localStorage.getItem('id_sessao');
    const dadosUtilizador = JSON.parse(localStorage.getItem('utilizadorLogado'));
    const idColaborador = dadosUtilizador ? dadosUtilizador.id_colaborador : null;

    if (idColaborador && idSessao) {
        try {
            // Avisa a API para carimbar a saída no PostgreSQL
            await fetch('http://localhost:8008/api/logout_colaborador', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_colaborador: idColaborador, 
                    id_sessao: idSessao 
                })
            });
        } catch (erro) {
            console.error("Erro ao fechar sessão no servidor:", erro);
        }
    }

    // Apaga tudo do browser para não haver dados pendurados
    localStorage.clear();

    // Redireciona para a página principal
    window.location.href = '../../Pag_principal.html';
}
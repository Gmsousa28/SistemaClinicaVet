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
    // 1. Evita que a página faça refresh
    event.preventDefault();

    // 2. Apanha os valores do formulário HTML
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const tipoUtilizador = document.getElementById('tipo_utilizador').value;

    try {
        let urlAPI = '';

        // 3. Verifica o tipo de utilizador (AGORA IGUAL AO HTML!)
        if (tipoUtilizador === 'cliente') {
            // Se for cliente, vai à rota dos clientes
            urlAPI = 'http://localhost:8008/api/login_cliente';
            
        } else if (tipoUtilizador === 'veterinario' || tipoUtilizador === 'admin' || tipoUtilizador === 'funcionario') {
            // Se for veterinário OU admin, vai à rota dos colaboradores!
            urlAPI = 'http://localhost:8008/api/login_colaborador'; 
            
        } else {
            // Se a opção for inválida, pára tudo aqui!
            alert("Por favor, seleciona um tipo de conta válido.");
            return; 
        }

        // 4. Envia o email e password para o teu backend
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

        // 5. Se o backend disser que os dados estão errados (ex: 401 ou 500)
        if (!resposta.ok) {
            throw new Error(dados.message || "Email ou password incorretos.");
        }

        // --- SUCESSO! ---
        
        // Grava os dados do login na memória do browser
        localStorage.setItem('utilizadorLogado', JSON.stringify(dados.data));
        localStorage.setItem('tipoUtilizador', tipoUtilizador);

        alert("Login efetuado com sucesso!");

        // 6. REDIRECIONAMENTO PARA AS DASHBOARDS:
        // A barra (/) garante que ele procura na tua pasta 'frontend' principal
        if (tipoUtilizador === 'cliente') {
            window.location.href = '/frontend/Pag/Cliente/dashboard_cliente.html'; 
            
        } else if (tipoUtilizador === 'veterinario') {
            window.location.href = '/frontend/Pag/Veterinário/dashboard_vet.html'; 
            
        } else if (tipoUtilizador === 'admin') {
            // Corrigi o nome para dashboard_admin.html para não dar erro 404!
            window.location.href = '/frontend/Pag/Admin/admin_dashboard.html'; 
        }
        else if (tipoUtilizador === 'funcionario') {
            // Corrigi o nome para dashboard_admin.html para não dar erro 404!
            window.location.href = '/frontend/Pag/Receção/rececionista.html'; 
        }

    } catch (erro) {
        console.error("Erro ao tentar fazer login:", erro);
        // Mostra o popup com o erro exato que veio da base de dados/backend
        alert(erro.message || "Erro de ligação. O servidor está ligado?");
    }
}
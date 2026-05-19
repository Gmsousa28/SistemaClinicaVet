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

    // PROTEÇÃO EXTRA: Limpa o browser logo no início para garantir que não há lixo de sessões anteriores
    localStorage.clear();

    // 2. Apanha os valores do formulário HTML
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const tipoUtilizador = document.getElementById('tipo_utilizador').value;

    try {
        let urlAPI = '';

        // 3. Verifica o tipo de utilizador (apenas para decidir qual a rota a chamar)
        // 3. Verifica o tipo de utilizador para escolher a Rota da API
        if (tipoUtilizador === 'cliente') {
            urlAPI = 'http://localhost:8008/api/login_cliente';
        } else if (tipoUtilizador === 'colaborador') {
            urlAPI = 'http://localhost:8008/api/login_colaborador'; 
        } else {
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
        
        // 👇 --- CORREÇÃO DE SEGURANÇA (Ignora a dropdown e confia na BD) --- 👇
        const cargoBD = dados.data.cargo ? dados.data.cargo.toLowerCase() : '';
        let cargoFinal = tipoUtilizador; // Fallback (usado para clientes que não têm a coluna cargo)
        
        if (cargoBD.includes('vet')) {
            cargoFinal = 'veterinario';
        } else if (cargoBD.includes('func') || cargoBD.includes('recep')) {
            cargoFinal = 'funcionario';
        } else if (cargoBD.includes('admin')) {
            cargoFinal = 'admin';
        }

        // Guardamos o cargo VERDADEIRO na memória para o site se comportar bem
        localStorage.setItem('tipoUtilizador', cargoFinal);
        // 👆 ---------------------------------------------------------------- 👆
        
        // Mantemos a auditoria
        localStorage.setItem('id_sessao', dados.id_sessao); 

        alert("Login efetuado com sucesso!");

        // 6. REDIRECIONAMENTO COM BASE NO CARGO REAL DA BASE DE DADOS:
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

    // 1. Vai buscar a memória da sessão
    const idSessao = localStorage.getItem('id_sessao');
    const dadosUtilizador = JSON.parse(localStorage.getItem('utilizadorLogado'));
    const idColaborador = dadosUtilizador ? dadosUtilizador.id_colaborador : null;

    if (idColaborador && idSessao) {
        try {
            // 2. Avisa a tua API para carimbar a saída no PostgreSQL
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

    // 3. LIMPEZA TOTAL: Apaga tudo do browser para não haver dados pendurados
    localStorage.clear();

    // 4. Redireciona para a página principal
    window.location.href = '../../Pag_principal.html';
}
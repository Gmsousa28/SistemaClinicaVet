const API_BASE = "http://localhost:8008/api";

// =======================================================
// 1. NAVEGAÇÃO ENTRE OS PASSOS DO FORMULÁRIO
// =======================================================

// Função chamada pelo botão "Continuar" do Passo 1
function avancarPasso() {
    const nome = document.getElementById('inputNome').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const pass1 = document.getElementById('inputPassword1').value;
    const pass2 = document.getElementById('inputPassword2').value;

    // Pequena validação antes de deixar o utilizador avançar
    if (!nome || !email || !pass1 || !pass2) {
        alert("⚠️ Por favor, preenche todos os campos do primeiro passo.");
        return;
    }

    if (pass1 !== pass2) {
        alert("❌ As palavras-passe não coincidem. Tenta novamente.");
        return;
    }

    // Esconde o passo 1 e mostra o passo 2
    document.getElementById('passo1').classList.add('d-none');
    document.getElementById('passo2').classList.remove('d-none');
}

// Função chamada pelo botão "Voltar" do Passo 2
function voltarPasso() {
    // Esconde o passo 2 e volta a mostrar o passo 1
    document.getElementById('passo2').classList.add('d-none');
    document.getElementById('passo1').classList.remove('d-none');
}

// =======================================================
// 2. SUBMISSÃO FINAL DO REGISTO PARA O BACKEND
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    const formRegisto = document.getElementById('formRegisto');

    if (formRegisto) {
        formRegisto.addEventListener('submit', async function(evento) {
            evento.preventDefault(); // Impede a página de recarregar

            // Verifica se o cliente aceitou os termos
            const checkTermos = document.getElementById('checkTermos').checked;
            if (!checkTermos) {
                alert("⚠️ Tens de aceitar os termos e condições para criar conta.");
                return;
            }

            // Vai buscar todos os valores das caixas de texto
            const nome = document.getElementById('inputNome').value.trim();
            const email = document.getElementById('inputEmail').value.trim();
            const palavra_passe = document.getElementById('inputPassword1').value;
            const telemovel = document.getElementById('inputTelemovel').value.trim();
            const data_nascimento = document.getElementById('inputDatanasc').value;
            const morada = document.getElementById('inputMorada').value.trim();
            const nif = document.getElementById('inputNIF').value.trim();

            // Monta o pacote de dados para enviar para o PostgreSQL
            const dadosRegisto = {
                nome: nome,
                email: email,
                palavra_passe: palavra_passe,
                contacto: telemovel, 
                data_nascimento: data_nascimento,
                morada: morada,
                nif: nif
            };

            // Muda o texto do botão para dar feedback visual
            const btnSalvar = this.querySelector('button[type="submit"]');
            let textoOriginal = "Concluir Registo";
            if (btnSalvar) {
                textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = 'A registar...';
                btnSalvar.disabled = true;
            }

            try {
                // ATENÇÃO: Confirma se a tua rota de registo de clientes no backend é esta!
                const resposta = await fetch(`${API_BASE}/clientes/registo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosRegisto)
                });

                const resultado = await resposta.json();

                if (resposta.ok || resultado.status === 201 || resultado.status === 200) {
                    alert("🎉 Conta criada com sucesso! Bem-vindo à Clínica Miacãomigo.");
                    
                    // Redireciona o utilizador diretamente para a página de Login
                    window.location.href = '../Logins_Sessões/login.html';
                } else {
                    alert("❌ Ocorreu um erro: " + (resultado.message || "O NIF ou Email já podem estar em uso."));
                }

            } catch (erro) {
                console.error("Erro no registo:", erro);
                alert("❌ Erro de comunicação com o servidor. Verifica se o Backend está ligado.");
            } finally {
                if (btnSalvar) {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            }
        });
    }
});
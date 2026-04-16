/* auth.js - Lógica para Registo e Login da Clínica Miacãomigo */

// Avançar no criar conta (Passo 1 para Passo 2)
function avancarPasso() {
    // Obter os valores dos campos de password
    const pass1 = document.getElementById('inputPassword1').value;
    const pass2 = document.getElementById('inputPassword2').value;

    // Verificar se os campos de password estão vazios
    if (pass1 === "" || pass2 === "") {
        alert("Por favor, preenche a palavra-passe e a confirmação.");
        return; // O 'return' faz com que a função não avance de passo
    }

    // Verificar se as palavras-passe coincidem
    if (pass1 !== pass2) {
        alert("As palavras-passe não coincidem. Tenta novamente!");
        return; 
    }

    // Passa o ecrã para o Passo 2
    document.getElementById('passo1').classList.add('d-none');
    document.getElementById('passo2').classList.remove('d-none');
}

// Função para voltar do Passo 2 para o Passo 1
function voltarPasso() {
    // Esconde o Passo 2
    document.getElementById('passo2').classList.add('d-none');
    // Mostra o Passo 1
    document.getElementById('passo1').classList.remove('d-none');
}
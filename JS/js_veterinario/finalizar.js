// ==========================================
// 1. CONFIGURAÇÃO INICIAL
// ==========================================
let passoAtual = 1;
const totalPassos = 1; // 👉 aqui só tens 1 passo


// ==========================================
// 2. FUNÇÃO VISUAL (mantida para consistência)
// ==========================================
function mostrarPasso(passo) {

    const passosConteudo = document.querySelectorAll('.conteudo-passo');
    passosConteudo.forEach(el => el.style.display = 'none');

    const passoAtivo = document.getElementById('passo-' + passo);
    if (passoAtivo) {
        passoAtivo.style.display = 'block';
    }
}


// ==========================================
// 3. VALIDAÇÃO + SUBMISSÃO
// ==========================================
function validarEFinalizar(evento) {

    const textarea = document.getElementById('relatorio-consulta');

    if (textarea && textarea.value.trim() === '') {
        evento.preventDefault();
        alert('Por favor, preencha o relatório da consulta.');
        textarea.focus();
        return;
    }

    // ⚠️ Cancela envio real (igual ao teu exemplo)
    evento.preventDefault();

    // (Simulação de sucesso)
    alert('Consulta finalizada com sucesso!');

    // 🔁 REDIRECIONAMENTO
    window.location.href = "../Veterinário/dashboard_vet.html";
}


// ==========================================
// 4. ARRANQUE DA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // 4.1 Mostrar passo inicial
    mostrarPasso(passoAtual);

    // 4.2 Ligar submit do formulário
    const formulario = document.querySelector('.formulario-marcacao');

    if (formulario) {
        formulario.addEventListener('submit', validarEFinalizar);
    }

});
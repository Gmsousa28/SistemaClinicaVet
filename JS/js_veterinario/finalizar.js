// =======================================================
// 1. CONFIGURAÇÃO INICIAL E LEITURA DA MOCHILA
// =======================================================
const API_BASE = "http://localhost:8008/api";
let passoAtual = 1;

// Ler os dados da consulta ativa que estão guardados na mochila
const dadosConsulta = JSON.parse(localStorage.getItem('consultaAIniciar'));

// Se o médico tentar entrar aqui sem uma consulta ativa, mandamo-lo de volta
if (!dadosConsulta || !dadosConsulta.id_consulta) {
    alert("Erro: Não foi encontrada nenhuma consulta ativa. A redirecionar para o Dashboard.");
    window.location.href = "../Veterinário/dashboard_vet.html";
}

const idConsultaAtual = dadosConsulta.id_consulta;


// =======================================================
// 2. FUNÇÃO VISUAL (Mantida para consistência)
// =======================================================
function mostrarPasso(passo) {
    const passosConteudo = document.querySelectorAll('.conteudo-passo');
    passosConteudo.forEach(el => el.style.display = 'none');

    const passoAtivo = document.getElementById('passo-' + passo);
    if (passoAtivo) {
        passoAtivo.style.display = 'block';
    }
}


// =======================================================
// 3. SUBMISSÃO REAL PARA A API (PATCH)
// =======================================================
async function validarEFinalizar(evento) {
    // 1. Impede o recarregamento automático da página
    evento.preventDefault();

    const textarea = document.getElementById('relatorio-consulta');

    // 2. Validação local: o relatório não pode ir vazio
    if (textarea && textarea.value.trim() === '') {
        alert('Por favor, preencha o relatório da consulta antes de finalizar.');
        textarea.focus();
        return;
    }

    // 3. Preparar o pacote com os dados exatos que o teu Controller espera
    const dadosParaEnviar = {
        id_consulta: Number(idConsultaAtual),
        relatorio: textarea.value.trim()
    };

    console.log("🚀 A enviar relatório final (PATCH):", dadosParaEnviar);

    try {
        // 4. Chamada PATCH real à tua API
        const resposta = await fetch(`${API_BASE}/consultas/finalizar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaEnviar)
        });

        const resultado = await resposta.json();
        console.log("Resposta do Servidor:", resultado);

        // 5. Tratar o Sucesso
        if (resposta.ok || resultado.status === 200) {
            alert('🎉 Consulta finalizada e relatório guardado com sucesso!');
            
            // Opcional: Se a consulta acabou, podemos limpar a mochila para o próximo atendimento
            localStorage.removeItem('consultaAIniciar');

            // Redirecionamento para o Dashboard do Veterinário
            window.location.href = "../Veterinário/dashboard_vet.html";
        } 
        // 6. Tratar Erros do Servidor
        else {
            alert('Erro ao finalizar consulta: ' + (resultado.message || 'Tente novamente.'));
        }

    } catch (erro) {
        console.error("Erro grave ao ligar ao servidor:", erro);
        alert("Erro ao ligar ao servidor. Verifica se o teu Backend está ligado.");
    }
}


// =======================================================
// 4. ARRANQUE DA PÁGINA
// =======================================================
document.addEventListener("DOMContentLoaded", () => {

    // 4.1 Mostrar passo inicial
    mostrarPasso(passoAtual);

    // 4.2 Ligar submit do formulário (escuta o clique no botão de submit)
    const formulario = document.querySelector('.formulario-marcacao');

    if (formulario) {
        formulario.addEventListener('submit', validarEFinalizar);
    }
});
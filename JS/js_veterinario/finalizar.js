// =======================================================
// 1. CONFIGURAÇÃO INICIAL E LEITURA DA MOCHILA
// =======================================================
const API_BASE = "http://localhost:8008/api";
let passoAtual = 1;

// Ler os dados da consulta ativa guardados no localStorage
const dadosConsulta = JSON.parse(localStorage.getItem('consultaAIniciar'));

// Verifica se existe uma consulta ativa
if (!dadosConsulta || !dadosConsulta.id_consulta) {

    alert("Erro: Não foi encontrada nenhuma consulta ativa.");

    window.location.href = "../Veterinário/dashboard_vet.html";
}

// Guardar ID da consulta atual
const idConsultaAtual = dadosConsulta.id_consulta;


// =======================================================
// 2. FUNÇÃO VISUAL
// =======================================================
function mostrarPasso(passo) {

    const passosConteudo = document.querySelectorAll('.conteudo-passo');

    passosConteudo.forEach(el => {
        el.style.display = 'none';
    });

    const passoAtivo = document.getElementById('passo-' + passo);

    if (passoAtivo) {
        passoAtivo.style.display = 'block';
    }
}


// =======================================================
// 3. FINALIZAR CONSULTA (PATCH)
// =======================================================
async function validarEFinalizar(evento) {

    // Impede refresh automático do formulário
    evento.preventDefault();

    // Buscar textarea do diagnóstico
    const textarea = document.getElementById('relatorio-consulta');

    // Verificar se existe
    if (!textarea) {

        alert("Erro: textarea do diagnóstico não encontrada.");
        return;
    }

    // Buscar texto do diagnóstico
    const diagnostico = textarea.value.trim();

    // Validar campo vazio
    if (diagnostico === '') {

        alert('Por favor, preencha o diagnóstico antes de finalizar.');

        textarea.focus();
        return;
    }

    // Dados enviados para o backend
    const dadosParaEnviar = {

        id_consulta: Number(idConsultaAtual),
        diagnostico: diagnostico
    };

    console.log("🚀 Dados enviados:", dadosParaEnviar);

    try {

        // Pedido PATCH
        const resposta = await fetch(`${API_BASE}/consultas/finalizar`, {

            method: 'PATCH',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(dadosParaEnviar)
        });

        // Converter resposta para JSON
        const resultado = await resposta.json();

        console.log("✅ Resposta do servidor:", resultado);

        // Sucesso
        if (resposta.ok || resultado.status === 200) {

            alert('🎉 Consulta finalizada com sucesso!');

            // Limpar consulta ativa
            localStorage.removeItem('consultaAIniciar');

            // Redirecionar
            window.location.href = "../Veterinário/dashboard_vet.html";
        }

        // Erro vindo do backend
        else {

            alert(
                'Erro ao finalizar consulta: ' +
                (resultado.message || 'Tente novamente.')
            );
        }

    } catch (erro) {

        console.error("❌ Erro ao ligar ao servidor:", erro);

        alert(
            "Erro ao ligar ao servidor. Verifica se o backend está ligado."
        );
    }
}


// =======================================================
// 4. ARRANQUE DA PÁGINA
// =======================================================
document.addEventListener("DOMContentLoaded", () => {

    // Mostrar primeiro passo
    mostrarPasso(passoAtual);

    // Buscar formulário
    const formulario = document.querySelector('.formulario-marcacao');

    // Validar existência
    if (formulario) {

        // Evento submit
        formulario.addEventListener('submit', validarEFinalizar);

    } else {

        console.error("❌ Formulário não encontrado.");
    }
});
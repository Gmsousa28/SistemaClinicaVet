// --- 1. CONFIGURAÇÃO INICIAL ---
let passoAtual = 1;
const totalPassos = 3;

// --- 2. FUNÇÃO PRINCIPAL VISUAL (Atualiza o ecrã) ---
function mostrarPasso(passo) {
    // Esconde todos os conteúdos primeiro
    const passosConteudo = document.querySelectorAll('.conteudo-passo');
    passosConteudo.forEach(el => el.style.display = 'none');
    
    // Mostra apenas o conteúdo do passo atual
    const passoAtivo = document.getElementById('passo-' + passo);
    if (passoAtivo) {
        passoAtivo.style.display = 'block';
    }

    // Atualiza a barra de progresso no topo
    const indicadores = document.querySelectorAll('.barra-passos .passo');
    indicadores.forEach((indicador, index) => {
        if (index < passo) {
            indicador.classList.add('ativo');
        } else {
            indicador.classList.remove('ativo');
        }
    });

    // Controla os botões (Recuar, Seguinte, Confirmar)
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnConfirmar = document.getElementById('btn-confirmar');

    if (passo === 1) {
        btnVoltar.style.display = 'none';
        btnAvancar.style.display = 'inline-block';
        btnConfirmar.style.display = 'none';
    } else if (passo === totalPassos) {
        btnVoltar.style.display = 'inline-block';
        btnAvancar.style.display = 'none';
        btnConfirmar.style.display = 'inline-block';
    } else {
        btnVoltar.style.display = 'inline-block';
        btnAvancar.style.display = 'inline-block';
        btnConfirmar.style.display = 'none';
    }
}

// --- 3. FUNÇÃO DE NAVEGAÇÃO BÁSICA ---
// Chamada pelo botão "Recuar"
function mudarPasso(direcao) {
    passoAtual += direcao;
    mostrarPasso(passoAtual);
}

// --- 4. VALIDAÇÃO ANTES DE AVANÇAR ---
// Chamada pelo botão "Seguinte"
function validarEAvancar() {
    
    // Validação do Passo 1 (NIF)
    if (passoAtual === 1) {
        const inputNIF = document.getElementById('nif_cliente');
        if (inputNIF && inputNIF.value.trim() === '') {
            alert('Por favor, introduza o NIF para identificar o cliente.');
            inputNIF.focus();
            return; // Para a execução e não avança
        }
    }

    // Validação do Passo 2 (Medicamentos)
    if (passoAtual === 2) {
        const caixaMedicamentos = document.getElementById('texto-medicamentos');
        if (caixaMedicamentos && caixaMedicamentos.value.trim() === '') {
            alert('Por favor, indique os medicamentos pretendidos antes de avançar.');
            caixaMedicamentos.focus();
            return; // Para a execução e não avança
        }
    }

    // Se passou em todas as validações, avança para a página seguinte
    mudarPasso(1);
}

// --- 5. VALIDAÇÃO FINAL ANTES DE SUBMETER O FORMULÁRIO ---
// Protege o botão "Confirmar Registo" no Passo 3
document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.querySelector('.formulario-marcacao');
    
    if (formulario) {
        formulario.addEventListener('submit', function(evento) {
            const caixaDosagem = document.getElementById('texto-dosagem');
            
            // Se a caixa da dosagem estiver vazia, impede o envio do formulário
            if (caixaDosagem && caixaDosagem.value.trim() === '') {
                evento.preventDefault(); // Cancela o submit
                alert('Por favor, indique a dosagem antes de confirmar o registo.');
                caixaDosagem.focus();
            }
        });
    }
});

// --- 6. FUNÇÕES DA JANELA MODAL (Histórico) ---
function abrirModalHistoricoMarcacoes() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) {
        modal.style.display = 'flex'; // Usamos flex porque no seu HTML tem 'align-items: center'
    }
}

function fecharModalHistoricoMarcacoes() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- 7. ARRANQUE DA PÁGINA ---
// Assim que a página carrega, garante que começa no Passo 1
document.addEventListener("DOMContentLoaded", function() {
    mostrarPasso(passoAtual);
});
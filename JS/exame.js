// --- 1. CONFIGURAÇÃO INICIAL (Apenas 2 Passos) ---
let passoAtual = 1;
const totalPassos = 2;

// --- 2. FUNÇÃO PRINCIPAL VISUAL (Atualiza o ecrã) ---
function mostrarPasso(passo) {
    // 1. Esconde todos os blocos de conteúdo
    const passosConteudo = document.querySelectorAll('.conteudo-passo');
    passosConteudo.forEach(el => el.style.display = 'none');
    
    // 2. Mostra apenas o bloco do passo atual
    const passoAtivo = document.getElementById('passo-' + passo);
    if (passoAtivo) {
        passoAtivo.style.display = 'block';
    }

    // 3. Atualiza a barra de progresso no topo (bolinhas)
    const indicadores = document.querySelectorAll('.barra-passos .passo');
    indicadores.forEach((indicador, index) => {
        if (index < passo) {
            indicador.classList.add('ativo');
        } else {
            indicador.classList.remove('ativo');
        }
    });

    // 4. Controla a visibilidade dos botões
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnConfirmar = document.getElementById('btn-confirmar');

    if (passo === 1) {
        btnVoltar.style.display = 'none';
        btnAvancar.style.display = 'inline-block';
        btnConfirmar.style.display = 'none';
    } else if (passo === totalPassos) { // Passo 2
        btnVoltar.style.display = 'inline-block';
        btnAvancar.style.display = 'none';
        btnConfirmar.style.display = 'inline-block';
    }
}

// --- 3. FUNÇÃO DE NAVEGAÇÃO (Botão Recuar) ---
function mudarPasso(direcao) {
    passoAtual += direcao;
    mostrarPasso(passoAtual);
}

// --- 4. VALIDAÇÃO PARA AVANÇAR (Botão Seguinte) ---
function validarEAvancar() {
    
    // Validação do Passo 1 (NIF)
    if (passoAtual === 1) {
        const inputNIF = document.getElementById('nif_cliente');
        if (inputNIF && inputNIF.value.trim() === '') {
            alert('Por favor, introduza o NIF para identificar o cliente.');
            inputNIF.focus();
            return; // Impede o avanço
        }
    }

    // Se estiver tudo bem, avança para o passo 2
    mudarPasso(1);
}

// --- 5. VALIDAÇÃO FINAL ANTES DE CONFIRMAR O EXAME ---
document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.querySelector('.formulario-marcacao');
    
    if (formulario) {
        formulario.addEventListener('submit', function(evento) {
            // Impede a página de recarregar
            evento.preventDefault(); 

            // Procura todos os checkboxes de exames que estejam selecionados
            const examesSelecionados = document.querySelectorAll('input[name="servico"]:checked');
            
            // Se nenhum exame estiver selecionado (tamanho da lista = 0)
            if (examesSelecionados.length === 0) {
                alert('Por favor, selecione pelo menos um exame antes de confirmar.');
                return;
            }

            // Se passou na validação, mostra sucesso e redireciona
            alert('Exame(s) registado(s) com sucesso!');
            window.location.href = "../Veterinário/dashboard_vet.html"; 
        });
    }
});

// --- 6. FUNÇÕES DA JANELA MODAL (Histórico) ---
function abrirModalHistoricoMarcacoes() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) {
        modal.style.display = 'flex'; 
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
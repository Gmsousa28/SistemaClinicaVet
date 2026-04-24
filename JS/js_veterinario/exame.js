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
        if (btnVoltar) btnVoltar.style.display = 'none';
        if (btnAvancar) btnAvancar.style.display = 'inline-block';
        if (btnConfirmar) btnConfirmar.style.display = 'none';
    } else if (passo === totalPassos) { // Passo 2
        if (btnVoltar) btnVoltar.style.display = 'inline-block';
        if (btnAvancar) btnAvancar.style.display = 'none';
        if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
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

// --- 5. FUNÇÕES DA JANELA MODAL (Histórico) ---
function abrirModalHistoricoMarcacoes() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) modal.style.display = 'flex'; 
}

function fecharModalHistoricoMarcacoes() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) modal.style.display = 'none';
}


// --- 6. ARRANQUE DA PÁGINA E LIGAÇÕES DE EVENTOS ---
// Juntámos todos os "DOMContentLoaded" num só para o código ser rápido e profissional!
document.addEventListener("DOMContentLoaded", () => {
    
    // 6.1. Garante que começa visualmente no Passo 1
    mostrarPasso(passoAtual);

    // 6.2. Ligar o botão "Recuar"
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            mudarPasso(-1);
        });
    }

    // 6.3. Ligar o botão "Seguinte"
    const btnAvancar = document.getElementById('btn-avancar');
    if (btnAvancar) {
        btnAvancar.addEventListener('click', validarEAvancar);
    }

    // 6.4. Validação Final antes de Confirmar o Exame (Botão Submit)
    const formulario = document.querySelector('.formulario-marcacao');
    if (formulario) {
        formulario.addEventListener('submit', (evento) => {
            
            // Procura todos os checkboxes de exames que estejam selecionados
            const examesSelecionados = document.querySelectorAll('input[name="servico"]:checked');
            
            // Se nenhum exame estiver selecionado, bloqueia o envio
            if (examesSelecionados.length === 0) {
                evento.preventDefault(); // Impede o formulário de ser enviado e a página de recarregar
                alert('Por favor, selecione pelo menos um exame antes de confirmar.');
                return;
            }

            // (Simulação) Se houver exames selecionados, impede o envio real para dar o alerta e redirecionar
            evento.preventDefault(); 
            alert('Exame(s) registado(s) com sucesso!');
            window.location.href = "/JS/Veterinário/momento_consulta.html"; 
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    
    // =======================================================
    // PASSO 1: PROCURAR NIF E SELECIONAR ANIMAL
    // =======================================================
    const inputNif = document.getElementById('nif_cliente');
    const containerAnimais = document.querySelector('.grid-animais-selecao');

    // VERIFICAÇÃO DE SEGURANÇA: Só executa se estivermos na página de Marcações!
    if (inputNif && containerAnimais) {
        
        // Base de Dados Simulada de Clientes (Pronto para substituir por API Fetch)
        const clientesTeste = {
            "123456789": {
                nome: "João Silva",
                animais: [
                    { id: 1, nome: "Max", tipo: "cao", especie: "Cão" },
                    { id: 2, nome: "Luna", tipo: "gato", especie: "Gato" }
                ]
            },
            "987654321": {
                nome: "Ana Costa",
                animais: [
                    { id: 3, nome: "Pipo", tipo: "outro", especie: "Papagaio" }
                ]
            }
        };

        inputNif.addEventListener('input', function() {
            const nifDigitado = this.value;
            
            if(nifDigitado.length === 9) {
                const cliente = clientesTeste[nifDigitado];
                
                if(cliente) {
                    this.style.borderColor = "#2ea89c";
                    this.style.backgroundColor = "#e0f2f1";
                    containerAnimais.innerHTML = ''; 
                    
                    cliente.animais.forEach(animal => {
                        let icone = animal.tipo === 'cao' ? 'fa-dog' : (animal.tipo === 'gato' ? 'fa-cat' : 'fa-paw');
                        const cartaoHTML = `
                            <label class="cartao-animal-radio">
                                <input type="radio" name="id_animal" value="${animal.id}" class="esconder-radio" required>
                                <div class="conteudo-cartao-animal">
                                    <div class="avatar-animal ${animal.tipo}"><i class="fa ${icone}"></i></div>
                                    <div class="info-animal">
                                        <strong>${animal.nome}</strong>
                                        <span>${animal.especie}</span>
                                    </div>
                                </div>
                            </label>
                        `;
                        containerAnimais.innerHTML += cartaoHTML;
                    });
                } else {
                    this.style.borderColor = "#e74c3c";
                    this.style.backgroundColor = "#fadbd8";
                    containerAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center; margin-top: 1rem;">Cliente não encontrado. Verifique o NIF.</p>';
                }
            } else if (nifDigitado.length === 0) {
                this.style.borderColor = "#ccc";
                this.style.backgroundColor = "#fff";
                containerAnimais.innerHTML = '<p style="color: #7f8c8d; width: 100%; text-align: center; font-style: italic;">Introduza um NIF válido em cima para procurar os animais do cliente.</p>';
            }
        });
    }

     
});

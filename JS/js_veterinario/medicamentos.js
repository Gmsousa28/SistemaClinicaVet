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

// --- 5. ARRANQUE DA PÁGINA E LIGAÇÕES DOS BOTÕES ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 5.1. Garante que a página começa visualmente no Passo 1
    mostrarPasso(passoAtual);

    // 5.2. Ligar o botão "Recuar"
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            mudarPasso(-1);
        });
    }

    // 5.3. Ligar o botão "Seguinte"
    const btnAvancar = document.getElementById('btn-avancar');
    if (btnAvancar) {
        btnAvancar.addEventListener('click', validarEAvancar);
    }

    // 5.4. Protege o botão "Confirmar Registo" no Passo 3
    const formulario = document.querySelector('.formulario-marcacao');
    if (formulario) {
        formulario.addEventListener('submit', (evento) => {
            const caixaDosagem = document.getElementById('texto-dosagem');
            
            // Se a caixa da dosagem estiver vazia, impede o envio do formulário
            if (caixaDosagem && caixaDosagem.value.trim() === '') {
                evento.preventDefault(); // Cancela o submit
                alert('Por favor, indique a dosagem antes de confirmar o registo.');
                caixaDosagem.focus();
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


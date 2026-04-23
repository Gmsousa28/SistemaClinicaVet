// =======================================================
// LÓGICA DA PÁGINA DE MARCAÇÕES (Recepção)
// =======================================================

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

    // =======================================================
    // PASSO 2: PREPARAÇÃO PARA BASE DE DADOS - VETERINÁRIOS
    // =======================================================
    // (Pronto para substituir por API Fetch)
    const veterinariosTeste = [
        { id: "qualquer", nome: "Qualquer Médico", especialidade: "Disponível mais cedo", icone: "fa-user-md" },
        { id: 1, nome: "Dr. Rui Silva", especialidade: "Cirurgia Geral", icone: "fa-user-doctor" },
        { id: 2, nome: "Dra. Ana Costa", especialidade: "Animais Exóticos", icone: "fa-user-nurse" }
    ];

    const containerVets = document.getElementById('container-vets');
    
    // Verifica se a grelha existe na página e desenha os médicos
    if (containerVets) {
        veterinariosTeste.forEach((vet, index) => {
            const checked = index === 0 ? "checked" : "";
            const corFundo = index === 0 ? '#f1f2f6' : '#e3f2fd';
            const corIcone = index === 0 ? '#7f8c8d' : '#3498db';

            const vetHTML = `
                <label class="cartao-opcao-radio">
                    <input type="radio" name="id_veterinario" value="${vet.id}" class="esconder-radio" ${checked}>
                    <div class="conteudo-cartao-opcao">
                        <div class="avatar-medico" style="background-color: ${corFundo}; color: ${corIcone};">
                            <i class="fa ${vet.icone}"></i>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span>${vet.nome}</span>
                            <small style="color: #7f8c8d; font-weight: normal; font-size: 0.8rem; margin-top: 3px;">${vet.especialidade}</small>
                        </div>
                    </div>
                </label>
            `;
            containerVets.innerHTML += vetHTML;
        });
    }

    // =======================================================
    // PASSO 2.1: LÓGICA DE VISIBILIDADE DOS VETERINÁRIOS
    // =======================================================
    const checkboxesServico = document.querySelectorAll('input[name="servico"]');
    const seccaoVeterinario = document.getElementById('seccao-veterinario');
    const checkboxConsulta = document.getElementById('check-consulta');

    if (checkboxesServico.length > 0 && seccaoVeterinario && checkboxConsulta) {
        
        function validarVisibilidadeVeterinarios() {
            if (checkboxConsulta.checked) {
                seccaoVeterinario.style.display = 'block';
                seccaoVeterinario.style.animation = "zoom 0.3s ease-out"; 
            } else {
                seccaoVeterinario.style.display = 'none';
                
                // Limpeza para a API: Desmarca os médicos se a consulta não estiver selecionada
                const radiosMedicos = document.querySelectorAll('input[name="id_veterinario"]');
                radiosMedicos.forEach(radio => radio.checked = false);
            }
        }

        checkboxesServico.forEach(checkbox => {
            checkbox.addEventListener('change', validarVisibilidadeVeterinarios);
        });

        validarVisibilidadeVeterinarios(); // Corre uma vez na inicialização
    }

    // =======================================================
    // PASSO 3: LÓGICA DA DATA E HORA (BLOCOS DINÂMICOS 30 MIN)
    // =======================================================
    const inputDataVisual = document.getElementById('data_marcacao_visual');
    const containerSlots = document.getElementById('container-slots-hora');
    const inputDataReal = document.getElementById('data_marcacao_real');
    const inputHoraReal = document.getElementById('hora_marcacao_real');

    if (inputDataVisual && containerSlots) {
        
        // 1. Bloquear dias no passado
        const hoje = new Date().toISOString().split('T')[0];
        inputDataVisual.setAttribute('min', hoje);

        // 2. O GATILHO! Quando escolhe uma data no calendário:
        inputDataVisual.addEventListener('change', function() {
            const dataSelecionada = this.value;
            inputDataReal.value = dataSelecionada; 

            if (dataSelecionada) {
                gerarSlotsTempo(); // Desenha as horas!
            } else {
                containerSlots.innerHTML = '<p class="mensagem-espera-data">Por favor, selecione primeiro um dia para ver os horários disponíveis.</p>';
                inputHoraReal.value = '';
            }
        });

        // 3. A Função que desenha e pinta as caixinhas
        function gerarSlotsTempo() {
            containerSlots.innerHTML = ''; 
            inputHoraReal.value = ''; 

            const horaAbertura = 9; // 09:00
            const horaFecho = 18;   // 18:00

            let indexBloco = 0; // Ordem dos botões (0, 1, 2...)

            for (let h = horaAbertura; h < horaFecho; h++) {
                ['00', '30'].forEach(minuto => {
                    const horaFormatada = h.toString().padStart(2, '0') + ':' + minuto;
                    
                    const slot = document.createElement('div');
                    slot.className = 'slot-hora';
                    slot.innerText = horaFormatada;
                    slot.dataset.index = indexBloco; 
                    
                    // O QUE ACONTECE QUANDO CLICAS NA HORA:
                    slot.addEventListener('click', function() {
                        
                        // 1. Apanhar todas as checkboxes com "visto" no Passo 2
                        const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
                        
                        if (servicosEscolhidos.length === 0) {
                            alert("Por favor, volte ao Passo 2 e escolha pelo menos um Serviço!");
                            return;
                        }

                        // 2. Cada serviço = 1 bloco de 30 min.
                        const blocosNecessarios = servicosEscolhidos.length;
                        const meuIndex = parseInt(this.dataset.index);

                        // 3. Dá tempo de fazer tudo antes da clínica fechar?
                        const totalBlocosPorDia = (horaFecho - horaAbertura) * 2;
                        if (meuIndex + blocosNecessarios > totalBlocosPorDia) {
                            alert(`Ups! Escolheu ${blocosNecessarios} serviços, mas a clínica vai fechar antes de terminarmos!`);
                            return;
                        }

                        // 4. Pintar os botões
                        const todosSlots = document.querySelectorAll('.slot-hora');
                        
                        // Limpa verdes anteriores
                        todosSlots.forEach(el => el.classList.remove('selecionado'));
                        
                        // Pinta este e os seguintes necessários
                        for (let i = 0; i < blocosNecessarios; i++) {
                            if(todosSlots[meuIndex + i]) {
                                todosSlots[meuIndex + i].classList.add('selecionado');
                            }
                        }
                        
                        // 5. Guarda a hora para o Formulário enviar para a BD
                        inputHoraReal.value = horaFormatada; 
                    });

                    containerSlots.appendChild(slot);
                    indexBloco++;
                });
            }
        }
    }
});


// =======================================================
// LÓGICA DE NAVEGAÇÃO DOS PASSOS (Avançar e Recuar)
// =======================================================

// Variável global para saber em que passo estamos
let passoAtual = 1;

// Usamos window.mudarPasso para que o HTML consiga chamar esta função nos botões
window.mudarPasso = function(direcao) {
    // Validação de Segurança Básica ao Avançar
    if (direcao === 1) {
        if (passoAtual === 1) {
            // Verifica se escolheu animal
            const animalEscolhido = document.querySelector('input[name="id_animal"]:checked');
            if (!animalEscolhido) {
                alert("Por favor, introduza o NIF e selecione um animal antes de avançar.");
                return;
            }
        }
        if (passoAtual === 2) {
            // Verifica se escolheu pelo menos um serviço
            const servicoEscolhido = document.querySelectorAll('input[name="servico"]:checked');
            if (servicoEscolhido.length === 0) {
                alert("Por favor, selecione pelo menos um serviço.");
                return;
            }
        }
    }

    // Esconde o passo antigo
    const passoAntigo = document.getElementById(`passo-${passoAtual}`);
    if (passoAntigo) passoAntigo.style.display = 'none';
    
    // Tira a cor da bolinha antiga
    const bolinhas = document.querySelectorAll('.passo');
    if (bolinhas.length > 0) bolinhas[passoAtual-1].classList.remove('ativo');
    
    // Atualiza o passo
    passoAtual += direcao;
    
    // Mostra o passo novo
    const passoNovo = document.getElementById(`passo-${passoAtual}`);
    if (passoNovo) passoNovo.style.display = 'block';
    
    // Pinta a bolinha nova
    if (bolinhas.length > 0) bolinhas[passoAtual-1].classList.add('ativo');

    // Mostra ou esconde os botões da barra inferior
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnConfirmar = document.getElementById('btn-confirmar');

    if (btnVoltar) btnVoltar.style.display = passoAtual === 1 ? 'none' : 'block';
    if (btnAvancar) btnAvancar.style.display = passoAtual === 3 ? 'none' : 'block';
    if (btnConfirmar) btnConfirmar.style.display = passoAtual === 3 ? 'block' : 'none';
};


// =======================================================
// LÓGICA DO HISTÓRICO DE MARCAÇÕES (MODAL E API)
// =======================================================

window.abrirModalHistoricoMarcacoes = function() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloqueia scroll traseiro
        
        // Assim que o modal abre, chama a API para carregar os dados
        carregarHistoricoAPI(); 
    }
};

window.fecharModalHistoricoMarcacoes = function() {
    const modal = document.getElementById('modal-historico-marcacoes');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Devolve o scroll traseiro
    }
};

// --- SIMULADOR DE API NODE.JS / SQL ---
function carregarHistoricoAPI() {
    const tbody = document.getElementById('tabela-marcacoes-body');
    
    // 1. Mostra a mensagem de loading enquanto o servidor não responde
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;"><i class="fa fa-spinner fa-spin"></i> A carregar dados da Base de Dados...</td></tr>';

    // 2. Simula o tempo de resposta da internet (0.8 segundos)
    setTimeout(() => {
        
        // No futuro, isto será: const resposta = await fetch('/api/marcacoes'); const dadosDaBD = await resposta.json();
        const dadosDaBD = [
            { data: "Hoje, 10:30", cliente: "João Silva", nif: "123456789", animal: "Max (Cão)", servico: "Vacinação", estado: "Concluído", corEstado: "#2ea89c" },
            { data: "Ontem, 15:00", cliente: "Ana Costa", nif: "987654321", animal: "Luna (Gato)", servico: "Consulta Geral", estado: "Faltou", corEstado: "#e74c3c" },
            { data: "12/04/2026", cliente: "Carlos Mendes", nif: "222333444", animal: "Bolinha (Cão)", servico: "Desparasitação", estado: "Concluído", corEstado: "#2ea89c" }
        ];

        // Limpa a tabela
        tbody.innerHTML = ''; 

        // 3. O JavaScript desenha as linhas do HTML com base nos dados do servidor
        dadosDaBD.forEach(marcacao => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">
                    <td style="padding: 15px; color: #7f8c8d; font-weight: bold;">${marcacao.data}</td>
                    <td style="padding: 15px;"><strong>${marcacao.cliente}</strong><br><span style="font-size: 0.8rem; color: #95a5a6;">NIF: ${marcacao.nif}</span></td>
                    <td style="padding: 15px; color: #2c3e50;">${marcacao.animal}</td>
                    <td style="padding: 15px; color: #2c3e50;">${marcacao.servico}</td>
                    <td style="padding: 15px;">
                        <span style="background-color: ${marcacao.corEstado}15; color: ${marcacao.corEstado}; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
                            <i class="fa fa-circle" style="font-size: 0.5rem; margin-right: 5px; vertical-align: middle;"></i> ${marcacao.estado}
                        </span>
                    </td>
                </tr>
            `;
        });
    }, 800); 
}
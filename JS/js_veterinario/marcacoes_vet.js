// =======================================================
// LÓGICA DA PÁGINA DE MARCAÇÕES (Recepção) - Clínica Miacãomigo
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuração da API
    const API_BASE = "http://localhost:8008/api";

    // =======================================================
    // PASSO 1: PROCURAR ANIMAIS POR NIF (COM FILTRO DE ÓBITO)
    // =======================================================
    const inputNif = document.getElementById('nif_cliente');
    const containerAnimais = document.querySelector('.grid-animais-selecao');

    if (inputNif && containerAnimais) {
        inputNif.addEventListener('input', async function() {
            const nifDigitado = this.value;
            
            if(nifDigitado.length === 9) {
                try {
                    const resposta = await fetch(`${API_BASE}/animais/nif/${nifDigitado}`);
                    const resultado = await resposta.json();

                    if(resultado.status === 200 && resultado.data.length > 0) {
                        
                        // 🛡️ O NOSSO NOVO FILTRO: Apenas animais vivos
                        const animaisVivos = resultado.data.filter(animal => animal.estado !== 'Morto');

                        if (animaisVivos.length > 0) {
                            this.style.borderColor = "#2ea89c";
                            this.style.backgroundColor = "#e0f2f1";
                            renderizarAnimaisDaBD(animaisVivos);
                        } else {
                            this.style.borderColor = "#f39c12"; 
                            this.style.backgroundColor = "#fef5e7";
                            containerAnimais.innerHTML = '<p style="color: #e67e22; width: 100%; text-align: center; margin-top: 1rem;"><i class="fa fa-info-circle"></i> O cliente foi encontrado, mas não existem animais vivos elegíveis para marcação.</p>';
                        }
                    } else {
                        this.style.borderColor = "#e74c3c";
                        this.style.backgroundColor = "#fadbd8";
                        containerAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center; margin-top: 1rem;">Nenhum cliente/animal encontrado para este NIF.</p>';
                    }
                } catch (erro) {
                    console.error("Erro ao ligar ao servidor:", erro);
                }
            } else if (nifDigitado.length === 0) {
                this.style.borderColor = "#ccc";
                this.style.backgroundColor = "#fff";
                containerAnimais.innerHTML = '<p style="color: #7f8c8d; width: 100%; text-align: center; font-style: italic;">Introduza um NIF válido em cima para procurar os animais do cliente.</p>';
            }
        });
    }

    function renderizarAnimaisDaBD(animais) {
        containerAnimais.innerHTML = ''; 
        animais.forEach(animal => {
            let especie = animal.especie.toLowerCase();
            let icone = especie.includes('cão') || especie.includes('cao') ? 'fa-dog' : (especie.includes('gato') ? 'fa-cat' : 'fa-paw');
            
            const cartaoHTML = `
                <label class="cartao-animal-radio">
                    <input type="radio" name="id_animal" value="${animal.id_animal}" class="esconder-radio" required>
                    <div class="conteudo-cartao-animal">
                        <div class="avatar-animal"><i class="fa ${icone}"></i></div>
                        <div class="info-animal">
                            <strong>${animal.nome}</strong>
                            <span>${animal.raca}</span>
                        </div>
                    </div>
                </label>
            `;
            containerAnimais.innerHTML += cartaoHTML;
        });
    }

    // =======================================================
    // PASSO 2: CARREGAR VETERINÁRIOS REAIS
    // =======================================================
    const containerVets = document.getElementById('container-vets');
    if (containerVets) {
        carregarVeterinariosAPI();
    }

    async function carregarVeterinariosAPI() {
        try {
            const resposta = await fetch(`${API_BASE}/veterinarios`);
            const resultado = await resposta.json();

            if (resultado.status === 200) {
                containerVets.innerHTML = `
                    <label class="cartao-opcao-radio">
                        <input type="radio" name="id_veterinario" value="0" class="esconder-radio" checked>
                        <div class="conteudo-cartao-opcao">
                            <div class="avatar-medico" style="background-color: #f1f2f6; color: #7f8c8d;"><i class="fa fa-user-md"></i></div>
                            <div style="display: flex; flex-direction: column;">
                                <span>Qualquer Médico</span>
                                <small style="color: #7f8c8d; font-size: 0.8rem;">Aleatório / Disponível</small>
                            </div>
                        </div>
                    </label>
                `;

                resultado.data.forEach(vet => {
                    const vetHTML = `
                        <label class="cartao-opcao-radio">
                            <input type="radio" name="id_veterinario" value="${vet.id_veterinario}" class="esconder-radio">
                            <div class="conteudo-cartao-opcao">
                                <div class="avatar-medico" style="background-color: #e3f2fd; color: #3498db;"><i class="fa fa-user-doctor"></i></div>
                                <div style="display: flex; flex-direction: column;">
                                    <span>${vet.nome}</span>
                                    <small style="color: #7f8c8d; font-size: 0.8rem;">${vet.especialidade || 'Clínica Geral'}</small>
                                </div>
                            </div>
                        </label>
                    `;
                    containerVets.innerHTML += vetHTML;
                });
            }
        } catch (erro) { console.error("Erro ao carregar veterinários:", erro); }
    }

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
                document.querySelectorAll('input[name="id_veterinario"]').forEach(r => r.checked = false);
            }
        }
        checkboxesServico.forEach(cb => cb.addEventListener('change', validarVisibilidadeVeterinarios));
    }

    // =======================================================
    // PASSO 3: DATA E HORA
    // =======================================================
    const inputDataVisual = document.getElementById('data_marcacao_visual');
    const containerSlots = document.getElementById('container-slots-hora');
    const inputDataReal = document.getElementById('data_marcacao_real');
    const inputHoraReal = document.getElementById('hora_marcacao_real');

    if (inputDataVisual && containerSlots) {
        const hoje = new Date().toISOString().split('T')[0];
        inputDataVisual.setAttribute('min', hoje);

        inputDataVisual.addEventListener('change', function() {
            inputDataReal.value = this.value; 
            if (this.value) gerarSlotsTempo();
            else containerSlots.innerHTML = '<p class="mensagem-espera-data">Selecione primeiro um dia.</p>';
        });

        function gerarSlotsTempo() {
            containerSlots.innerHTML = ''; 
            inputHoraReal.value = ''; 
            let indexBloco = 0;

            for (let h = 9; h < 18; h++) {
                ['00', '30'].forEach(minuto => {
                    const horaFormatada = h.toString().padStart(2, '0') + ':' + minuto;
                    const slot = document.createElement('div');
                    slot.className = 'slot-hora';
                    slot.innerText = horaFormatada;
                    slot.dataset.index = indexBloco; 
                    
                    slot.addEventListener('click', function() {
                        const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
                        if (servicosEscolhidos.length === 0) { alert("Escolha primeiro os serviços no Passo 2!"); return; }

                        const blocosNecessarios = servicosEscolhidos.length;
                        const meuIndex = parseInt(this.dataset.index);

                        if (meuIndex + blocosNecessarios > 18) { 
                            alert("Não há tempo suficiente antes do fecho da clínica."); return;
                        }

                        document.querySelectorAll('.slot-hora').forEach(el => el.classList.remove('selecionado'));
                        const todosSlots = document.querySelectorAll('.slot-hora');
                        for (let i = 0; i < blocosNecessarios; i++) {
                            if(todosSlots[meuIndex + i]) todosSlots[meuIndex + i].classList.add('selecionado');
                        }
                        inputHoraReal.value = horaFormatada; 
                    });
                    containerSlots.appendChild(slot);
                    indexBloco++;
                });
            }
        }
    }

    // =======================================================
    // PASSO 4: GRAVAR A MARCAÇÃO
    // =======================================================
    const formMarcacao = document.querySelector('.formulario-marcacao');
    
    if (formMarcacao) {
        formMarcacao.addEventListener('submit', async function(evento) {
            evento.preventDefault(); 

            const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servico"]:checked'))
                                              .map(cb => cb.value)
                                              .join(', ');

            // Envia o Médico Escolhido ou "0" para o Backend tratar
            let vetEscolhido = document.querySelector('input[name="id_veterinario"]:checked')?.value;
            if (!vetEscolhido || vetEscolhido === "0") {
                vetEscolhido = 0; 
            }

            const dataEscolhida = document.getElementById('data_marcacao_real').value;
            const horaEscolhida = document.getElementById('hora_marcacao_real').value;
            const dataHoraConsulta = `${dataEscolhida} ${horaEscolhida}:00`; 

            const dadosParaEnviar = {
                id_animal: document.querySelector('input[name="id_animal"]:checked').value,
                id_veterinario: vetEscolhido, 
                data_consulta: dataHoraConsulta,
                motivo: servicosSelecionados 
            };

            try {
                const resposta = await fetch(`${API_BASE}/consultas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosParaEnviar)
                });

                const resultado = await resposta.json();

                if (resultado.status === 201) {
                    alert('🎉 Marcação confirmada com sucesso!');
                    window.location.reload(); 
                } else {
                    alert('Erro ao gravar: ' + resultado.message);
                }
            } catch (erro) {
                console.error("Erro grave:", erro);
                alert("Erro ao ligar ao servidor.");
            }
        });
    }
});

let passoAtual = 1;
window.mudarPasso = function(direcao) {
    if (direcao === 1) {
        if (passoAtual === 1 && !document.querySelector('input[name="id_animal"]:checked')) {
            alert("Introduza o NIF e selecione um animal."); return;
        }
        if (passoAtual === 2 && document.querySelectorAll('input[name="servico"]:checked').length === 0) {
            alert("Selecione pelo menos um serviço."); return;
        }
    }

    document.getElementById(`passo-${passoAtual}`).style.display = 'none';
    const bolinhas = document.querySelectorAll('.passo');
    bolinhas[passoAtual-1].classList.remove('ativo');
    
    passoAtual += direcao;
    
    document.getElementById(`passo-${passoAtual}`).style.display = 'block';
    bolinhas[passoAtual-1].classList.add('ativo');

    document.getElementById('btn-voltar').style.display = passoAtual === 1 ? 'none' : 'block';
    document.getElementById('btn-avancar').style.display = passoAtual === 3 ? 'none' : 'block';
    document.getElementById('btn-confirmar').style.display = passoAtual === 3 ? 'block' : 'none';
};

window.abrirModalHistoricoMarcacoes = function() {
    document.getElementById('modal-historico-marcacoes').style.display = 'flex';
    carregarHistoricoAPI(); 
};

window.fecharModalHistoricoMarcacoes = function() {
    document.getElementById('modal-historico-marcacoes').style.display = 'none';
};

async function carregarHistoricoAPI() {
    const tbody = document.getElementById('tabela-marcacoes-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fa fa-spinner fa-spin"></i> A carregar da BD...</td></tr>';

    try {
        const resposta = await fetch("http://localhost:8008/api/consultas");
        const resultado = await resposta.json();

        if (resultado.status === 200) {
            tbody.innerHTML = ''; 
            resultado.data.forEach(m => {
                const dataFormatada = new Date(m.data_consulta).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                tbody.innerHTML += `
                    <tr>
                        <td style="padding:15px;"><b>${dataFormatada}</b></td>
                        <td style="padding:15px;"><strong>ID Vet: ${m.id_veterinario || 'N/A'}</strong></td>
                        <td style="padding:15px;">ID Animal: ${m.id_animal || 'N/A'}</td>
                        <td style="padding:15px;">${m.motivo || 'Consulta'}</td>
                        <td style="padding:15px; text-align:center;"><span style="color:#2ea89c; font-weight:bold;">${m.estado}</span></td>
                    </tr>`;
            });
        }
    } catch (erro) { 
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erro ao aceder à BD.</td></tr>'; 
    }
}
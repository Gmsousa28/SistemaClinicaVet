// Apenas UM bloco DOMContentLoaded para arrancar tudo de forma limpa!
document.addEventListener("DOMContentLoaded", () => {
    
    // =======================================================
    // 1. CONFIGURAÇÕES DA NAVEGAÇÃO DE PASSOS
    // =======================================================
    let passoAtual = 1;
    const totalPassos = 3;

    function mostrarPasso(passo) {
        const passosConteudo = document.querySelectorAll('.conteudo-passo');
        passosConteudo.forEach(el => el.style.display = 'none');
        
        const passoAtivo = document.getElementById('passo-' + passo);
        if (passoAtivo) passoAtivo.style.display = 'block';

        const indicadores = document.querySelectorAll('.barra-passos .passo');
        indicadores.forEach((indicador, index) => {
            if (index < passo) indicador.classList.add('ativo');
            else indicador.classList.remove('ativo');
        });

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

    function mudarPasso(direcao) {
        passoAtual += direcao;
        mostrarPasso(passoAtual);
    }

    function validarEAvancar() {
        // Validação do Passo 1 (NIF e Animal)
        if (passoAtual === 1) {
            const inputNIF = document.getElementById('nif_cliente');
            if (inputNIF && inputNIF.value.trim() === '') {
                alert('Por favor, introduza o NIF para identificar o cliente.');
                inputNIF.focus();
                return;
            }
            // Verifica se selecionou o animal (opcional, mas recomendado)
            const animalSelecionado = document.querySelector('input[name="id_animal"]:checked');
            if(!animalSelecionado) {
                alert('Por favor, selecione um animal antes de avançar.');
                return;
            }
        }

        // ✅ CORREÇÃO 2: Validação do Passo 2 (Motivo da Consulta)
        if (passoAtual === 2) {
            const caixaMotivo = document.getElementById('texto-relatorios');
            if (caixaMotivo && caixaMotivo.value.trim() === '') {
                alert('Por favor, indique o motivo da consulta antes de avançar.');
                caixaMotivo.focus();
                return;
            }
        }
        mudarPasso(1);
    }

    // Arranque inicial da navegação
    mostrarPasso(passoAtual);

    // Ligar botões da navegação
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) btnVoltar.addEventListener('click', () => mudarPasso(-1));

    const btnAvancar = document.getElementById('btn-avancar');
    if (btnAvancar) btnAvancar.addEventListener('click', validarEAvancar);

    // ✅ CORREÇÃO 3: Protege a submissão final verificando a HORA (Passo 3)
    const formulario = document.querySelector('.formulario-marcacao');
    if (formulario) {
        formulario.addEventListener('submit', (evento) => {
            const inputHora = document.getElementById('hora_marcacao_real');
            if (inputHora && inputHora.value === '') {
                evento.preventDefault(); 
                alert('Por favor, selecione uma hora para a consulta antes de confirmar.');
            }
        });
    }

    // =======================================================
    // 2. LÓGICA DO PASSO 1: PROCURAR NIF E ANIMAIS
    // =======================================================
    const inputNif = document.getElementById('nif_cliente');
    const containerAnimais = document.querySelector('.grid-animais-selecao');

    if (inputNif && containerAnimais) {
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
                        containerAnimais.innerHTML += `
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
    // 3. LÓGICA DO PASSO 2: VETERINÁRIOS
    // =======================================================
    const veterinariosTeste = [
        { id: "qualquer", nome: "Qualquer Médico", especialidade: "Disponível mais cedo", icone: "fa-user-md" },
        { id: 1, nome: "Dr. Rui Silva", especialidade: "Cirurgia Geral", icone: "fa-user-doctor" },
        { id: 2, nome: "Dra. Ana Costa", especialidade: "Animais Exóticos", icone: "fa-user-nurse" }
    ];

    const containerVets = document.getElementById('container-vets');
    if (containerVets) {
        veterinariosTeste.forEach((vet, index) => {
            const checked = index === 0 ? "checked" : "";
            const corFundo = index === 0 ? '#f1f2f6' : '#e3f2fd';
            const corIcone = index === 0 ? '#7f8c8d' : '#3498db';

            containerVets.innerHTML += `
                <label class="cartao-opcao-radio">
                    <input type="radio" name="id_veterinario" value="${vet.id}" class="esconder-radio" ${checked}>
                    <div class="conteudo-cartao-opcao">
                        <div class="avatar-medico" style="background-color: ${corFundo}; color: ${corIcone};">
                            <i class="fa ${vet.icone}"></i>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span>${vet.nome}</span>
                            <small style="color: #7f8c8d; font-size: 0.8rem; margin-top: 3px;">${vet.especialidade}</small>
                        </div>
                    </div>
                </label>
            `;
        });
    }

    // Mostrar os veterinários apenas se a consulta estiver ativa
    const checkboxConsulta = document.getElementById('check-consulta');
    const seccaoVeterinario = document.getElementById('seccao-veterinario');

    if (checkboxConsulta && seccaoVeterinario) {
        checkboxConsulta.addEventListener('change', () => {
            if (checkboxConsulta.checked) {
                seccaoVeterinario.style.display = 'block';
            } else {
                seccaoVeterinario.style.display = 'none';
                const radiosMedicos = document.querySelectorAll('input[name="id_veterinario"]');
                radiosMedicos.forEach(radio => radio.checked = false);
            }
        });
    }

    // =======================================================
    // 4. LÓGICA DO PASSO 3: DATAS E HORAS
    // =======================================================
    const inputDataVisual = document.getElementById('data_marcacao_visual');
    const containerSlots = document.getElementById('container-slots-hora');
    const inputDataReal = document.getElementById('data_marcacao_real');
    const inputHoraReal = document.getElementById('hora_marcacao_real');

    if (inputDataVisual && containerSlots) {
        const hoje = new Date().toISOString().split('T')[0];
        inputDataVisual.setAttribute('min', hoje);

        inputDataVisual.addEventListener('change', function() {
            const dataSelecionada = this.value;
            inputDataReal.value = dataSelecionada; 

            if (dataSelecionada) {
                gerarSlotsTempo(); 
            } else {
                containerSlots.innerHTML = '<p class="mensagem-espera-data">Por favor, selecione um dia.</p>';
                inputHoraReal.value = '';
            }
        });

        function gerarSlotsTempo() {
            containerSlots.innerHTML = ''; 
            inputHoraReal.value = ''; 
            const horaAbertura = 9; const horaFecho = 18;
            let indexBloco = 0; 

            for (let h = horaAbertura; h < horaFecho; h++) {
                ['00', '30'].forEach(minuto => {
                    const horaFormatada = h.toString().padStart(2, '0') + ':' + minuto;
                    const slot = document.createElement('div');
                    slot.className = 'slot-hora';
                    slot.innerText = horaFormatada;
                    slot.dataset.index = indexBloco; 
                    
                    slot.addEventListener('click', function() {
                        const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
                        if (servicosEscolhidos.length === 0) {
                            alert("Volte ao Passo 2 e escolha pelo menos um Serviço!");
                            return;
                        }

                        const blocosNecessarios = servicosEscolhidos.length;
                        const meuIndex = parseInt(this.dataset.index);
                        const totalBlocosPorDia = (horaFecho - horaAbertura) * 2;

                        if (meuIndex + blocosNecessarios > totalBlocosPorDia) {
                            alert(`A clínica vai fechar antes de terminarmos!`);
                            return;
                        }

                        const todosSlots = document.querySelectorAll('.slot-hora');
                        todosSlots.forEach(el => el.classList.remove('selecionado'));
                        
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
});
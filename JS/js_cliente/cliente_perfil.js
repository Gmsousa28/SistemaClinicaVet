document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Apanhar o objeto completo do utilizador
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    let idClienteLogado = null;

    if (dadosLoginStr) {
        const dadosLogin = JSON.parse(dadosLoginStr);
        idClienteLogado = dadosLogin.id_cliente;
    }

    if (!idClienteLogado) {
        console.error("ERRO: Não foi possível encontrar o ID!");
        document.getElementById('container-consultas').innerHTML = '<p style="color: red;">Erro: Não foi possível identificar o utilizador.</p>';
        return;
    }
    
    const containerConsultas = document.getElementById('container-consultas');

    // ==========================================================================
    // VARIÁVEL GLOBAL PARA A MEMÓRIA DO CALENDÁRIO
    // ==========================================================================
    let marcacoesGlobais = []; 

    // ==========================================================================
    // --- PREENCHER O MODAL: ANIMAIS E VETERINÁRIOS ---
    // ==========================================================================

    async function carregarAnimaisParaModal() {
        const gridAnimais = document.getElementById('grid-animais-cliente');
        if (!gridAnimais || !idClienteLogado) return;

        try {
            const resposta = await fetch(`http://localhost:8008/api/animais/cliente/${idClienteLogado}`);
            if (!resposta.ok) throw new Error("Erro na API");
            
            const resultado = await resposta.json();
            const animais = resultado.data;

            gridAnimais.innerHTML = ''; 

            if (!animais || animais.length === 0) {
                gridAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center;">Não tem animais registados. Adicione um animal no seu perfil primeiro.</p>';
                return;
            }

            let contadorAnimaisVivos = 0;

            animais.forEach(animal => {
                const estado = animal.estado ? animal.estado.toLowerCase() : '';
                if (estado === 'falecido' || estado === 'morto' || estado === 'inativo' || animal.vivo === false) {
                    return; 
                }

                contadorAnimaisVivos++;

                const label = document.createElement('label');
                label.className = 'cartao-opcao-radio';
                label.style.cursor = 'pointer'; 
                
                label.innerHTML = `
                    <input type="radio" name="animal_selecionado" value="${animal.id_animal}" class="esconder-radio" required>
                    <div class="conteudo-cartao-opcao">
                        <i class="fa fa-paw icon-opcao"></i>
                        <div style="display: flex; flex-direction: column; text-align: center; gap: 5px;">
                            <span style="font-weight: bold; font-size: 16px; color: #2c3e50;">${animal.nome}</span>
                            <span style="font-size: 12px; color: #7f8c8d;">${animal.raca || animal.especie || 'Animal'}</span>
                        </div>
                    </div>
                `;
                gridAnimais.appendChild(label);
            });

            if (contadorAnimaisVivos === 0) {
                gridAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center;">Não tem animais ativos de momento.</p>';
            }

        } catch (erro) {
            console.error("Erro ao carregar animais no modal:", erro);
        }
    }

    async function carregarVeterinariosParaModal() {
        const containerVets = document.getElementById('container-vets');
        if (!containerVets) return;

        try {
            const resposta = await fetch(`http://localhost:8008/api/veterinarios`);
            const resultado = await resposta.json();

            containerVets.innerHTML = `
                <label class="cartao-opcao-radio">
                    <input type="radio" name="veterinario_selecionado" value="0" class="esconder-radio" checked>
                    <div class="conteudo-cartao-opcao">
                        <i class="fa fa-user-md icon-opcao"></i>
                        <div style="display: flex; flex-direction: column; text-align: center; gap: 5px;">
                            <span style="font-weight: bold; font-size: 14px; color: #2c3e50;">Qualquer Médico</span>
                            <span style="font-size: 11px; color: #7f8c8d;">Aleatório / Disponível</span>
                        </div>
                    </div>
                </label>
            `;

            if (resultado.data) {
                resultado.data.forEach(vet => {
                    const label = document.createElement('label');
                    label.className = 'cartao-opcao-radio';
                    label.innerHTML = `
                        <input type="radio" name="veterinario_selecionado" value="${vet.id_veterinario}" class="esconder-radio">
                        <div class="conteudo-cartao-opcao">
                            <i class="fa fa-user-md icon-opcao"></i>
                            <div style="display: flex; flex-direction: column; text-align: center; gap: 5px;">
                                <span style="font-weight: bold; font-size: 14px; color: #2c3e50;">${vet.nome}</span>
                                <span style="font-size: 11px; color: #7f8c8d;">Veterinário</span>
                            </div>
                        </div>
                    `;
                    containerVets.appendChild(label);
                });
            }
        } catch (erro) {}
    }

    // ==========================================================================
    // --- GESTÃO DE DATAS E HORAS (COM BLOQUEIO DE SOBREPOSIÇÃO!) ---
    // ==========================================================================
    const inputDataVisual = document.getElementById('data_marcacao_visual');
    const containerSlots = document.getElementById('container-slots-hora');
    const inputDataReal = document.getElementById('data_marcacao_real');
    const inputHoraReal = document.getElementById('hora_marcacao_real');

    if (inputDataVisual && containerSlots) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        
        inputDataVisual.setAttribute('min', `${ano}-${mes}-${dia}`);

        inputDataVisual.addEventListener('change', function() {
            inputDataReal.value = this.value; 
            if (this.value) {
                gerarSlotsTempo();
            } else {
                containerSlots.innerHTML = '<p class="mensagem-espera-data">Selecione primeiro um dia para ver os horários disponíveis.</p>';
            }
        });

        function gerarSlotsTempo() {
            containerSlots.innerHTML = ''; 
            inputHoraReal.value = ''; 
            let indexBloco = 0;

            const dataSelecionada = inputDataReal.value; // Formato YYYY-MM-DD

            // 1. Descobrir as horas já ocupadas neste dia!
            const horasOcupadas = marcacoesGlobais
                .filter(m => m.data_hora && m.data_hora.startsWith(dataSelecionada))
                .map(m => {
                    const dateObj = new Date(m.data_hora);
                    return dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                });

            for (let h = 9; h < 18; h++) {
                ['00', '30'].forEach(minuto => {
                    const horaFormatada = h.toString().padStart(2, '0') + ':' + minuto;
                    const slot = document.createElement('div');
                    slot.className = 'slot-hora';
                    slot.innerText = horaFormatada;
                    slot.dataset.index = indexBloco; 
                    
                    // 2. SE A HORA ESTIVER NA LISTA DE OCUPADAS, BLOQUEIA O BOTÃO!
                    if (horasOcupadas.includes(horaFormatada)) {
                        slot.classList.add('indisponivel');
                        slot.style.backgroundColor = '#dcdde1'; // Cinzento
                        slot.style.color = '#7f8c8d';
                        slot.style.border = '1px dashed #bdc3c7';
                        slot.style.cursor = 'not-allowed';
                        slot.title = "Horário indisponível";
                    } else {
                        // Se estiver livre, deixa clicar
                        slot.addEventListener('click', function() {
                            const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
                            
                            if (servicosEscolhidos.length === 0) { 
                                alert("Erro: Não escolheu nenhum serviço no Passo 2!"); 
                                return; 
                            }

                            const blocosNecessarios = servicosEscolhidos.length;
                            const meuIndex = parseInt(this.dataset.index);

                            if (meuIndex + blocosNecessarios > 18) { 
                                alert("Não há tempo suficiente antes do fecho da clínica. Escolha uma hora mais cedo."); 
                                return;
                            }

                            // 3. Verifica se os próximos blocos que a consulta precisa também estão livres
                            const todosSlots = document.querySelectorAll('.slot-hora');
                            let espacoLivre = true;
                            for (let i = 0; i < blocosNecessarios; i++) {
                                if(todosSlots[meuIndex + i] && todosSlots[meuIndex + i].classList.contains('indisponivel')) {
                                    espacoLivre = false;
                                }
                            }

                            if(!espacoLivre) {
                                alert("Aviso: O tempo da marcação choca com outra consulta existente. Escolha um horário com mais tempo livre a seguir.");
                                return;
                            }

                            document.querySelectorAll('.slot-hora').forEach(el => el.classList.remove('selecionado'));
                            
                            for (let i = 0; i < blocosNecessarios; i++) {
                                if(todosSlots[meuIndex + i]) {
                                    todosSlots[meuIndex + i].classList.add('selecionado');
                                }
                            }
                            
                            inputHoraReal.value = horaFormatada; 
                        });
                    }
                    
                    containerSlots.appendChild(slot);
                    indexBloco++;
                });
            }
        }
    }


    // ==========================================================================
    // 1. CARREGAR CONSULTAS E SERVIÇOS (MIX)
    // ==========================================================================
    async function carregarConsultasReais() {
        if (!containerConsultas) return;

        try {
            const urlConsultas = `http://localhost:8008/api/consultas/cliente/${idClienteLogado}`;
            const urlServicos = `http://localhost:8008/api/servicos`; 
            const urlAnimais = `http://localhost:8008/api/animais/cliente/${idClienteLogado}`;

            let todasAsMarcacoes = [];
            let meusAnimaisIDs = [];
            let mapaAnimais = {}; 

            try {
                const resAnimais = await fetch(urlAnimais);
                if (resAnimais.ok) {
                    const dadosA = await resAnimais.json();
                    if (dadosA.data) {
                        dadosA.data.forEach(animal => {
                            meusAnimaisIDs.push(animal.id_animal);
                            mapaAnimais[animal.id_animal] = animal.nome; 
                        });
                    }
                }
            } catch (e) {}

            try {
                const resConsultas = await fetch(urlConsultas);
                if (resConsultas.ok) {
                    const dadosC = await resConsultas.json();
                    if (dadosC.data) {
                        const consultasFormatadas = dadosC.data.map(c => ({
                            id: c.id_consulta,
                            tipo: 'consulta',
                            nome_animal: c.nome_animal || mapaAnimais[c.id_animal] || 'Animal',
                            data_hora: c.data_hora || c.data_consulta,
                            motivo: c.motivo || 'Consulta',
                            profissional: c.nome_veterinario || 'Sem médico atribuído',
                            estado: c.estado
                        }));
                        todasAsMarcacoes.push(...consultasFormatadas);
                    }
                }
            } catch (e) {}

            try {
                const resServicos = await fetch(urlServicos);
                if (resServicos.ok) {
                    const dadosS = await resServicos.json();
                    if (dadosS.data) {
                        const meusServicos = dadosS.data.filter(s => meusAnimaisIDs.includes(s.id_animal));
                        const servicosFormatados = meusServicos.map(s => ({
                            id: s.id_servicos || s.id_servico,
                            tipo: 'servico',
                            nome_animal: mapaAnimais[s.id_animal] || 'Animal', 
                            data_hora: s.data_servicos, 
                            motivo: s.tipo_servico || 'Serviço',
                            profissional: 'Equipa da Clínica',
                            estado: s.estado_servico || s.estado || 'Agendado'
                        }));
                        todasAsMarcacoes.push(...servicosFormatados);
                    }
                }
            } catch (e) {}

            // GUARDA NA MEMÓRIA GLOBAL PARA O CALENDÁRIO SABER
            marcacoesGlobais = todasAsMarcacoes;

            containerConsultas.innerHTML = ''; 
            if (todasAsMarcacoes.length === 0) {
                containerConsultas.innerHTML = '<p style="color: white; padding-left: 20px;">Não tem consultas nem serviços marcados de momento.</p>';
                return;
            }

            todasAsMarcacoes.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
            const dataAtual = new Date();

            todasAsMarcacoes.forEach(marcacao => {
                const dataMarcacao = new Date(marcacao.data_hora); 
                let status = "futura";
                let botoesAcao = `
                    <button class="btn btn-detalhes">Ver</button>
                    <button class="btn btn-editar">Remarcar</button>
                    <button class="btn btn-cancelar">Cancelar</button>
                `;

                if (dataMarcacao < dataAtual) {
                    status = "passada";
                    botoesAcao = `
                        <button class="btn btn-detalhes">Ver</button>
                        <button class="btn btn-repetir">Repetir</button>
                    `;
                }

                const diaMes = dataMarcacao.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
                const hora = dataMarcacao.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                const icone = marcacao.tipo === 'servico' ? '🛁' : '💉';

                const section = document.createElement('section');
                section.className = 'consulta';
                section.setAttribute('data-status', status);
                section.setAttribute('data-id', marcacao.id);
                section.setAttribute('data-tipo', marcacao.tipo); 
                section.innerHTML = `
                    <div class="info">
                        <p class="nome">🐾 ${marcacao.nome_animal}</p>
                        <p>📅 ${diaMes} - ${hora}</p>
                        <p>${icone} ${marcacao.motivo}</p>
                        <p class="medico-escondido" style="display:none;">${marcacao.profissional}</p> 
                    </div>
                    <div class="acoes">
                        ${botoesAcao}
                    </div>
                `;
                containerConsultas.appendChild(section);
            });

            aplicarFiltroAtivo();

        } catch (erro) {
            console.error("Erro geral ao carregar marcações:", erro);
        }
    }

    if (idClienteLogado) {
        carregarConsultasReais();
    }

    // ==========================================================================
    // 2. LÓGICA DA JANELA DE MARCAR CONSULTA (E GRAVAÇÃO NA BD!)
    // ==========================================================================
    const modalConsulta = document.getElementById('modal-nova-consulta');
    const btnAbrirModal = document.getElementById('btn-abrir-modal-consulta');
    const btnConfirmar = document.getElementById('btn-confirmar'); 

    if (modalConsulta && btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            modalConsulta.classList.add('ativo');
            document.body.classList.add('no-scroll');
            
            carregarAnimaisParaModal();
            carregarVeterinariosParaModal();
            
            if(window.resetarPassos) window.resetarPassos();
        });

        modalConsulta.querySelector('.fechar-modal-consulta').addEventListener('click', () => {
            modalConsulta.classList.remove('ativo');
            document.body.classList.remove('no-scroll');
        });

        if (btnConfirmar) {
                    btnConfirmar.addEventListener('click', async () => {
                        
                        const dataEscolhida = document.getElementById('data_marcacao_real').value;
                        const horaEscolhida = document.getElementById('hora_marcacao_real').value;
                        
                        if (!dataEscolhida || !horaEscolhida) {
                            alert("Atenção: Por favor escolha uma data e um horário disponível antes de confirmar.");
                            return;
                        }

                        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servico"]:checked'))
                                                          .map(cb => cb.value)
                                                          .join(', ');

                        // AQUI ESTÁ A MUDANÇA:
                        // Se escolheste "Qualquer Médico" (valor 0), enviamos 0, NÃO null!
                        let vetEscolhido = document.querySelector('input[name="veterinario_selecionado"]:checked')?.value;
                        let idVetFinal = parseInt(vetEscolhido);

                        // Só enviamos null se o valor for realmente algo inválido (NaN)
                        if (isNaN(idVetFinal)) {
                            idVetFinal = null; 
                        }

                        const dataHoraConsulta = `${dataEscolhida} ${horaEscolhida}:00`; 
                        const animalEscolhido = document.querySelector('input[name="animal_selecionado"]:checked').value;

                        const dadosParaEnviar = {
                            id_cliente: parseInt(idClienteLogado),
                            id_animal: parseInt(animalEscolhido),
                            id_veterinario: idVetFinal, // Agora envia 0 ou o ID do vet, nunca NULL para consultas
                            data_hora: dataHoraConsulta,
                            data_consulta: dataHoraConsulta,
                            motivo: servicosSelecionados,
                            estado: "Agendada" 
                        };

                        btnConfirmar.innerText = "A agendar...";
                        btnConfirmar.disabled = true;

                        try {
                            const resposta = await fetch(`http://localhost:8008/api/consultas`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(dadosParaEnviar)
                            });

                            const resultado = await resposta.json();

                            if (resultado.status === 201 || resultado.status === 200) {
                                alert('🎉 Marcação efetuada com sucesso!');
                                window.location.reload(); 
                            } else {
                                // Se o servidor rejeitar o 0, ele vai dar este erro aqui:
                                alert('Erro ao gravar: ' + (resultado.message || 'Verifique a consola'));
                                btnConfirmar.innerHTML = 'Confirmar Marcação <i class="fa fa-check" style="margin-left: 8px;"></i>';
                                btnConfirmar.disabled = false;
                            }
                        } catch (erro) {
                            console.error("Erro grave:", erro);
                            alert("Erro ao ligar ao servidor da clínica.");
                            btnConfirmar.disabled = false;
                        }
                    });
                }
    }

    // ==========================================================================
    // 3. LÓGICA DOS FILTROS INTELIGENTES
    // ==========================================================================
    const botoesFiltro = document.querySelectorAll('.filtro-btn');

    function aplicarFiltroAtivo() {
        const botaoAtivo = document.querySelector('.filtro-btn.ativo');
        if (!botaoAtivo) return;
        
        const filtroEscolhido = botaoAtivo.getAttribute('data-filtro');
        const cartoesConsulta = document.querySelectorAll('.consulta');

        cartoesConsulta.forEach(cartao => {
            const statusCartao = cartao.getAttribute('data-status');
            if (filtroEscolhido === 'todas' || filtroEscolhido === statusCartao) {
                cartao.style.display = 'flex';
            } else {
                cartao.style.display = 'none';
            }
        });
    }

    if (botoesFiltro.length > 0) {
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                aplicarFiltroAtivo();
            });
        });
    }

    // ==========================================================================
    // 4. AÇÕES DOS BOTÕES DAS CONSULTAS GERADAS (VER, REMARCAR, CANCELAR)
    // ==========================================================================
    const modalDetalhes = document.getElementById('modal-detalhes-consulta');
    const detalheNome = document.getElementById('detalhe-nome');
    const detalheData = document.getElementById('detalhe-data');
    const detalheMotivo = document.getElementById('detalhe-motivo');
    let cartaoSendoVistoRef = null;

    if (containerConsultas) {
        containerConsultas.addEventListener('click', function(e) {
            const botao = e.target;
            const cartaoConsulta = botao.closest('.consulta');
            if (!cartaoConsulta) return;

            const idDaMarcacao = cartaoConsulta.getAttribute('data-id');
            const tipoDaMarcacao = cartaoConsulta.getAttribute('data-tipo');

            const endpointApagar = tipoDaMarcacao === 'servico' 
                ? `http://localhost:8008/api/servicos/${idDaMarcacao}` 
                : `http://localhost:8008/api/consultas/${idDaMarcacao}`;

            // BOTÃO CANCELAR
            if (botao.classList.contains('btn-cancelar')) {
                if (confirm("Tem a certeza que deseja cancelar esta marcação?")) {
                    fetch(endpointApagar, { method: 'DELETE' })
                    .then(resposta => {
                        if(resposta.ok) {
                            cartaoConsulta.style.opacity = '0';
                            setTimeout(() => { cartaoConsulta.remove(); }, 300);
                            alert("Marcação cancelada com sucesso!");
                        } else {
                            alert("Erro ao cancelar. Verifique a consola.");
                        }
                    });
                }
            }

            // BOTÃO REMARCAR
            if (botao.classList.contains('btn-editar')) {
                if (confirm("Para remarcar, a marcação atual será cancelada. Deseja escolher um novo horário?")) {
                    fetch(endpointApagar, { method: 'DELETE' })
                    .then(resposta => {
                        if(resposta.ok) {
                            cartaoConsulta.remove(); 
                            if (modalConsulta) {
                                modalConsulta.classList.add('ativo');
                                document.body.classList.add('no-scroll');
                                carregarAnimaisParaModal();
                                carregarVeterinariosParaModal();
                                if(window.resetarPassos) window.resetarPassos();
                            }
                        }
                    });
                }
            }

            // BOTÃO VER (DETALHES)
            if (botao.classList.contains('btn-detalhes')) {
                cartaoSendoVistoRef = cartaoConsulta; 

                const infoParagrafos = cartaoConsulta.querySelectorAll('.info p');
                detalheNome.innerText = infoParagrafos[0].innerText.replace('🐾 ', '');
                detalheData.innerText = infoParagrafos[1].innerText.replace('📅 ', '');
                detalheMotivo.innerText = infoParagrafos[2].innerText; 
                
                const nomeMedico = infoParagrafos[3].innerText;
                const detalheMedico = modalDetalhes.querySelector('.detalhes-info p:nth-child(5)'); 
                if (detalheMedico) {
                    detalheMedico.innerHTML = `<strong>Profissional:</strong> ${nomeMedico}`;
                }
                
                if (modalDetalhes) {
                    modalDetalhes.classList.add('ativo');
                    document.body.classList.add('no-scroll');
                }
            }
        });
    }

    // ==========================================================================
    // 5. AÇÕES DENTRO DO MODAL DE DETALHES
    // ==========================================================================
    if (modalDetalhes) {
        modalDetalhes.querySelector('.fechar-modal-detalhes').addEventListener('click', () => {
            modalDetalhes.classList.remove('ativo');
            document.body.classList.remove('no-scroll');
        });

        modalDetalhes.addEventListener('click', (e) => { 
            if (e.target === modalDetalhes) {
                modalDetalhes.classList.remove('ativo');
                document.body.classList.remove('no-scroll');
            }
        });

        const btnCancelarNoModal = modalDetalhes.querySelector('.btn-cancelar.btn-bloco');
        const btnRemarcarNoModal = modalDetalhes.querySelector('.btn-editar.btn-bloco');

        if (btnCancelarNoModal) {
            btnCancelarNoModal.addEventListener('click', () => {
                if (confirm("Tem a certeza que deseja cancelar esta marcação?") && cartaoSendoVistoRef) {
                    const idDaMarcacao = cartaoSendoVistoRef.getAttribute('data-id');
                    const tipoDaMarcacao = cartaoSendoVistoRef.getAttribute('data-tipo');

                    const endpointApagar = tipoDaMarcacao === 'servico' ? `http://localhost:8008/api/servicos/${idDaMarcacao}` : `http://localhost:8008/api/consultas/${idDaMarcacao}`;
                    
                    fetch(endpointApagar, { method: 'DELETE' }).then(resposta => {
                        if(resposta.ok) {
                            modalDetalhes.classList.remove('ativo');
                            document.body.classList.remove('no-scroll');
                            cartaoSendoVistoRef.style.opacity = '0';
                            setTimeout(() => { cartaoSendoVistoRef.remove(); }, 300);
                            alert("Marcação cancelada com sucesso!");
                            cartaoSendoVistoRef = null; 
                        }
                    });
                }
            });
        }

        if (btnRemarcarNoModal) {
            btnRemarcarNoModal.addEventListener('click', () => {
                if (cartaoSendoVistoRef) {
                    const idDaMarcacao = cartaoSendoVistoRef.getAttribute('data-id');
                    const tipoDaMarcacao = cartaoSendoVistoRef.getAttribute('data-tipo');
                    const endpointApagar = tipoDaMarcacao === 'servico' ? `http://localhost:8008/api/servicos/${idDaMarcacao}` : `http://localhost:8008/api/consultas/${idDaMarcacao}`;
                    
                    if (confirm("Para remarcar, a marcação atual será cancelada. Deseja escolher um novo horário?")) {
                        fetch(endpointApagar, { method: 'DELETE' }).then(resposta => {
                            if(resposta.ok) {
                                modalDetalhes.classList.remove('ativo');
                                cartaoSendoVistoRef.remove();
                                if (modalConsulta) {
                                    modalConsulta.classList.add('ativo');
                                    carregarAnimaisParaModal();
                                    carregarVeterinariosParaModal();
                                }
                                cartaoSendoVistoRef = null;
                            }
                        });
                    }
                }
            });
        }
    }
    
    const checkConsulta = document.getElementById('check-consulta');
    const seccaoVeterinario = document.getElementById('seccao-veterinario');

    if(checkConsulta && seccaoVeterinario) {
        checkConsulta.addEventListener('change', function() {
            if(this.checked) {
                seccaoVeterinario.style.display = 'block';
            } else {
                seccaoVeterinario.style.display = 'none';
            }
        });
    }
});

// ==========================================================================
// FUNÇÃO GLOBAL: NAVEGAR NOS PASSOS DO MODAL
// ==========================================================================
let passoAtual = 1;

window.resetarPassos = function() {
    passoAtual = 1;
    document.querySelectorAll('.conteudo-passo').forEach(el => {
        el.classList.add('escondido');
        el.style.display = ''; 
    });
    document.querySelectorAll('.passo').forEach(el => el.classList.remove('ativo'));
    
    document.getElementById(`passo-1`).classList.remove('escondido');
    document.getElementById(`indicador-passo-1`).classList.add('ativo');
    
    document.getElementById('btn-voltar').classList.add('escondido');
    document.getElementById('btn-avancar').classList.remove('escondido');
    document.getElementById('btn-confirmar').classList.add('escondido');
}

window.mudarPasso = function(direcao) {
    if (direcao === 1) {
        if (passoAtual === 1) {
            const animalEscolhido = document.querySelector('input[name="animal_selecionado"]:checked');
            if (!animalEscolhido) {
                alert("Por favor, selecione um animal antes de avançar.");
                return; 
            }
        }

        if (passoAtual === 2) {
            const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
            if (servicosEscolhidos.length === 0) {
                alert("Por favor, selecione pelo menos um serviço (Consulta, Banho ou Tosquia).");
                return; 
            }
        }
    }

    const totalPassos = 3;

    document.getElementById(`passo-${passoAtual}`).classList.add('escondido');
    document.getElementById(`indicador-passo-${passoAtual}`).classList.remove('ativo');
    
    passoAtual += direcao;
    
    document.getElementById(`passo-${passoAtual}`).classList.remove('escondido');
    document.getElementById(`indicador-passo-${passoAtual}`).classList.add('ativo');

    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnConfirmar = document.getElementById('btn-confirmar');

    if (passoAtual === 1) {
        btnVoltar.classList.add('escondido');
    } else {
        btnVoltar.classList.remove('escondido');
    }

    if (passoAtual === totalPassos) {
        btnAvancar.classList.add('escondido');
        btnConfirmar.classList.remove('escondido');
    } else {
        btnAvancar.classList.remove('escondido');
        btnConfirmar.classList.add('escondido');
    }
};
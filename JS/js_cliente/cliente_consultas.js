document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Apanhar o objeto completo do utilizador
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    let idClienteLogado = null;

    if (dadosLoginStr) {
        const dadosLogin = JSON.parse(dadosLoginStr);
        idClienteLogado = dadosLogin.id_cliente;
    }

    if (!idClienteLogado) {
        console.error("ERRO: Não foi possível encontrar o ID dentro do objeto utilizadorLogado!");
        document.getElementById('container-consultas').innerHTML = '<p style="color: red;">Erro: Não foi possível identificar o utilizador.</p>';
        return;
    }
    
    const urlApiConsultas = `http://localhost:8008/api/consultas/cliente/${idClienteLogado}`;
    const containerConsultas = document.getElementById('container-consultas');

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
                gridAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center;">Não tem animais ativos de momento. Adicione um novo animal no seu perfil.</p>';
            }

        } catch (erro) {
            console.error("Erro ao carregar animais no modal:", erro);
            gridAnimais.innerHTML = '<p style="color: #e74c3c; width: 100%; text-align: center;">Erro ao carregar os animais.</p>';
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
        } catch (erro) {
            console.error("Erro ao carregar veterinários:", erro);
        }
    }

    // ==========================================================================
    // --- GESTÃO DE DATAS E HORAS (PASSO 3) ---
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

            for (let h = 9; h < 18; h++) {
                ['00', '30'].forEach(minuto => {
                    const horaFormatada = h.toString().padStart(2, '0') + ':' + minuto;
                    const slot = document.createElement('div');
                    slot.className = 'slot-hora';
                    slot.innerText = horaFormatada;
                    slot.dataset.index = indexBloco; 
                    
                    slot.addEventListener('click', function() {
                        const servicosEscolhidos = document.querySelectorAll('input[name="servico"]:checked');
                        
                        if (servicosEscolhidos.length === 0) { 
                            alert("Erro: Não escolheu nenhum serviço no Passo 2!"); 
                            return; 
                        }

                        const blocosNecessarios = servicosEscolhidos.length;
                        const meuIndex = parseInt(this.dataset.index);

                        if (meuIndex + blocosNecessarios > 18) { 
                            alert("Não há tempo suficiente antes do fecho da clínica (18:00). Por favor, escolha uma hora mais cedo."); 
                            return;
                        }

                        document.querySelectorAll('.slot-hora').forEach(el => el.classList.remove('selecionado'));
                        
                        const todosSlots = document.querySelectorAll('.slot-hora');
                        for (let i = 0; i < blocosNecessarios; i++) {
                            if(todosSlots[meuIndex + i]) {
                                todosSlots[meuIndex + i].classList.add('selecionado');
                            }
                        }
                        
                        inputHoraReal.value = horaFormatada; 
                    });
                    
                    containerSlots.appendChild(slot);
                    indexBloco++;
                });
            }
        }
    }


    // ==========================================================================
    // 1. CARREGAR CONSULTAS E SERVIÇOS DA BASE DE DADOS (MIX DAS DUAS TABELAS)
    // ==========================================================================
    async function carregarConsultasReais() {
        if (!containerConsultas) return;

        try {
            const urlConsultas = `http://localhost:8008/api/consultas/cliente/${idClienteLogado}`;
            const urlServicos = `http://localhost:8008/api/servicos`; // <-- A rota geral do teu colega!
            const urlAnimais = `http://localhost:8008/api/animais/cliente/${idClienteLogado}`;

            let todasAsMarcacoes = [];
            let meusAnimaisIDs = [];
            let mapaAnimais = {}; // Para sabermos o nome do animal através do ID

            // 1. Descobrir os animais do cliente logado (para filtrar os serviços e saber os nomes)
            try {
                const resAnimais = await fetch(urlAnimais);
                if (resAnimais.ok) {
                    const dadosA = await resAnimais.json();
                    if (dadosA.data) {
                        dadosA.data.forEach(animal => {
                            meusAnimaisIDs.push(animal.id_animal);
                            mapaAnimais[animal.id_animal] = animal.nome; // Guarda o nome: ex: { 2: "Rex" }
                        });
                    }
                }
            } catch (e) { console.warn("Falha ao carregar animais para filtro."); }

            // 2. Vai buscar as Consultas Médicas
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
            } catch (e) { console.warn("Falha ao carregar consultas médicas."); }

            // 3. Vai buscar os Serviços (Banhos/Tosquias) e FILTRA!
            try {
                const resServicos = await fetch(urlServicos);
                if (resServicos.ok) {
                    const dadosS = await resServicos.json();
                    if (dadosS.data) {
                        // O SEGREDO: Só guarda os serviços cujo id_animal pertença a este cliente
                        const meusServicos = dadosS.data.filter(s => meusAnimaisIDs.includes(s.id_animal));

                        const servicosFormatados = meusServicos.map(s => ({
                            id: s.id_servicos || s.id_servico,
                            tipo: 'servico',
                            nome_animal: mapaAnimais[s.id_animal] || 'Animal', 
                            data_hora: s.data_servicos, 
                            motivo: s.tipo_servico || 'Serviço',
                            profissional: 'Equipa da Clínica', // Banhos geralmente não têm um vet específico
                            estado: s.estado_servico || s.estado || 'Agendado'
                        }));
                        todasAsMarcacoes.push(...servicosFormatados);
                    }
                }
            } catch (e) { console.warn("Falha ao carregar serviços."); }

            // 4. Se não houver nada nas duas tabelas, avisa o utilizador
            containerConsultas.innerHTML = ''; 
            if (todasAsMarcacoes.length === 0) {
                containerConsultas.innerHTML = '<p style="color: white; padding-left: 20px;">Não tem consultas nem serviços marcados de momento.</p>';
                return;
            }

            // 5. Organizar tudo por ordem cronológica (da data mais antiga para a mais recente)
            todasAsMarcacoes.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

            const dataAtual = new Date();

            // 6. Desenhar os cartões no ecrã misturando tudo!
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

                // Mudar o ícone: 🛁 para Banhos/Tosquias, 💉 para Consultas Médicas
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
            containerConsultas.innerHTML = '<p style="color: #e74c3c; padding-left: 20px;">Erro ao ligar ao servidor.</p>';
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

                let vetEscolhido = document.querySelector('input[name="veterinario_selecionado"]:checked')?.value;
                
                // ==============================================================
                // O SEGREDO ESTÁ AQUI: Substituir o 0 por null se for só banho!
                // ==============================================================
                let idVetFinal = parseInt(vetEscolhido);
                if (idVetFinal === 0 || isNaN(idVetFinal)) {
                    idVetFinal = null; 
                }

                const dataHoraConsulta = `${dataEscolhida} ${horaEscolhida}:00`; 
                const animalEscolhido = document.querySelector('input[name="animal_selecionado"]:checked').value;

                // Pacote à prova de bala para a Base de Dados
                const dadosParaEnviar = {
                    id_cliente: parseInt(idClienteLogado),
                    id_animal: parseInt(animalEscolhido),
                    id_veterinario: idVetFinal, 
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
                        alert('Erro ao gravar: ' + (resultado.message || 'Verifique a consola'));
                        btnConfirmar.innerHTML = 'Confirmar Marcação <i class="fa fa-check" style="margin-left: 8px;"></i>';
                        btnConfirmar.disabled = false;
                    }
                } catch (erro) {
                    console.error("Erro grave:", erro);
                    alert("Erro ao ligar ao servidor da clínica.");
                    btnConfirmar.innerHTML = 'Confirmar Marcação <i class="fa fa-check" style="margin-left: 8px;"></i>';
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
    // 4. AÇÕES DOS BOTÕES DAS CONSULTAS GERADAS
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
            const tipoDaMarcacao = cartaoConsulta.getAttribute('data-tipo'); // Lê se é 'consulta' ou 'servico'

            // O TRUQUE ESTÁ AQUI: Escolhe o caminho certo para a API!
            const endpointApagar = tipoDaMarcacao === 'servico' 
                ? `http://localhost:8008/api/servicos/${idDaMarcacao}` 
                : `http://localhost:8008/api/consultas/${idDaMarcacao}`;

            // 1. BOTÃO CANCELAR
            if (botao.classList.contains('btn-cancelar')) {
                const confirmacao = confirm("Tem a certeza que deseja cancelar esta marcação?");
                if (confirmacao) {
                    fetch(endpointApagar, { method: 'DELETE' })
                    .then(resposta => {
                        if(resposta.ok) {
                            cartaoConsulta.style.opacity = '0';
                            setTimeout(() => { cartaoConsulta.remove(); }, 300);
                            alert("Marcação cancelada com sucesso!");
                        } else {
                            alert("Erro ao cancelar. Verifique a consola.");
                        }
                    })
                    .catch(erro => console.error("Erro grave:", erro));
                }
            }

            // 2. BOTÃO REMARCAR
            if (botao.classList.contains('btn-editar')) {
                const confirmacao = confirm("Para remarcar, a marcação atual será cancelada. Deseja escolher um novo horário?");
                if (confirmacao) {
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

            // 3. BOTÃO VER (DETALHES)
            if (botao.classList.contains('btn-detalhes')) {
                cartaoSendoVistoRef = cartaoConsulta; 

                const infoParagrafos = cartaoConsulta.querySelectorAll('.info p');
                detalheNome.innerText = infoParagrafos[0].innerText.replace('🐾 ', '');
                detalheData.innerText = infoParagrafos[1].innerText.replace('📅 ', '');
                detalheMotivo.innerText = infoParagrafos[2].innerText; // Tiramos o replace para preservar o ícone dinâmico
                
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
                const confirmacao = confirm("Tem a certeza que deseja cancelar esta marcação?");
                if (confirmacao && cartaoSendoVistoRef) {
                    const idDaMarcacao = cartaoSendoVistoRef.getAttribute('data-id');
                    const tipoDaMarcacao = cartaoSendoVistoRef.getAttribute('data-tipo');

                    const endpointApagar = tipoDaMarcacao === 'servico' 
                        ? `http://localhost:8008/api/servicos/${idDaMarcacao}` 
                        : `http://localhost:8008/api/consultas/${idDaMarcacao}`;
                    
                    fetch(endpointApagar, { method: 'DELETE' })
                    .then(resposta => {
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

                    const endpointApagar = tipoDaMarcacao === 'servico' 
                        ? `http://localhost:8008/api/servicos/${idDaMarcacao}` 
                        : `http://localhost:8008/api/consultas/${idDaMarcacao}`;
                    
                    const confirmacao = confirm("Para remarcar, a marcação atual será cancelada. Deseja escolher um novo horário?");
                    if (confirmacao) {
                        fetch(endpointApagar, { method: 'DELETE' })
                        .then(resposta => {
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
// FUNÇÃO GLOBAL: NAVEGAR NOS PASSOS DO MODAL (COM VALIDAÇÕES)
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
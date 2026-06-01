document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Apanhar o objeto completo do utilizador
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    let idClienteLogado = null;

    if (dadosLoginStr) {
        const dadosLogin = JSON.parse(dadosLoginStr);
        idClienteLogado = dadosLogin.id_cliente;
    }

    if (!idClienteLogado) {
        document.querySelector('.lista-consultas').innerHTML = '<p style="color: white; padding-left: 20px;">Erro: Faça login para ver o histórico.</p>';
        return;
    }
    
    const containerLista = document.querySelector('.lista-consultas');
    let listaCompletaHistorico = []; 

    // ==========================================================================
    // --- 1. BUSCAR DADOS (CONSULTAS + SERVIÇOS) ---
    // ==========================================================================
    async function carregarHistorico() {
        try {
            const urlConsultas = `http://localhost:8008/api/consultas/cliente/${idClienteLogado}`;
            const urlServicos = `http://localhost:8008/api/servicos`; 
            const urlAnimais = `http://localhost:8008/api/animais/cliente/${idClienteLogado}`;

            let mapaAnimais = {}; 
            let meusAnimaisIDs = [];

            // Buscar nomes dos animais
            const resAnimais = await fetch(urlAnimais);
            if (resAnimais.ok) {
                const dadosA = await resAnimais.json();
                if (dadosA.data) {
                    dadosA.data.forEach(a => { mapaAnimais[a.id_animal] = a.nome; meusAnimaisIDs.push(a.id_animal); });
                }
            }

            // Buscar Consultas
            const resC = await fetch(urlConsultas);
            if (resC.ok) {
                const dadosC = await resC.json();
                if (dadosC.data) {
                    dadosC.data.forEach(c => {
                        const data = new Date(c.data_hora || c.data_consulta);
                        if (data < new Date()) { 
                            listaCompletaHistorico.push({
                                nome_animal: c.nome_animal || mapaAnimais[c.id_animal] || 'Animal',
                                data: data,
                                motivo: c.motivo || 'Consulta',
                                profissional: c.nome_veterinario || 'Dr(a). Clínico',
                                preco: c.preco ? c.preco + '€' : '0.00€'
                            });
                        }
                    });
                }
            }

            // Buscar Serviços
            const resS = await fetch(urlServicos);
            if (resS.ok) {
                const dadosS = await resS.json();
                if (dadosS.data) {
                    const meusServicos = dadosS.data.filter(s => meusAnimaisIDs.includes(s.id_animal));
                    meusServicos.forEach(s => {
                        const data = new Date(s.data_servicos);
                        if (data < new Date()) {
                            listaCompletaHistorico.push({
                                nome_animal: mapaAnimais[s.id_animal] || 'Animal',
                                data: data,
                                motivo: s.tipo_servico || 'Serviço',
                                profissional: 'Equipa Estética',
                                preco: s.preco ? s.preco + '€' : '0.00€'
                            });
                        }
                    });
                }
            }

            // Ordenar: Mais recente primeiro
            listaCompletaHistorico.sort((a, b) => b.data - a.data);
            renderizarHistorico(listaCompletaHistorico);

        } catch (erro) {
            console.error("Erro ao carregar histórico:", erro);
        }
    }

    // ==========================================================================
    // --- 2. RENDERIZAR NA TELA ---
    // ==========================================================================
    function renderizarHistorico(lista) {
        containerLista.innerHTML = '';
        if (lista.length === 0) {
            containerLista.innerHTML = '<p style="color: white; padding-left: 20px;">Não tem consultas nem serviços registados no passado.</p>';
            return;
        }

        lista.forEach(item => {
            const dataFormatada = item.data.toLocaleDateString('pt-PT');
            const horaFormatada = item.data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            
            // Ícones e texto
            const iconeMotivo = item.motivo.toLowerCase().includes('banho') || item.motivo.toLowerCase().includes('tosquia') ? '🛁' : '💉';

            const section = document.createElement('section');
            section.className = 'consulta historico';
            section.innerHTML = `
                <div class="info">
                    <p class="nome">🐾 ${item.nome_animal}</p>
                    <p>📅 ${dataFormatada} - ${horaFormatada}</p>
                    <p>${iconeMotivo} ${item.motivo}</p>
                    <p>👨‍⚕️ ${item.profissional}</p>
                    <p>💰 ${item.preco}</p>
                    <p class="status">Concluído</p>
                </div>
                <div class="acoes">
                    <button class="btn btn-detalhes" 
                        data-nome="${item.nome_animal}"
                        data-data="${dataFormatada} às ${horaFormatada}"
                        data-motivo="${item.motivo}"
                        data-medico="${item.profissional}"
                        data-preco="${item.preco}">Ver</button>
                    <button class="btn btn-repetir">Repetir</button>
                </div>
            `;
            containerLista.appendChild(section);
        });
    }

    // ==========================================================================
    // --- 3. FUNCIONALIDADE DOS BOTÕES: VER E REPETIR ---
    // ==========================================================================
    const modalHistorico = document.getElementById('modal-detalhes-historico');

    containerLista.addEventListener('click', function(e) {
        
        // Se clicou no botão Repetir
        const btnRepetir = e.target.closest('.btn-repetir');
        if (btnRepetir) {
            window.location.href = "consultas_cliente.html";
            return; 
        }

        // Se clicou no botão Ver
        const btnVer = e.target.closest('.btn-detalhes');
        if (btnVer) {
            
            if (!modalHistorico) {
                alert("ERRO GRAVE: O JavaScript não encontra a 'janela' (modal) no HTML. Tens a certeza que ela está no ficheiro historico_cliente.html?");
                return;
            }

            try {
                // Preenchemos os textos do modal com a informação guardada no botão
                document.getElementById('detalhe-hist-nome').innerHTML = `🐾 Animal: <span style="font-weight:normal;">${btnVer.getAttribute('data-nome')}</span>`;
                document.getElementById('detalhe-hist-data').innerHTML = `📅 Data: <span style="font-weight:normal;">${btnVer.getAttribute('data-data')}</span>`;
                document.getElementById('detalhe-hist-motivo').innerHTML = `💉 Serviço: <span style="font-weight:normal;">${btnVer.getAttribute('data-motivo')}</span>`;
                document.getElementById('detalhe-hist-medico').innerHTML = `👨‍⚕️ Profissional: <span style="font-weight:normal;">${btnVer.getAttribute('data-medico')}</span>`;
                document.getElementById('detalhe-hist-preco').innerHTML = `💰 Faturado: <span style="font-weight:normal;">${btnVer.getAttribute('data-preco')}</span>`;
                
                // Exibir a janela (FORÇANDO O CSS A OBEDECER)
                modalHistorico.style.display = 'flex';
                modalHistorico.style.opacity = '1'; 
                modalHistorico.style.visibility = 'visible'; 
                document.body.style.overflow = 'hidden'; 

            } catch (erro) {
                console.error(erro);
            }
        }
    });

    // Eventos para fechar o Modal "Ver"
    if (modalHistorico) {
        // Fechar no X
        modalHistorico.querySelector('.fechar-modal-historico').addEventListener('click', () => {
            modalHistorico.style.display = 'none';
            modalHistorico.style.opacity = '0';
            modalHistorico.style.visibility = 'hidden';
            document.body.style.overflow = '';
        });

        // Fechar clicando fora da caixa
        modalHistorico.addEventListener('click', (e) => {
            if (e.target === modalHistorico) {
                modalHistorico.style.display = 'none';
                modalHistorico.style.opacity = '0';
                modalHistorico.style.visibility = 'hidden';
                document.body.style.overflow = '';
            }
        });

        // Botão Agendar Novamente (dentro da janela)
        modalHistorico.querySelector('.btn-repetir-modal').addEventListener('click', () => {
            window.location.href = "consultas_cliente.html";
        });
    }

    // ==========================================================================
    // --- 4. FILTROS LATERAIS ---
    // ==========================================================================
    const botoesFiltro = document.querySelectorAll('.filtros button');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            const agora = new Date();
            const filtro = btn.innerText.toLowerCase();
            
            let filtrados = listaCompletaHistorico;

            if (filtro === 'últimos 7 dias') {
                const seteDiasAtras = new Date();
                seteDiasAtras.setDate(agora.getDate() - 7);
                filtrados = listaCompletaHistorico.filter(i => i.data >= seteDiasAtras);
            } else if (filtro === 'último mês') {
                const mesAtras = new Date();
                mesAtras.setMonth(agora.getMonth() - 1);
                filtrados = listaCompletaHistorico.filter(i => i.data >= mesAtras);
            }

            renderizarHistorico(filtrados);
        });
    });

    // Iniciar a página
    carregarHistorico();
});
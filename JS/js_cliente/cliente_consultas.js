document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Apanhar o objeto completo
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    let idClienteLogado = null;

    if (dadosLoginStr) {
        // Converter o texto de volta para objeto JavaScript
        const dadosLogin = JSON.parse(dadosLoginStr);
        // Ir buscar apenas o ID
        idClienteLogado = dadosLogin.id_cliente;
    }

    console.log("ID do cliente extraído com sucesso:", idClienteLogado);

    if (!idClienteLogado) {
        console.error("ERRO: Não foi possível encontrar o ID dentro do objeto utilizadorLogado!");
        document.getElementById('container-consultas').innerHTML = '<p style="color: red;">Erro: Não foi possível identificar o utilizador.</p>';
        return;
    }
    
    const urlApiConsultas = `http://localhost:8008/api/consultas/cliente/${idClienteLogado}`;

    const containerConsultas = document.getElementById('container-consultas');

    // ==========================================================================
    // 1. CARREGAR CONSULTAS DA BASE DE DADOS (API)
    // ==========================================================================
    async function carregarConsultasReais() {
        if (!containerConsultas) return;

        try {
            const resposta = await fetch(urlApiConsultas);
            
            if (!resposta.ok) {
                containerConsultas.innerHTML = '<p style="color: white; padding-left: 20px;">Ainda não tem consultas marcadas ou a API não está ligada.</p>';
                return;
            }

            const resultado = await resposta.json();
            const consultas = resultado.data;

            containerConsultas.innerHTML = ''; // Limpa o texto "A carregar..."

            if (!consultas || consultas.length === 0) {
                containerConsultas.innerHTML = '<p style="color: white; padding-left: 20px;">Não tem consultas marcadas.</p>';
                return;
            }

            const dataAtual = new Date();

            consultas.forEach(consulta => {
                const dataConsulta = new Date(consulta.data_hora); 
                
                let status = "futura";
                let botoesAcao = `
                    <button class="btn btn-detalhes">Ver</button>
                    <button class="btn btn-editar">Remarcar</button>
                    <button class="btn btn-cancelar">Cancelar</button>
                `;

                if (dataConsulta < dataAtual) {
                    status = "passada";
                    botoesAcao = `
                        <button class="btn btn-detalhes">Ver</button>
                        <button class="btn btn-repetir">Repetir</button>
                    `;
                }

                const diaMes = dataConsulta.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
                const hora = dataConsulta.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

                const section = document.createElement('section');
                section.className = 'consulta';
                section.setAttribute('data-status', status);
                section.innerHTML = `
                    <div class="info">
                        <p class="nome">🐾 ${consulta.nome_animal}</p>
                        <p>📅 ${diaMes} - ${hora}</p>
                        <p>💉 ${consulta.motivo}</p>
                        <p class="medico-escondido" style="display:none;">${consulta.nome_veterinario}</p> 
                    </div>
                    <div class="acoes">
                        ${botoesAcao}
                    </div>
                `;

                containerConsultas.appendChild(section);
            });

            // Após criar as consultas, reaplica o filtro que estiver ativo
            aplicarFiltroAtivo();

        } catch (erro) {
            console.error("Erro ao carregar consultas:", erro);
            containerConsultas.innerHTML = '<p style="color: #e74c3c; padding-left: 20px;">Erro ao ligar ao servidor.</p>';
        }
    }

    // Chama a função mal a página abre!
    if (idClienteLogado) {
        carregarConsultasReais();
    }


    // ==========================================================================
    // 2. LÓGICA DA JANELA DE MARCAR CONSULTA
    // ==========================================================================
    const modalConsulta = document.getElementById('modal-nova-consulta');
    const btnAbrirModal = document.getElementById('btn-abrir-modal-consulta');
    const btnConfirmar = document.getElementById('btn-confirmar-consulta');

    if (modalConsulta && btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            modalConsulta.classList.add('ativo');
            document.body.classList.add('no-scroll');
        });

        modalConsulta.querySelector('.fechar-modal-consulta').addEventListener('click', () => {
            modalConsulta.classList.remove('ativo');
            document.body.classList.remove('no-scroll');
        });

        modalConsulta.addEventListener('click', (e) => { 
            if (e.target === modalConsulta) {
                modalConsulta.classList.remove('ativo');
                document.body.classList.remove('no-scroll');
            }
        });

        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                alert("Pedido de consulta enviado com sucesso!");
                modalConsulta.classList.remove('ativo');
                document.body.classList.remove('no-scroll');
                // Aqui no futuro podes fazer um fetch(POST) para guardar a consulta na BD!
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
    // 4. AÇÕES DOS BOTÕES DAS CONSULTAS GERADAS (Delegação de Eventos)
    // ==========================================================================
    const modalDetalhes = document.getElementById('modal-detalhes-consulta');
    const detalheNome = document.getElementById('detalhe-nome');
    const detalheData = document.getElementById('detalhe-data');
    const detalheMotivo = document.getElementById('detalhe-motivo');

    if (containerConsultas) {
        containerConsultas.addEventListener('click', function(e) {
            const botao = e.target;
            const cartaoConsulta = botao.closest('.consulta');
            if (!cartaoConsulta) return;

            // CANCELAR
            if (botao.classList.contains('btn-cancelar')) {
                const confirmacao = confirm("Tem a certeza que deseja cancelar esta consulta?");
                if (confirmacao) {
                    cartaoConsulta.style.opacity = '0';
                    setTimeout(() => { cartaoConsulta.remove(); }, 300);
                    // Futuro: fetch(DELETE) para apagar da base de dados
                }
            }

            // REMARCAR
            if (botao.classList.contains('btn-editar')) {
                alert("A redirecionar para o calendário de remarcações...");
            }

            // REPETIR
            if (botao.classList.contains('btn-repetir')) {
                if (modalConsulta) {
                    modalConsulta.classList.add('ativo');
                    document.body.classList.add('no-scroll');
                }
            }

            // VER DETALHES (Abrir Modal)
            if (botao.classList.contains('btn-detalhes')) {
                cartaoSendoVistoRef = cartaoConsulta; 

                const infoParagrafos = cartaoConsulta.querySelectorAll('.info p');
                detalheNome.innerText = infoParagrafos[0].innerText.replace('🐾 ', '');
                detalheData.innerText = infoParagrafos[1].innerText.replace('📅 ', '');
                detalheMotivo.innerText = infoParagrafos[2].innerText.replace('💉 ', '');
                
                // O NOSSO NOVO TRUQUE AQUI:
                const nomeMedico = infoParagrafos[3].innerText;
                const detalheMedico = modalDetalhes.querySelector('.detalhes-info p:nth-child(5)'); // Apanha a linha do médico
                if (detalheMedico) {
                    detalheMedico.innerHTML = `<strong>Médico(a) Veterinário(a):</strong> ${nomeMedico}`;
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
                const confirmacao = confirm("Tem a certeza que deseja cancelar esta consulta?");
                if (confirmacao && cartaoSendoVistoRef) {
                    modalDetalhes.classList.remove('ativo');
                    document.body.classList.remove('no-scroll');

                    cartaoSendoVistoRef.style.opacity = '0';
                    setTimeout(() => { cartaoSendoVistoRef.remove(); }, 300);

                    alert("Consulta cancelada com sucesso!");
                    cartaoSendoVistoRef = null; 
                }
            });
        }

        if (btnRemarcarNoModal) {
            btnRemarcarNoModal.addEventListener('click', () => {
                if (cartaoSendoVistoRef) {
                    modalDetalhes.classList.remove('ativo');
                    if (modalConsulta) {
                        modalConsulta.classList.add('ativo');
                    }
                    cartaoSendoVistoRef = null;
                }
            });
        }
    }
});
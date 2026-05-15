document.addEventListener('DOMContentLoaded', function() {
    
    // Esta variável vai guardar a referência do cartão que o utilizador está a "Ver"
    // para que as ações dentro do modal de detalhes saibam qual consulta modificar.
    let cartaoSendoVistoRef;

    // ==========================================================================
    // 1. LÓGICA DA JANELA (MODAL) DE MARCAR CONSULTA
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
            });
        }
    }

    // ==========================================================================
    // 2. LÓGICA DOS FILTROS INTELIGENTES (Todas / Futuras / Passadas)
    // ==========================================================================
    const botoesFiltro = document.querySelectorAll('.filtro-btn');
    const cartoesConsulta = document.querySelectorAll('.consulta');

    if (botoesFiltro.length > 0 && cartoesConsulta.length > 0) {
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');

                const filtroEscolhido = this.getAttribute('data-filtro');

                cartoesConsulta.forEach(cartao => {
                    const statusCartao = cartao.getAttribute('data-status');
                    if (filtroEscolhido === 'todas' || filtroEscolhido === statusCartao) {
                        cartao.style.display = 'flex';
                    } else {
                        cartao.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==========================================================================
    // 3. AÇÕES DOS BOTÕES DENTRO DOS CARTÕES DA LISTA (Cancelar, Repetir, Remarcar)
    // ==========================================================================

    // CANCELAR na lista principal
    const botoesCancelar = document.querySelectorAll('.btn-cancelar:not(.btn-bloco)');
    botoesCancelar.forEach(botao => {
        botao.addEventListener('click', function() {
            const confirmacao = confirm("Tem a certeza que deseja cancelar esta consulta?");
            if (confirmacao) {
                const cartaoConsulta = this.closest('.consulta');
                cartaoConsulta.style.opacity = '0';
                setTimeout(() => { cartaoConsulta.remove(); }, 300);
            }
        });
    });

    // REPETIR na lista principal
    const botoesRepetir = document.querySelectorAll('.btn-repetir');
    botoesRepetir.forEach(botao => {
        botao.addEventListener('click', function() {
            if (modalConsulta) {
                modalConsulta.classList.add('ativo');
                document.body.classList.add('no-scroll');
            }
        });
    });

    // REMARCAR na lista principal
    const botoesRemarcar = document.querySelectorAll('.btn-editar:not(.btn-bloco)');
    botoesRemarcar.forEach(botao => {
        botao.addEventListener('click', function() {
            alert("A redirecionar para o calendário de remarcações...");
        });
    });

    // ==========================================================================
    // 4. AÇÃO: VER DETALHES (O Novo Modal e as suas ações internas)
    // ==========================================================================
    const botoesVer = document.querySelectorAll('.btn-detalhes');
    const modalDetalhes = document.getElementById('modal-detalhes-consulta');
    
    const detalheNome = document.getElementById('detalhe-nome');
    const detalheData = document.getElementById('detalhe-data');
    const detalheMotivo = document.getElementById('detalhe-motivo');

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

        // Abrir Modal de Detalhes e preencher
        botoesVer.forEach(botao => {
            botao.addEventListener('click', function() {
                const cartao = this.closest('.consulta');
                
                // --- TRUQUE ---
                // 1. Guardar a referência deste cartão específico
                cartaoSendoVistoRef = cartao; 
                // --------------

                const infoParagrafos = cartao.querySelectorAll('.info p');
                const nomeAnimal = infoParagrafos[0].innerText;
                const dataConsulta = infoParagrafos[1].innerText;
                const motivoConsulta = infoParagrafos[2].innerText;
                
                detalheNome.innerText = nomeAnimal;
                detalheData.innerText = dataConsulta;
                detalheMotivo.innerText = motivoConsulta;
                
                modalDetalhes.classList.add('ativo');
                document.body.classList.add('no-scroll');
            });
        });

        // ==================================================================
        // 5. NOVA LÓGICA: Ações dos Botões DENTRO do Modal de Detalhes
        // ==================================================================
        const btnCancelarNoModal = modalDetalhes.querySelector('.btn-cancelar.btn-bloco');
        const btnRemarcarNoModal = modalDetalhes.querySelector('.btn-editar.btn-bloco');

        // Ação: CANCELAR dentro do modal de detalhes
        if (btnCancelarNoModal) {
            btnCancelarNoModal.addEventListener('click', () => {
                const confirmacao = confirm("Tem a certeza que deseja cancelar esta consulta?");
                
                if (confirmacao && cartaoSendoVistoRef) {
                    // 1. Fechar o modal de detalhes
                    modalDetalhes.classList.remove('ativo');
                    document.body.classList.remove('no-scroll');

                    // 2. Remover o cartão correspondente na lista principal com animação
                    cartaoSendoVistoRef.style.opacity = '0';
                    setTimeout(() => { cartaoSendoVistoRef.remove(); }, 300);

                    alert("Consulta cancelada com sucesso!");
                    
                    // Limpar referência
                    cartaoSendoVistoRef = null; 
                }
            });
        }

        // Ação: REMARCAR dentro do modal de detalhes
        if (btnRemarcarNoModal) {
            btnRemarcarNoModal.addEventListener('click', () => {
                if (cartaoSendoVistoRef) {
                    // 1. Fechar o modal de detalhes
                    modalDetalhes.classList.remove('ativo');
                    // Mantemos o no-scroll pois vamos abrir outro modal

                    // 2. Abrir o modal principal de marcação (simulando reagendamento)
                    if (modalConsulta) {
                        modalConsulta.classList.add('ativo');
                        // No futuro, aqui poderíamos preencher o formulário automaticamente 
                        // com os dados do 'cartaoSendoVistoRef' ;)
                    }

                    // Limpar referência
                    cartaoSendoVistoRef = null;
                }
            });
        }
    }
});
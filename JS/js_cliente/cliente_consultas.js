document.addEventListener('DOMContentLoaded', function() {
    
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
    // 3. AÇÕES DOS BOTÕES DENTRO DOS CARTÕES (Cancelar, Repetir, Remarcar)
    // ==========================================================================

    // CANCELAR
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

    // REPETIR
    const botoesRepetir = document.querySelectorAll('.btn-repetir');
    botoesRepetir.forEach(botao => {
        botao.addEventListener('click', function() {
            if (modalConsulta) {
                modalConsulta.classList.add('ativo');
                document.body.classList.add('no-scroll');
            }
        });
    });

    // REMARCAR
    const botoesRemarcar = document.querySelectorAll('.btn-editar:not(.btn-bloco)');
    botoesRemarcar.forEach(botao => {
        botao.addEventListener('click', function() {
            alert("A redirecionar para o calendário de remarcações...");
        });
    });

    // ==========================================================================
    // 4. AÇÃO: VER DETALHES (O Novo Modal)
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

        botoesVer.forEach(botao => {
            botao.addEventListener('click', function() {
                const cartao = this.closest('.consulta');
                const infoParagrafos = cartao.querySelectorAll('.info p');
                
                // Extrai a informação
                const nomeAnimal = infoParagrafos[0].innerText;
                const dataConsulta = infoParagrafos[1].innerText;
                const motivoConsulta = infoParagrafos[2].innerText;
                
                // Injeta no Modal
                detalheNome.innerText = nomeAnimal;
                detalheData.innerText = dataConsulta;
                detalheMotivo.innerText = motivoConsulta;
                
                // Abre o Modal
                modalDetalhes.classList.add('ativo');
                document.body.classList.add('no-scroll');
            });
        });
    }
});
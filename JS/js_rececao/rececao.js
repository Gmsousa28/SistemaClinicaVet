// Função para mostrar o modal (muda de none para flex e bloqueia scroll)
function abrirModalResgates() {
    document.getElementById('modal-resgate').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Função para esconder o modal e devolver scroll
function fecharModalResgates() {
    document.getElementById('modal-resgate').style.display = 'none';
    document.body.style.overflow = '';
}

// A tua função da imagem automática
function mudarImagemResgates() {
    const selecao = document.getElementById('especie').value;
    const imagem = document.getElementById('foto-preview');

    const imgCao = "../../img/icone_cao.jpg";
    const imgGato = "../../img/icone_gato.jpg";

    if (selecao === 'cao') {
        imagem.src = imgCao;
    } else {
        imagem.src = imgGato;
    }
}

// Abre o pop-up do cliente e bloqueia scroll
function abrirModalCliente() {
    document.getElementById('modal-cliente').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fecha o pop-up do cliente e devolve scroll
function fecharModalCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
    document.body.style.overflow = '';
}

// Abre o pop-up do registo de presenças/atrasos e bloqueia scroll
function abrirModalRegisto(nomeVet, tipo) {
    // Preenche os campos bloqueados com os dados do botão
    document.getElementById('registo_vet_nome').value = nomeVet;
    document.getElementById('registo_tipo').value = tipo;
    
    // Muda a cor do texto do tipo (Verde para presença, Vermelho para atraso)
    const inputTipo = document.getElementById('registo_tipo');
    if (tipo === 'Atraso') {
        inputTipo.style.color = '#f39c12';
    } else {
        inputTipo.style.color = '#e74c3c';
    }

    // Mostra o modal
    document.getElementById('modal-registo-ponto').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fecha o pop-up do registo e devolve scroll
function fecharModalRegisto() {
    document.getElementById('modal-registo-ponto').style.display = 'none';
    document.body.style.overflow = '';
}

// LÓGICA DO MODAL DE ADOÇÃO (Validação Animal + Cliente)

// Funções para abrir e fechar o modal
function abrirModalAdocao() {
    const modal = document.getElementById('modal-adocao');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloqueia scroll
        // Limpar o formulário sempre que abre
        document.getElementById('form-formalizar-adocao').reset();
        document.getElementById('resultado_animal_resgate').innerHTML = '';
        document.getElementById('resultado_nif_dono').innerHTML = '';
        validarBotaoAdocao(false, false);
    }
}

function fecharModalAdocao() {
    const modal = document.getElementById('modal-adocao');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Devolve scroll
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const inputIdAnimal = document.getElementById('id_animal_resgate');
    const inputNifDono = document.getElementById('nif_novo_dono');
    const btnConfirmarAdocao = document.getElementById('btn-confirmar-adocao');

    // Só avança se o modal existir nesta página
    if (inputIdAnimal && inputNifDono) {
        
        // --- BASES DE DADOS SIMULADAS ---
        const animaisResgatadosDB = {
            "405": { nome: "Sem Nome", especie: "Cão • Sénior", img: "../../img/icone_cao.jpg" },
            "102": { nome: "Bolinha", especie: "Cão • Adulto", img: "../../img/icone_cao.jpg" },
            "55":  { nome: "Simba", especie: "Gato • Jovem", img: "../../img/icone_gato.jpg" }
        };

        const clientesDB = {
            "123456789": { nome: "João Silva", email: "joao.silva@email.com" },
            "987654321": { nome: "Ana Costa", email: "ana.costa@email.com" }
        };

        // --- VARIÁVEIS DE CONTROLO ---
        let animalValido = false;
        let clienteValido = false;

        // 1. Validar ID do Animal enquanto escreve
        inputIdAnimal.addEventListener('input', function() {
            const id = this.value.trim();
            const zonaResultado = document.getElementById('resultado_animal_resgate');
            
            if (id.length > 0) {
                if (animaisResgatadosDB[id]) {
                    const animal = animaisResgatadosDB[id];
                    this.style.borderColor = "#2ea89c";
                    zonaResultado.innerHTML = `
                        <div style="background-color: #e0f2f1; padding: 10px; border-radius: 6px; display: flex; align-items: center; gap: 15px; border-left: 4px solid #2ea89c;">
                            <img src="${animal.img}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong style="color: #2c3e50; display: block;">${animal.nome}</strong>
                                <span style="font-size: 0.8rem; color: #7f8c8d;">${animal.especie}</span>
                            </div>
                            <span style="margin-left: auto; color: #2ea89c;"><i class="fa fa-check-circle"></i> Encontrado</span>
                        </div>
                    `;
                    animalValido = true;
                } else {
                    this.style.borderColor = "#e74c3c";
                    zonaResultado.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px;"><i class="fa fa-exclamation-triangle"></i> ID de animal não encontrado nos resgates ativos.</p>';
                    animalValido = false;
                }
            } else {
                this.style.borderColor = "#dcdde1";
                zonaResultado.innerHTML = '';
                animalValido = false;
            }
            validarBotaoAdocao(animalValido, clienteValido);
        });

        // 2. Validar NIF do Cliente enquanto escreve
        inputNifDono.addEventListener('input', function() {
            const nif = this.value.trim();
            const zonaResultado = document.getElementById('resultado_nif_dono');

            if (nif.length === 9) {
                if (clientesDB[nif]) {
                    const cliente = clientesDB[nif];
                    this.style.borderColor = "#2ea89c";
                    zonaResultado.innerHTML = `
                        <div style="background-color: #e0f2f1; padding: 10px; border-radius: 6px; border-left: 4px solid #2ea89c;">
                            <strong style="color: #2c3e50;"><i class="fa fa-user"></i> ${cliente.nome}</strong>
                            <p style="font-size: 0.8rem; color: #7f8c8d; margin-top: 3px;">Ficha de cliente associada com sucesso.</p>
                        </div>
                    `;
                    clienteValido = true;
                } else {
                    this.style.borderColor = "#e74c3c";
                    zonaResultado.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px;"><i class="fa fa-times-circle"></i> NIF não registado. O cliente deve ter ficha criada na clínica primeiro.</p>';
                    clienteValido = false;
                }
            } else {
                this.style.borderColor = (nif.length > 0) ? "#f39c12" : "#dcdde1";
                zonaResultado.innerHTML = (nif.length > 0 && nif.length < 9) ? '<p style="color: #f39c12; font-size: 0.85rem; margin-top: 5px;">A aguardar 9 dígitos...</p>' : '';
                clienteValido = false;
            }
            validarBotaoAdocao(animalValido, clienteValido);
        });

        // 3. Função que liga/desliga o botão final
        window.validarBotaoAdocao = function(animalOk, clienteOk) {
            if (animalOk && clienteOk) {
                btnConfirmarAdocao.disabled = false;
                btnConfirmarAdocao.style.opacity = "1";
                btnConfirmarAdocao.style.cursor = "pointer";
            } else {
                btnConfirmarAdocao.disabled = true;
                btnConfirmarAdocao.style.opacity = "0.5";
                btnConfirmarAdocao.style.cursor = "not-allowed";
            }
        }
        
        // 4. Ação do botão Final
        btnConfirmarAdocao.addEventListener('click', function() {
            alert("Sucesso! O animal foi associado ao NIF do novo dono. O processo será arquivado.");
            fecharModalAdocao();
        });
    }
});

// LÓGICA DO HISTÓRICO GERAL DE ADOÇÕES
function abrirModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloqueia scroll
    }
}

function fecharModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Devolve scroll
    }
}
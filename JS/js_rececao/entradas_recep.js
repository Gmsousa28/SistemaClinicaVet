// =======================================================
// GESTÃO DE ASSIDUIDADE - Clínica Miacãomigo
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    const containerVets = document.getElementById('container-veterinarios');
    
    // 1. Carregar os dados reais da API
    if (containerVets) {
        carregarVetsDaAPI(containerVets);
    }

    // 2. Listener Delegado para os botões de falta/atraso
    if (containerVets) {
        containerVets.addEventListener('click', (evento) => {
            if (evento.target.classList.contains('btn-ponto')) {
                const nomeVet = evento.target.getAttribute('data-nome');
                const tipoRegisto = evento.target.getAttribute('data-tipo');
                const idVet = evento.target.getAttribute('data-id');
                abrirModalRegisto(nomeVet, tipoRegisto, idVet);
            }
        });
    }

    // Listeners do Modal
    document.getElementById('btn-cancelar-registo')?.addEventListener('click', fecharModalRegisto);
    document.getElementById('btn-guardar-registo')?.addEventListener('click', guardarRegisto);
});

// =======================================================
// COMUNICAÇÃO COM O BACKEND
// =======================================================

async function carregarVetsDaAPI(container) {
    try {
        // Chamada à tua API na porta 8008
        const resposta = await fetch('http://localhost:8008/api/veterinarios');
        const resultado = await resposta.json();

        console.log("Dados recebidos da API:", resultado); // Para debug no F12

        if (resultado.status === 200) {
            renderizarVeterinarios(container, resultado.data);
        } else {
            container.innerHTML = `<p>Erro: ${resultado.message}</p>`;
        }
    } catch (erro) {
        console.error("Erro ao ligar à API:", erro);
        container.innerHTML = "<p style='color: gray;'>Não foi possível carregar a equipa médica. Verifica se o servidor está ativo.</p>";
    }
}

function renderizarVeterinarios(container, listaVets) {
    container.innerHTML = ''; 
    
    listaVets.forEach(vet => {
        // Criamos o cartão usando as tuas classes CSS e os dados do Postgres
        const cartaoHTML = `
            <div class="cartao-vet">
                <div class="icone-foto">
                    <i class="fa fa-user-doctor" style="font-size: 3.5rem; color: #2ea89c;"></i>
                </div>
                <h3>${vet.nome}</h3>
                <p class="especialidade">${vet.especialidade || 'Clínica Geral'}</p>
                
                <div class="acoes-ponto">
                    <button class="btn-ponto falta" 
                            data-nome="${vet.nome}" 
                            data-tipo="Falta" 
                            data-id="${vet.id_veterinario}">Registar Falta</button>
                    <button class="btn-ponto atraso" 
                            data-nome="${vet.nome}" 
                            data-tipo="Atraso" 
                            data-id="${vet.id_veterinario}">Registar Atraso</button>
                </div>
            </div>
        `;
        container.innerHTML += cartaoHTML;
    });
}

// =======================================================
// LÓGICA DO MODAL
// =======================================================

function abrirModalRegisto(nome, tipo, id) {
    const modal = document.getElementById('modal-registo-ponto');
    
    document.getElementById('registo_vet_nome').value = nome;
    document.getElementById('registo_tipo').value = tipo;
    document.getElementById('registo_data').valueAsDate = new Date();
    document.getElementById('registo_obs').value = '';

    // Guardamos o ID do veterinário no modal para o envio final
    modal.dataset.idSelecionado = id;

    modal.style.display = 'flex';
}

function fecharModalRegisto() {
    document.getElementById('modal-registo-ponto').style.display = 'none';
}

async function guardarRegisto() {
    const modal = document.getElementById('modal-registo-ponto');
    const id_vet = modal.dataset.idSelecionado;
    const tipo = document.getElementById('registo_tipo').value;
    const data = document.getElementById('registo_data').value;
    const obs = document.getElementById('registo_obs').value;

    if (!data) {
        alert('Por favor, indique a data da ocorrência.');
        return;
    }

    // Este é o objeto que vais enviar para a tua futura rota de assiduidade
    const dadosRegisto = {
        id_veterinario: id_vet,
        tipo: tipo,
        data: data,
        observacoes: obs
    };

    console.log("Pronto para gravar na BD:", dadosRegisto);
    
    // Por enquanto, apenas confirmamos o sucesso visualmente
    alert(`${tipo} registada com sucesso para o Dr(a). ${document.getElementById('registo_vet_nome').value}`);
    
    fecharModalRegisto();
}
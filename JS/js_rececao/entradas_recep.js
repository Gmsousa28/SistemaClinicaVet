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

    // 3. Listeners do Modal
    document.getElementById('btn-cancelar-registo')?.addEventListener('click', fecharModalRegisto);
    
    // Aqui usamos o ID correto do teu botão para chamar a função de gravar na BD
    document.getElementById('btn-guardar-registo')?.addEventListener('click', guardarRegistoBD);
});

// =======================================================
// COMUNICAÇÃO COM O BACKEND PARA CARREGAR MÉDICOS
// =======================================================

async function carregarVetsDaAPI(container) {
    try {
        const resposta = await fetch('http://localhost:8008/api/veterinarios');
        const resultado = await resposta.json();

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
        // Usa o id_colaborador ou id_veterinario dependendo de como está na tua BD
        const idParaGravar = vet.id_colaborador || vet.id_veterinario;

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
                            data-id="${idParaGravar}">Registar Falta</button>
                    <button class="btn-ponto atraso" 
                            data-nome="${vet.nome}" 
                            data-tipo="Atraso" 
                            data-id="${idParaGravar}">Registar Atraso</button>
                </div>
            </div>
        `;
        container.innerHTML += cartaoHTML;
    });
}

// =======================================================
// LÓGICA DO MODAL & INSERÇÃO NA BASE DE DADOS
// =======================================================

function abrirModalRegisto(nome, tipo, id) {
    const modal = document.getElementById('modal-registo-ponto');
    
    document.getElementById('registo_vet_nome').value = nome;
    document.getElementById('registo_tipo').value = tipo;
    
    // Põe a data de hoje por defeito de forma formatada (YYYY-MM-DD)
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('registo_data').value = hoje;
    
    document.getElementById('registo_obs').value = '';

    // Guardamos o ID do veterinário no modal para o envio final
    modal.dataset.idSelecionado = id;

    modal.style.display = 'flex';
}

function fecharModalRegisto() {
    document.getElementById('modal-registo-ponto').style.display = 'none';
}

async function guardarRegistoBD() {
    const modal = document.getElementById('modal-registo-ponto');
    
    const id_vet = modal.dataset.idSelecionado;
    const tipo = document.getElementById('registo_tipo').value;
    const data = document.getElementById('registo_data').value;
    const obs = document.getElementById('registo_obs').value;

    if (!data) return alert('Por favor, indique a data da ocorrência.');
    if (!id_vet) return alert('Erro: Não foi possível identificar o médico.');

    // Construção do objeto para a API
    const dadosOcorrencia = {
        id_colaborador: id_vet,
        tipo: tipo,
        data_ocorrencia: data,
        observacoes: obs
    };

    console.log("A enviar para a BD:", dadosOcorrencia);

    try {
        // Fazemos o POST para a rota certa!
        const response = await fetch('http://localhost:8008/api/ocorrencias_laborais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosOcorrencia)
        });

        const result = await response.json();

        if (result.status === 201) {
            alert(result.message); // "Registo guardado com sucesso!"
            fecharModalRegisto();
        } else {
            // Se já tiver falta registada, mostra o aviso da BD
            alert(result.message); 
        }
    } catch (error) {
        console.error("Erro de comunicação:", error);
        alert("Erro ao comunicar com o servidor. Verifica a consola.");
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const containerVets = document.getElementById('container-veterinarios');
    
    // Carrega os veterinarios quando a pagina abre
    if (containerVets) {
        carregarVetsDaAPI(containerVets);
    }

    // Trata os cliques nos botoes de falta e atraso
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

    // Liga os botoes do modal de registo
    document.getElementById('btn-cancelar-registo')?.addEventListener('click', fecharModalRegisto);
    
    // Este botao grava a ocorrencia na base de dados
    document.getElementById('btn-guardar-registo')?.addEventListener('click', guardarRegistoBD);
});



// Carrega a lista de medicos a partir do backend
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
        // Usa o id que estiver disponivel na resposta da API
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



// Abre o modal com os dados do medico selecionado
function abrirModalRegisto(nome, tipo, id) {
    const modal = document.getElementById('modal-registo-ponto');
    
    document.getElementById('registo_vet_nome').value = nome;
    document.getElementById('registo_tipo').value = tipo;
    
    // Preenche a data de hoje por defeito no formato usado pelo input
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('registo_data').value = hoje;
    
    document.getElementById('registo_obs').value = '';

    // Guarda o id no modal para o envio final
    modal.dataset.idSelecionado = id;

    modal.style.display = 'flex';
}



function fecharModalRegisto() {
    document.getElementById('modal-registo-ponto').style.display = 'none';
}




async function guardarRegistoBD() {
    // Recolhe os dados do modal antes de enviar para a API
    const modal = document.getElementById('modal-registo-ponto');
    
    const id_vet = modal.dataset.idSelecionado;
    const tipo = document.getElementById('registo_tipo').value;
    const data = document.getElementById('registo_data').value;
    const obs = document.getElementById('registo_obs').value;

    if (!data) return alert('Por favor, indique a data da ocorrência.');
    if (!id_vet) return alert('Erro: Não foi possível identificar o médico.');

    // Objeto enviado para a rota de ocorrencias laborais
    const dadosOcorrencia = {
        id_colaborador: id_vet,
        tipo: tipo,
        data_ocorrencia: data,
        observacoes: obs
    };

    console.log("A enviar para a BD:", dadosOcorrencia);

    try {
        // Regista a ocorrencia no backend
        const response = await fetch('http://localhost:8008/api/ocorrencias_laborais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosOcorrencia)
        });

        const result = await response.json();

        if (result.status === 201) {
            alert(result.message); // registo guardado com sucesso
            fecharModalRegisto();
        } else {
            // Mostra o aviso devolvido pela base de dados
            alert(result.message); 
        }
    } catch (error) {
        console.error("Erro de comunicação:", error);
        alert("Erro ao comunicar com o servidor. Verifica a consola.");
    }
}

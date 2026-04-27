// =======================================================
// GESTÃO DE ASSIDUIDADE - Clínica Miacãomigo
// =======================================================

// 1. BASE DE DADOS SIMULADA (Pronto para receber da API)
const equipaMedicaBD = [
    { id: 1, nome: "Dr. Rui Silva", especialidade: "Cirurgia Geral", foto: "https://cdn-icons-png.flaticon.com/512/387/387561.png" },
    { id: 2, nome: "Dra. Ana Costa", especialidade: "Animais Exóticos", foto: "https://cdn-icons-png.flaticon.com/512/387/387569.png" },
    { id: 3, nome: "Dr. João Mendes", especialidade: "Clínica Geral", foto: "https://cdn-icons-png.flaticon.com/512/387/387561.png" }
    // Podes adicionar quantos quiseres aqui!
];

// 2. INICIALIZAÇÃO DA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Renderizar a lista de veterinários no ecrã
    const containerVets = document.getElementById('container-veterinarios');
    if (containerVets) {
        renderizarVeterinarios(containerVets, equipaMedicaBD);
    }

    // B. Listener Delegado para os botões "Registar Falta" e "Registar Atraso"
    // Colocamos o evento no container pai. É mais rápido e eficiente!
    if (containerVets) {
        containerVets.addEventListener('click', (evento) => {
            // Verifica se o elemento clicado é um botão de ponto
            if (evento.target.classList.contains('btn-ponto')) {
                // Vai buscar os dados que guardámos nos atributos HTML do botão
                const nomeVet = evento.target.getAttribute('data-nome');
                const tipoRegisto = evento.target.getAttribute('data-tipo');
                abrirModalRegisto(nomeVet, tipoRegisto);
            }
        });
    }

    // C. Listeners para os botões do Modal
    const btnCancelar = document.getElementById('btn-cancelar-registo');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharModalRegisto);
    }

    const btnGuardar = document.getElementById('btn-guardar-registo');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarRegisto);
    }
});

// =======================================================
// FUNÇÕES DE INTERFACE E LÓGICA
// =======================================================

// 3. Função para desenhar o HTML de cada veterinário
function renderizarVeterinarios(container, listaVets) {
    container.innerHTML = ''; // Limpa o container
    
    listaVets.forEach(vet => {
        // Criamos a estrutura HTML exata que tinhas originalmente
        const cartaoHTML = `
            <div class="cartao-vet">
                <img src="${vet.foto}" alt="Foto ${vet.nome}" class="foto-vet">
                <h3>${vet.nome}</h3>
                <p class="especialidade">${vet.especialidade}</p>
                
                <div class="acoes-ponto">
                    <button class="btn-ponto falta" data-nome="${vet.nome}" data-tipo="Falta">Registar Falta</button>
                    <button class="btn-ponto atraso" data-nome="${vet.nome}" data-tipo="Atraso">Registar Atraso</button>
                </div>
            </div>
        `;
        // Adiciona o cartão à grelha
        container.innerHTML += cartaoHTML;
    });
}

// 4. Lógica do Modal
function abrirModalRegisto(nome, tipo) {
    const modal = document.getElementById('modal-registo-ponto');
    
    // Preenche os campos automáticos do formulário
    document.getElementById('registo_vet_nome').value = nome;
    document.getElementById('registo_tipo').value = tipo;
    
    // Define a data de hoje como padrão na caixa de data
    document.getElementById('registo_data').valueAsDate = new Date();
    document.getElementById('registo_obs').value = ''; // Limpa as observações antigas

    // Mostra o modal
    modal.style.display = 'flex';
}

function fecharModalRegisto() {
    const modal = document.getElementById('modal-registo-ponto');
    modal.style.display = 'none';
}

// 5. Simular o envio para a API
function guardarRegisto() {
    const nome = document.getElementById('registo_vet_nome').value;
    const tipo = document.getElementById('registo_tipo').value;
    const data = document.getElementById('registo_data').value;
    const obs = document.getElementById('registo_obs').value;

    if (!data) {
        alert('Por favor, indique a data da ocorrência.');
        return;
    }

    // Aqui no futuro farás um fetch() ou axios.post() para a API
    const dadosParaEnviar = {
        funcionario: nome,
        ocorrencia: tipo,
        data: data,
        observacoes: obs
    };

    console.log("Dados prontos para a API:", dadosParaEnviar);
    alert(`${tipo} registado(a) com sucesso para ${nome}!`);
    
    fecharModalRegisto();
}
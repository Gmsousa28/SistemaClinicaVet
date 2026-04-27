// 1. BASE DE DADOS FICTÍCIA (Sem a parte dos Clientes!)
const dadosGerais = {
    funcionarios: [
        { nome: "Dr. Rui Silva", morada: "Porto", email: "rui@vet.pt", nif: "234567890", contacto: "912345678", cargo: "Veterinário (Cirurgia)" },
        { nome: "Dra. Ana Costa", morada: "Lisboa", email: "ana@vet.pt", nif: "245678901", contacto: "923456789", cargo: "Veterinário (Exóticos)" },
        { nome: "Marta Sousa", morada: "Gaia", email: "marta@rececao.pt", nif: "256789012", contacto: "934567890", cargo: "Rececionista" }
    ],
    faturas: [
        { cliente: "João Silva", animal: "Max", servico: "Consulta", valor: 45, data: "2026-04-01" },
        { cliente: "Maria Santos", animal: "Luna", servico: "Cirurgia", valor: 300, data: "2026-04-05"}
    ],
    ferias: [
        { nome: "Dr. Rui Silva", cargo: "Veterinário", inicio: "2026-08-01", fim: "2026-08-15", estado: "Aprovado" },
        { nome: "Marta Sousa", cargo: "Rececionista", inicio: "2026-12-24", fim: "2026-12-31", estado: "Pendente" }
    ],
    marcacoes: [
        { cliente: "João Silva", animal: "Max", data: "2026-04-10", hora: "14:30", tipo: "Vacinação", estado: "Confirmada" },
        { cliente: "Maria Santos", animal: "Luna", data: "2026-04-11", hora: "10:00", tipo: "Consulta Geral", estado: "Pendente" }
    ],
    resgates: [
        { especie: "Cão (Beagle)", data: "2026-03-15", estado: "Para Adoção", entidade: "Associação Patinhas" },
        { especie: "Gato (Siamês)", data: "2026-03-20", estado: "Em Tratamento", entidade: "Canil Municipal" }
    ]
};

// 2. FUNÇÃO PRINCIPAL DE CARREGAMENTO
function carregarDados() {
    console.log("Sistema MiACaoMiGo: A carregar painel administrativo...");

    const botoesAcao = (nome, tipo) => `
        <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="btn-pequeno" onclick="acaoEditar('${nome}', '${tipo}')" title="Editar">
                <i class="fa fa-edit"></i>
            </button>
            <button class="btn-pequeno" onclick="acaoEliminar('${nome}', '${tipo}')" title="Eliminar" style="background-color: #e74c3c; color: white; border: none; cursor: pointer;">
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `;

    // Renderizar Tabelas (Excluímos a tabelaClientes daqui)

    renderizarTabela('tabelaFuncionarios', dadosGerais.funcionarios, f => `
        <tr><td>${f.nome}</td><td>${f.morada}</td><td>${f.email}</td><td>${f.nif}</td><td>${f.contacto}</td><td>${f.cargo}</td><td>${botoesAcao(f.nome, 'Funcionário')}</td></tr>`);

    renderizarTabela('tabelaFaturas', dadosGerais.faturas, f => `
        <tr><td>${f.cliente}</td><td>${f.animal}</td><td>${f.servico}</td><td>${f.valor}€</td><td>${f.data}</td><td>${botoesAcao(f.cliente, 'Fatura')}</td></tr>`);

    renderizarTabela('tabelaFerias', dadosGerais.ferias, f => `
        <tr><td>${f.nome}</td><td>${f.cargo}</td><td>${f.inicio}</td><td>${f.fim}</td><td><span class="badge ${f.estado === 'Aprovado' ? 'concluido' : 'pendente'}">${f.estado}</span></td><td>${botoesAcao(f.nome, 'Férias')}</td></tr>`);

    renderizarTabela('tabelaMarcacoes', dadosGerais.marcacoes, m => `
        <tr><td>${m.cliente}</td><td>${m.animal}</td><td>${m.data}</td><td>${m.hora}</td><td>${m.tipo}</td><td>${botoesAcao(m.animal, 'Marcação')}</td></tr>`);

    renderizarTabela('tabelaResgates', dadosGerais.resgates, r => `
        <tr><td>${r.especie}</td><td>${r.data}</td><td><span class="badge pendente">${r.estado}</span></td><td>${botoesAcao(r.especie, 'Resgate')}</td></tr>`);
}

function renderizarTabela(id, lista, template) {
    const tab = document.getElementById(id);
    if (tab) tab.innerHTML = lista.map(template).join('');
}

// 3. LÓGICA DE EDIÇÃO E AUDITORIA
function acaoEditar(nome, tipo) {
    const modal = document.getElementById('modalEdicao');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('tituloEdicao').innerText = `Editar ${tipo}`;
        
        const inputNome = document.getElementById('editNome');
        if(inputNome) inputNome.value = nome;
        
        const inputInfo = document.getElementById('editInfo');
        if(inputInfo) inputInfo.value = ""; // Espaço para nova info
    }
}

function fecharModalEdicao() {
    const modal = document.getElementById('modalEdicao');
    if (modal) modal.style.display = 'none';
}

function salvarEdicao() {
    alert("Alteração guardada com sucesso!\n\n[PBD AUDITORIA]: Esta ação gerou um log na base de dados PostgreSQL.");
    fecharModalEdicao();
}

function acaoEliminar(nome, tipo) {
    const confirmar = confirm(`Deseja ELIMINAR ${tipo}: ${nome}?\n\nEsta ação será guardada nos logs de auditoria.`);
    if (confirmar) alert(`${tipo} removido. Log gerado com sucesso.`);
}


// =======================================================
// EDITAR OU CRIAR CLIENTE (MODAL 2) - NIF SEMPRE EDITÁVEL
// =======================================================
window.editarCliente = function(nif) {
    clienteEmEdicao = nif; 
    const titulo = document.getElementById('tituloEdicao');

    if (nif === 'novo') {
        titulo.innerText = "Registar Novo Cliente";
        document.getElementById('editNome').value = '';
        document.getElementById('editNif').value = ''; // Caixa limpa e livre
        document.getElementById('editEmail').value = '';
        document.getElementById('editContacto').value = '';
        document.getElementById('editMorada').value = '';
    } else {
        titulo.innerText = "Editar Cliente";
        const cliente = clientesBD.find(c => c.nif === nif);
        
        if (cliente) {
            document.getElementById('editNome').value = cliente.nome;
            document.getElementById('editNif').value = cliente.nif; // Caixa preenchida e livre
            document.getElementById('editEmail').value = cliente.email;
            document.getElementById('editContacto').value = cliente.contacto;
            document.getElementById('editMorada').value = cliente.morada;
        }
    }

    // E aqui garantimos que, caso o HTML tenha ficado trancado por engano, ele destranca!
    const caixaNif = document.getElementById('editNif');
    if (caixaNif) {
        caixaNif.readOnly = false;
        caixaNif.style.backgroundColor = '#f8f9fa'; // Volta ao fundo branco normal
        caixaNif.style.cursor = 'text'; // Volta ao cursor normal de escrita
    }

    document.getElementById('modalEdicao').style.display = 'flex';
};

// =======================================================
// CÁLCULO AUTOMÁTICO DE DURAÇÃO DE MARCAÇÕES
// =======================================================
function calcularHoraFim() {
    // 1. Vai buscar os valores das caixas
    const horaInicio = document.getElementById('editHoraMarcacao').value;
    const tipoServico = document.getElementById('editTipoMarcacao').value;
    const inputHoraFim = document.getElementById('editHoraFim');

    // Se ainda não houver hora ou tipo preenchido, não faz nada
    if (!horaInicio || !tipoServico || !inputHoraFim) return;

    // 2. Define os minutos com base no serviço escolhido
    let minutosAdicionais = 0;
    
    if (tipoServico === 'Vacinação') {
        minutosAdicionais = 30; // Vacinas demoram 30 min
    } 
    else if (tipoServico === 'Consulta Geral' || tipoServico === 'Banho e Tosquia') {
        minutosAdicionais = 60; // Consultas e Banhos demoram 1 hora (60 min)
    }

    // 3. Faz a matemática das horas
    const partesTempo = horaInicio.split(':');
    const horas = parseInt(partesTempo[0], 10);
    const minutos = parseInt(partesTempo[1], 10);

    // Usa o objeto de Data do Javascript para somar o tempo sem errar
    let dataCalculo = new Date();
    dataCalculo.setHours(horas, minutos + minutosAdicionais, 0);

    // Formata o resultado para ficar bonitinho (ex: 09:05 em vez de 9:5)
    const horasFinal = String(dataCalculo.getHours()).padStart(2, '0');
    const minutosFinal = String(dataCalculo.getMinutes()).padStart(2, '0');
    
    // 4. Escreve o resultado na caixa verde bloqueada
    inputHoraFim.value = `${horasFinal}:${minutosFinal}`;
}




window.onload = carregarDados;
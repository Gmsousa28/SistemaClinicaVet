// =======================================================
// BASE DE DADOS DE TESTE (Mock Data)
// =======================================================
let clientesBD = [
    {
        nif: "123456789",
        nome: "João Silva",
        contacto: "912 345 678",
        email: "joao.silva@email.com",
        morada: "Rua das Flores, nº 12, Porto",
        animais: [
            { nome: "Max", especie: "Cão", raca: "Labrador", dataNasc: "12/05/2018" },
            { nome: "Luna", especie: "Gato", raca: "Siamês", dataNasc: "04/10/2020" }
        ]
    },
    {
        nif: "987654321",
        nome: "Ana Costa",
        contacto: "965 432 198",
        email: "ana.costa@email.com",
        morada: "Avenida da Liberdade, nº 45, Lisboa",
        animais: [
            { nome: "Pipo", especie: "Ave", raca: "Papagaio", dataNasc: "01/01/2015" }
        ]
    }
];

// Variável para sabermos se estamos a editar alguém ou a criar um novo
let clienteEmEdicao = null;

// =======================================================
// INICIALIZAÇÃO DA PÁGINA
// =======================================================
document.addEventListener('DOMContentLoaded', function() {
    atualizarTabelaClientes(clientesBD);

    // Ligar a barra de pesquisa
    const barraPesquisa = document.getElementById('pesquisa_cliente');
    if (barraPesquisa) {
        barraPesquisa.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            const clientesFiltrados = clientesBD.filter(cliente => 
                cliente.nome.toLowerCase().includes(termo) || 
                cliente.nif.includes(termo) || 
                cliente.contacto.includes(termo)
            );
            atualizarTabelaClientes(clientesFiltrados);
        });
    }
});

// =======================================================
// DESENHAR A TABELA DE CLIENTES
// =======================================================
function atualizarTabelaClientes(listaClientes) {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpa a tabela antes de desenhar

    if (listaClientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    listaClientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #f1f2f6";
        
        tr.innerHTML = `
            <td style="padding: 15px 10px; font-weight: bold; color: var(--cor-base-escura);">${cliente.nome}</td>
            <td style="padding: 15px 10px;">${cliente.morada}</td>
            <td style="padding: 15px 10px;">${cliente.email}</td>
            <td style="padding: 15px 10px;">${cliente.nif}</td>
            <td style="padding: 15px 10px;">${cliente.contacto}</td>
            <td style="padding: 15px 10px; text-align: center;">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                    
                    <button style="background-color: #f0f2f5; color: #5c636a; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;" onclick="verCliente('${cliente.nif}')">
                        <i class="fa fa-eye"></i> Ver
                    </button>
                    
                    <button style="background-color: #f39c12; color: white; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;" onclick="editarCliente('${cliente.nif}')">
                        <i class="fa fa-edit"></i> Editar
                    </button>
                    
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =======================================================
// VER DETALHES DO CLIENTE E ANIMAIS (MODAL PREMIUM)
// =======================================================
window.verCliente = function(nif) {
    const cliente = clientesBD.find(c => c.nif === nif);
    if (!cliente) return;

    // 1. Preencher as caixas de leitura do Cliente
    const nifEl = document.getElementById('ver_nif');
    const nomeEl = document.getElementById('ver_nome');
    const emailEl = document.getElementById('ver_email');
    const contactoEl = document.getElementById('ver_contacto');
    const moradaEl = document.getElementById('ver_morada');

    if(nifEl) nifEl.value = cliente.nif;
    if(nomeEl) nomeEl.value = cliente.nome;
    if(emailEl) emailEl.value = cliente.email || 'Não fornecido';
    if(contactoEl) contactoEl.value = cliente.contacto;
    if(moradaEl) moradaEl.value = cliente.morada || 'Não fornecida';

    // 2. Desenhar os cartões bonitos dos Animais
    const listaAnimais = document.getElementById('listaAnimaisVisualizacao');
    if(listaAnimais) {
        listaAnimais.innerHTML = ''; // Limpa a lista anterior

        if (cliente.animais.length === 0) {
            listaAnimais.innerHTML = '<p style="color: #7f8c8d; font-style: italic; padding: 10px 0;">Este cliente não tem animais registados.</p>';
        } else {
            cliente.animais.forEach(animal => {
                
                // Escolhe um ícone diferente consoante a espécie
                let iconeUrl = '../../img/icone_cao.jpg'; // Ícone Cão
                if(animal.especie.toLowerCase() === 'gato') {
                    iconeUrl = '../../img/icone_gato.jpg'; // Ícone Gato
                } else if (animal.especie.toLowerCase() === 'outros') {
                    iconeUrl = '../../img/icone_outros.jpg'; // Ícone Outros
                }

                listaAnimais.innerHTML += `
                    <div class="cartao-animal-lista">
                        <img src="${iconeUrl}" alt="${animal.especie}" style="width: 55px; height: 55px; border-radius: 50%; margin-right: 15px; object-fit: cover">
                        <div style="display: flex; flex-direction: column;">
                            <strong style="color: var(--cor-base-escura); font-size: 1.1rem;">${animal.nome}</strong>
                            <span style="color: #7f8c8d; font-size: 0.85rem; margin-top: 3px;">
                                ${animal.especie} • ${animal.raca} • Nasc: ${animal.dataNasc}
                            </span>
                        </div>
                    </div>
                `;
            });
        }
    }

    // Abre o Modal e Bloqueia Scroll Traseiro
    document.getElementById('modalCliente').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// =======================================================
// EDITAR OU CRIAR CLIENTE (MODAL 2) - NIF SEMPRE EDITÁVEL
// =======================================================
window.editarCliente = function(nif) {
    clienteEmEdicao = nif; 
    const titulo = document.getElementById('tituloEdicao');

    if (nif === 'novo') {
        titulo.innerText = "Registar Novo Cliente";
        document.getElementById('editNome').value = '';
        document.getElementById('editNif').value = ''; 
        document.getElementById('editEmail').value = '';
        document.getElementById('editContacto').value = '';
        document.getElementById('editMorada').value = '';
    } else {
        titulo.innerText = "Editar Cliente";
        const cliente = clientesBD.find(c => c.nif === nif);
        
        if (cliente) {
            document.getElementById('editNome').value = cliente.nome;
            document.getElementById('editNif').value = cliente.nif; 
            document.getElementById('editEmail').value = cliente.email;
            document.getElementById('editContacto').value = cliente.contacto;
            document.getElementById('editMorada').value = cliente.morada;
        }
    }

    const caixaNif = document.getElementById('editNif');
    if (caixaNif) {
        caixaNif.readOnly = false;
        caixaNif.style.backgroundColor = '#f8f9fa'; 
        caixaNif.style.cursor = 'text'; 
    }

    // Abre o Modal e Bloqueia Scroll Traseiro
    document.getElementById('modalEdicao').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// =======================================================
// GUARDAR ALTERAÇÕES (FORMULÁRIO)
// =======================================================
window.salvarEdicao = function() {
    const nifInserido = document.getElementById('editNif').value;
    
    const dadosFormulario = {
        nif: nifInserido,
        nome: document.getElementById('editNome').value,
        email: document.getElementById('editEmail').value,
        contacto: document.getElementById('editContacto').value,
        morada: document.getElementById('editMorada').value,
        animais: [] 
    };

    if (clienteEmEdicao === 'novo') {
        if (clientesBD.some(c => c.nif === nifInserido)) {
            alert("Erro: Já existe um cliente com esse NIF!");
            return;
        }
        clientesBD.push(dadosFormulario);
        alert("Cliente registado com sucesso!");
        
    } else {
        const index = clientesBD.findIndex(c => c.nif === clienteEmEdicao);
        if (index !== -1) {
            dadosFormulario.animais = clientesBD[index].animais; 
            clientesBD[index] = dadosFormulario;
            alert("Dados guardados com sucesso!");
        }
    }

    // Fecha o Modal e Devolve Scroll Traseiro
    document.getElementById('modalEdicao').style.display = 'none';
    document.body.style.overflow = '';
    atualizarTabelaClientes(clientesBD);
};


// =======================================================
// FUNÇÕES PARA FECHAR MODAIS (Para usares nos botões X ou Cancelar)
// =======================================================
window.fecharModalVerCliente = function() {
    const modal = document.getElementById('modalCliente');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Devolve scroll
    }
};

window.fecharModalEdicaoCliente = function() {
    const modal = document.getElementById('modalEdicao');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Devolve scroll
    }
};
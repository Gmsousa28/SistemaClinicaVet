// =======================================================
// BASE DE DADOS DE TESTE E ESTADO (Pronto para API)
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

let clienteEmEdicao = null;

// =======================================================
// INICIALIZAÇÃO "MESTRE" E EVENT LISTENERS
// =======================================================
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Carregar a Tabela Inicial
    atualizarTabelaClientes(clientesBD);

    // 2. Listener da Barra de Pesquisa
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

    // 3. Listener Delegado para os botões "Ver" e "Editar" DENTRO da tabela
    const tbody = document.getElementById('tabelaClientes');
    if (tbody) {
        tbody.addEventListener('click', (evento) => {
            // Procura se clicámos num botão com a classe específica
            const btnVer = evento.target.closest('.btn-ver-cliente');
            const btnEditar = evento.target.closest('.btn-editar-cliente');

            if (btnVer) {
                const nif = btnVer.getAttribute('data-nif');
                verCliente(nif);
            }
            if (btnEditar) {
                const nif = btnEditar.getAttribute('data-nif');
                editarCliente(nif);
            }
        });
    }

    // 4. Listeners para os Modais e Formulários (Garante que tens estes IDs no HTML!)
    
    // Botão de Adicionar Novo Cliente (na página principal)
    const btnNovoCliente = document.getElementById('btn-novo-cliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', () => editarCliente('novo'));

    // Botão de Guardar Alterações (no modal de Edição)
    const btnSalvar = document.getElementById('btn-salvar-edicao');
    if (btnSalvar) btnSalvar.addEventListener('click', salvarEdicao);

    // Botões de fechar os Modais
    const btnFecharVerX = document.getElementById('btn-fechar-modal-x');
    if (btnFecharVerX) btnFecharVerX.addEventListener('click', fecharModalVerCliente);

    const btnFecharVerBaixo = document.getElementById('btn-fechar-modal-baixo');
    if (btnFecharVerBaixo) btnFecharVerBaixo.addEventListener('click', fecharModalVerCliente);

    // Botões de fechar o Modal "Editar Cliente" (Estes já estavam certos)
    const btnFecharEdicaoX = document.getElementById('btn-fechar-edicao-x');
    if (btnFecharEdicaoX) btnFecharEdicaoX.addEventListener('click', fecharModalEdicaoCliente);

    const btnFecharEdicaoBaixo = document.getElementById('btn-fechar-edicao-baixo');
    if (btnFecharEdicaoBaixo) btnFecharEdicaoBaixo.addEventListener('click', fecharModalEdicaoCliente);
});

// =======================================================
// LÓGICA DA INTERFACE E FUNÇÕES
// =======================================================

// DESENHAR A TABELA DE CLIENTES
function atualizarTabelaClientes(listaClientes) {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;

    tbody.innerHTML = ''; 

    if (listaClientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    listaClientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #f1f2f6";
        
        // Repara: Usamos classes e data-nif em vez de onclick!
        tr.innerHTML = `
            <td style="padding: 15px 10px; font-weight: bold; color: var(--cor-base-escura);">${cliente.nome}</td>
            <td style="padding: 15px 10px;">${cliente.morada}</td>
            <td style="padding: 15px 10px;">${cliente.email}</td>
            <td style="padding: 15px 10px;">${cliente.nif}</td>
            <td style="padding: 15px 10px;">${cliente.contacto}</td>
            <td style="padding: 15px 10px; text-align: center;">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                    <button class="btn-ver-cliente" data-nif="${cliente.nif}" style="background-color: #f0f2f5; color: #5c636a; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;">
                        <i class="fa fa-eye"></i> Ver
                    </button>
                    <button class="btn-editar-cliente" data-nif="${cliente.nif}" style="background-color: #f39c12; color: white; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;">
                        <i class="fa fa-edit"></i> Editar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// VER DETALHES DO CLIENTE
function verCliente(nif) {
    const cliente = clientesBD.find(c => c.nif === nif);
    if (!cliente) return;

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

    const listaAnimais = document.getElementById('listaAnimaisVisualizacao');
    if(listaAnimais) {
        listaAnimais.innerHTML = ''; 

        if (cliente.animais.length === 0) {
            listaAnimais.innerHTML = '<p style="color: #7f8c8d; font-style: italic; padding: 10px 0;">Este cliente não tem animais registados.</p>';
        } else {
            cliente.animais.forEach(animal => {
                let iconeUrl = '../../img/icone_cao.jpg'; 
                if(animal.especie.toLowerCase() === 'gato') {
                    iconeUrl = '../../img/icone_gato.jpg'; 
                } else if (animal.especie.toLowerCase() === 'outros') {
                    iconeUrl = '../../img/icone_outros.jpg'; 
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

    document.getElementById('modalCliente').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// EDITAR OU CRIAR CLIENTE
function editarCliente(nif) {
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

    document.getElementById('modalEdicao').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// GUARDAR ALTERAÇÕES
function salvarEdicao() {
    const nifInserido = document.getElementById('editNif').value;
    
    if(!nifInserido) return alert("O NIF é obrigatório!");

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

    fecharModalEdicaoCliente();
    atualizarTabelaClientes(clientesBD);
}

// FECHAR MODAIS
function fecharModalVerCliente() {
    const modal = document.getElementById('modalCliente');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
}

function fecharModalEdicaoCliente() {
    const modal = document.getElementById('modalEdicao');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
}
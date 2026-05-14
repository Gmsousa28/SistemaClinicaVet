// =======================================================
// BASE DE DADOS GLOBAL (Vem da API)
// =======================================================
let clientesGlobais = []; 
let clienteEmEdicao = null; 

// =======================================================
// INICIALIZAÇÃO "MESTRE" E EVENT LISTENERS
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚨 O ficheiro JS NOVO carregou com sucesso!");

    // 1. Carregar a Tabela Inicial a partir do Backend
    carregarClientesBD();

    // 2. Listener da Barra de Pesquisa
    const barraPesquisa = document.getElementById('pesquisa_cliente');
    if (barraPesquisa) {
        barraPesquisa.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            const clientesFiltrados = clientesGlobais.filter(cliente => 
                cliente.nome.toLowerCase().includes(termo) || 
                String(cliente.nif).includes(termo) || 
                String(cliente.contacto).includes(termo)
            );
            atualizarTabelaClientes(clientesFiltrados);
        });
    }

    // 3. Listener Delegado para os botões "Ver" e "Editar" DENTRO da tabela
    const tbody = document.getElementById('tabelaClientes');
    if (tbody) {
        tbody.addEventListener('click', (evento) => {
            const btnVer = evento.target.closest('.btn-ver-cliente');
            const btnEditar = evento.target.closest('.btn-editar-cliente');

            if (btnVer) {
                const id = btnVer.getAttribute('data-id');
                verCliente(Number(id));
            }
            if (btnEditar) {
                const id = btnEditar.getAttribute('data-id');
                editarCliente(Number(id));
            }
        });
    }

    // 4. Listeners para os Modais
    const btnNovoCliente = document.getElementById('btn-novo-cliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', () => editarCliente('novo'));

    const btnSalvar = document.getElementById('btn-salvar-edicao');
    if (btnSalvar) btnSalvar.addEventListener('click', salvarEdicao);

    // Botões de fechar os Modais
    const btnFecharVerX = document.getElementById('btn-fechar-modal-x');
    if (btnFecharVerX) btnFecharVerX.addEventListener('click', fecharModalVerCliente);

    const btnFecharVerBaixo = document.getElementById('btn-fechar-modal-baixo');
    if (btnFecharVerBaixo) btnFecharVerBaixo.addEventListener('click', fecharModalVerCliente);

    const btnFecharEdicaoX = document.getElementById('btn-fechar-edicao-x');
    if (btnFecharEdicaoX) btnFecharEdicaoX.addEventListener('click', fecharModalEdicaoCliente);

    const btnFecharEdicaoBaixo = document.getElementById('btn-fechar-edicao-baixo');
    if (btnFecharEdicaoBaixo) btnFecharEdicaoBaixo.addEventListener('click', fecharModalEdicaoCliente);
});

// =======================================================
// COMUNICAÇÃO COM O BACKEND E LÓGICA DA INTERFACE
// =======================================================

// CARREGAR DADOS DO BACKEND
async function carregarClientesBD() {
    console.log("A tentar ligar ao servidor para ir buscar os clientes...");
    try {
        const response = await fetch('http://localhost:8008/api/clientes'); 
        
        console.log("Resposta recebida do servidor:", response);
        const result = await response.json();

        if (result.status === 200) {
            console.log("Clientes recebidos:", result.data);
            clientesGlobais = result.data; 
            atualizarTabelaClientes(clientesGlobais);
        } else {
            console.error("Erro do backend:", result.message);
        }
    } catch (error) {
        console.error("Erro CRÍTICO ao carregar clientes da BD:", error);
    }
}

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
        
        tr.innerHTML = `
            <td style="padding: 15px 10px; font-weight: bold; color: var(--cor-base-escura);">${cliente.nome}</td>
            <td style="padding: 15px 10px;">${cliente.morada}</td>
            <td style="padding: 15px 10px;">${cliente.email}</td>
            <td style="padding: 15px 10px;">${cliente.nif}</td>
            <td style="padding: 15px 10px;">${cliente.contacto}</td>
            <td style="padding: 15px 10px; text-align: center;">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                    <button class="btn-ver-cliente" data-id="${cliente.id_cliente}" style="background-color: #f0f2f5; color: #5c636a; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;">
                        <i class="fa fa-eye"></i> Ver
                    </button>
                    <button class="btn-editar-cliente" data-id="${cliente.id_cliente}" style="background-color: #f39c12; color: white; border-radius: 20px; padding: 8px 18px; border: none; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-size: 0.95rem; transition: background 0.2s;">
                        <i class="fa fa-edit"></i> Editar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// VER DETALHES DO CLIENTE
function verCliente(id_cliente) {
    const cliente = clientesGlobais.find(c => c.id_cliente === id_cliente);
    if (!cliente) return;

    // Preencher campos
    document.getElementById('ver_nif').value = cliente.nif;
    document.getElementById('ver_nome').value = cliente.nome;
    document.getElementById('ver_email').value = cliente.email || 'Não fornecido';
    document.getElementById('ver_contacto').value = cliente.contacto;
    document.getElementById('ver_morada').value = cliente.morada || 'Não fornecida';

    const listaAnimais = document.getElementById('listaAnimaisVisualizacao');
    if(listaAnimais) {
        listaAnimais.innerHTML = '<p style="color: #7f8c8d; font-style: italic; padding: 10px 0;">Animais ainda não carregados da BD.</p>';
    }

    document.getElementById('modalCliente').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// EDITAR OU CRIAR CLIENTE (PREENCHER MODAL)
function editarCliente(id_cliente) {
    clienteEmEdicao = id_cliente; 
    const titulo = document.getElementById('tituloEdicao');
    const caixaNif = document.getElementById('editNif');

    if (id_cliente === 'novo') {
        titulo.innerText = "Registar Novo Cliente";
        document.getElementById('editNome').value = '';
        document.getElementById('editNif').value = ''; 
        document.getElementById('editEmail').value = '';
        document.getElementById('editContacto').value = '';
        document.getElementById('editMorada').value = '';
        
        caixaNif.readOnly = false;
        caixaNif.style.backgroundColor = '#f8f9fa'; 
    } else {
        titulo.innerText = "Editar Cliente";
        const cliente = clientesGlobais.find(c => c.id_cliente === id_cliente);
        
        if (cliente) {
            document.getElementById('editNome').value = cliente.nome;
            document.getElementById('editNif').value = cliente.nif; 
            document.getElementById('editEmail').value = cliente.email;
            document.getElementById('editContacto').value = cliente.contacto;
            document.getElementById('editMorada').value = cliente.morada;
            
            caixaNif.readOnly = true;
            caixaNif.style.backgroundColor = '#e9ecef'; 
        }
    }

    document.getElementById('modalEdicao').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// GUARDAR ALTERAÇÕES (MANDA PARA O BACKEND)
async function salvarEdicao() {
    const nifInserido = document.getElementById('editNif').value;
    if(!nifInserido) return alert("O NIF é obrigatório!");

    // Agora enviamos APENAS os dados do cliente. O "id_login_cliente" já lá não mora!
    const dadosFormulario = {
        nome: document.getElementById('editNome').value,
        morada: document.getElementById('editMorada').value,
        email: document.getElementById('editEmail').value,
        nif: nifInserido,
        contacto: document.getElementById('editContacto').value
    };

    try {
        let url = 'http://localhost:8008/api/clientes'; 
        let metodo = 'POST';

        if (clienteEmEdicao !== 'novo') {
            url = `http://localhost:8008/api/clientes/${clienteEmEdicao}`; 
            metodo = 'PUT';
        }

        console.log(`A enviar pedido ${metodo} para ${url}`, dadosFormulario);

        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFormulario)
        });

        const result = await response.json();

        if (result.status === 201 || result.status === 200) {
            alert(clienteEmEdicao === 'novo' ? "Cliente registado com sucesso!" : "Cliente atualizado com sucesso!");
            fecharModalEdicaoCliente();
            carregarClientesBD(); // Volta a carregar a tabela com o novo registo visível
        } else {
            alert("Erro da BD: " + result.message);
        }

    } catch (error) {
        console.error("Erro ao guardar cliente:", error);
        alert("Erro na comunicação com o servidor.");
    }
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
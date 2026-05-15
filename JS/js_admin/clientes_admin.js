// =======================================================
// CLIENTE EM EDIÇÃO
// =======================================================
let clienteEmEdicao = 'novo';

// =======================================================
// CARREGAR CLIENTES DA API
// =======================================================
async function carregarClientes() {

    try {

        const resposta = await fetch('http://localhost:8008/api/clientes');

        const dados = await resposta.json();

        const listaClientes = dados.data;

        const tabela = document.getElementById('tabelaClientes');

        if (!tabela) return;

        tabela.innerHTML = '';

        listaClientes.forEach(cliente => {

            tabela.innerHTML += `
                <tr>

                    <td>${cliente.nome}</td>

                    <td>${cliente.morada}</td>

                    <td>${cliente.email}</td>

                    <td>${cliente.nif}</td>

                    <td>${cliente.contacto}</td>

                    <td>

                        <div style="display: flex; gap: 8px; justify-content: center;">

                            <button 
                                class="btn-pequeno"
                                onclick="editarCliente(
                                    ${cliente.id_cliente},
                                    '${cliente.nome}',
                                    '${cliente.morada}',
                                    '${cliente.email}',
                                    '${cliente.nif}',
                                    '${cliente.contacto}'
                                )"
                                title="Editar"
                            >
                                <i class="fa fa-edit"></i>
                            </button>

                            <button 
                                class="btn-pequeno"
                                onclick="eliminarCliente(${cliente.id_cliente})"
                                title="Eliminar"
                                style="background-color: #e74c3c; color: white; border: none; cursor: pointer;"
                            >
                                <i class="fa fa-trash"></i>
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        });

    } catch (erro) {

        console.error('Erro ao carregar clientes:', erro);

        alert('Erro ao carregar clientes da API.');
    }
}

// =======================================================
// ABRIR MODAL NOVO CLIENTE
// =======================================================
function abrirModalNovoCliente() {

    clienteEmEdicao = 'novo';

    document.getElementById('tituloEdicao').innerText = 'Adicionar Cliente';

    document.getElementById('editNome').value = '';

    document.getElementById('editMorada').value = '';

    document.getElementById('editEmail').value = '';

    document.getElementById('editNif').value = '';

    document.getElementById('editContacto').value = '';

    document.getElementById('modalEdicao').style.display = 'flex';

    document.body.style.overflow = 'hidden';
}

// =======================================================
// EDITAR CLIENTE
// =======================================================
function editarCliente(id, nome, morada, email, nif, contacto) {

    clienteEmEdicao = id;

    const modal = document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'flex';

        document.body.style.overflow = 'hidden';

        document.getElementById('tituloEdicao').innerText = 'Editar Cliente';

        document.getElementById('editNome').value = nome;

        document.getElementById('editMorada').value = morada;

        document.getElementById('editEmail').value = email;

        document.getElementById('editNif').value = nif;

        document.getElementById('editContacto').value = contacto;
    }
}

// =======================================================
// FECHAR MODAL
// =======================================================
function fecharModalEdicao() {

    const modal = document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'none';

        document.body.style.overflow = '';
    }
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================
async function salvarEdicao() {

    const nome = document.getElementById('editNome').value;

    const morada = document.getElementById('editMorada').value;

    const email = document.getElementById('editEmail').value;

    const nif = document.getElementById('editNif').value;

    const contacto = document.getElementById('editContacto').value;

    try {

        let url = 'http://localhost:8008/api/clientes';

        let metodo = 'POST';

        // =======================================================
        // EDITAR CLIENTE
        // =======================================================
        if (clienteEmEdicao !== 'novo') {

            url = `http://localhost:8008/api/clientes/${clienteEmEdicao}`;

            metodo = 'PUT';
        }

        const resposta = await fetch(url, {

            method: metodo,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nome,
                morada,
                email,
                nif,
                contacto
            })
        });

        const dados = await resposta.json();

        alert(dados.message);

        fecharModalEdicao();

        carregarClientes();

    } catch (erro) {

        console.error(erro);

        alert('Erro ao guardar cliente.');
    }
}

// =======================================================
// ELIMINAR CLIENTE
// =======================================================
async function eliminarCliente(id) {

    const confirmar = confirm('Deseja eliminar este cliente?');

    if (!confirmar) return;

    try {

        const resposta = await fetch(
            `http://localhost:8008/api/clientes/${id}`,
            {
                method: 'DELETE'
            }
        );

        const dados = await resposta.json();

        alert(dados.message);

        carregarClientes();

    } catch (erro) {

        console.error(erro);

        alert('Erro ao eliminar cliente.');
    }
}

// =======================================================
// FECHAR MODAL EDIÇÃO CLIENTE
// =======================================================
function fecharModalEdicaoCliente() {

    const modal =
        document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'none';
    }

    document.body.style.overflow = '';
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarClientes;
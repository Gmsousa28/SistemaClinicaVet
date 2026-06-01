// =======================================================
// CLIENTE EM EDIÇÃO
// =======================================================
// Guarda o cliente que esta a ser editado.
// O valor 'novo' indica que o formulario esta a criar um cliente.
let clienteEmEdicao = 'novo';

// Guarda todos os clientes carregados da API.
// Esta lista tambem e usada para pesquisar sem chamar a API outra vez.
let listaClientes = [];

// =======================================================
// CARREGAR CLIENTES DA API
// =======================================================
// Vai buscar os clientes a API e mostra-os na tabela.
async function carregarClientes() {

    try {

        const resposta = await fetch('http://localhost:8008/api/clientes');

        const dados = await resposta.json();

        listaClientes = dados.data;

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
// PESQUISAR CLIENTES
// =======================================================
// Filtra os clientes pelo nome escrito na caixa de pesquisa.
function pesquisarClientes() {

    const textoPesquisa =
        document.getElementById('pesquisaClientes')
        .value
        .toLowerCase();

    const tabela =
        document.getElementById('tabelaClientes');

    if (!tabela) return;

    tabela.innerHTML = '';

    const clientesFiltrados =
        listaClientes.filter(cliente =>

            cliente.nome &&
            cliente.nome
                .toLowerCase()
                .includes(textoPesquisa)
        );

    clientesFiltrados.forEach(cliente => {

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
}

// =======================================================
// ABRIR MODAL NOVO CLIENTE
// =======================================================
// Abre o modal vazio para adicionar um novo cliente.
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
// Abre o modal com os dados do cliente escolhido.
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
// Fecha o modal de edicao e volta a permitir scroll na pagina.
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
// Guarda os dados do formulario.
// Se for um cliente novo, cria; se ja existir, atualiza.
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
// Elimina um cliente depois de confirmar com o utilizador.
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
// Fecha o modal de cliente quando o HTML chama esta funcao especifica.
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
// Carrega os clientes quando a pagina abre.
window.onload = carregarClientes;
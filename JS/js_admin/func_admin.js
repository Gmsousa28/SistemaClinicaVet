// =======================================================
// VARIÁVEIS GLOBAIS
// =======================================================
let funcionarioEmEdicao = 'novo';

let listaFuncionarios = [];

// =======================================================
// CARREGAR FUNCIONÁRIOS DA API
// =======================================================
async function carregarFuncionarios() {

    try {

        const resposta = await fetch('http://localhost:8008/api/funcionarios');

        const resultado = await resposta.json();

        listaFuncionarios = resultado.data;

        const tabela = document.getElementById('tabelaFuncionarios');

        if (!tabela) return;

        tabela.innerHTML = '';

        listaFuncionarios.forEach(funcionario => {

            tabela.innerHTML += `
            
                <tr>

                    <td>${funcionario.nome}</td>

                    <td>${funcionario.morada}</td>

                    <td>${funcionario.email}</td>

                    <td>${funcionario.nif}</td>

                    <td>${funcionario.contacto}</td>

                    <td>${funcionario.cargo}</td>

                    <td>
                    
                        <div style="display: flex; gap: 8px; justify-content: center;">

                            <button 
                                class="btn-pequeno"
                                onclick="editarFuncionario(${funcionario.id_funcionario})"
                                title="Editar"
                            >
                                <i class="fa fa-edit"></i>
                            </button>

                            <button 
                                class="btn-pequeno"
                                onclick="eliminarFuncionario(${funcionario.id_funcionario})"
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

        console.error('Erro ao carregar funcionários:', erro);

        alert('Erro ao carregar funcionários.');
    }
}

// =======================================================
// EDITAR FUNCIONÁRIO
// =======================================================
function editarFuncionario(id) {

    funcionarioEmEdicao = id;

    const funcionario = listaFuncionarios.find(
        f => f.id_funcionario == id
    );

    if (!funcionario) return;

    document.getElementById('tituloEdicao').innerText =
        'Editar Funcionário';

    document.getElementById('editNome').value =
        funcionario.nome || '';

    document.getElementById('editCargo').value =
        funcionario.cargo || '';

    document.getElementById('editEmail').value =
        funcionario.email || '';

    document.getElementById('editContacto').value =
        funcionario.contacto || '';

    document.getElementById('editNif').value =
        funcionario.nif || '';

    document.getElementById('editMorada').value =
        funcionario.morada || '';

    document.getElementById('modalEdicao').style.display =
        'flex';

    document.body.style.overflow = 'hidden';
}

// =======================================================
// NOVO FUNCIONÁRIO
// =======================================================
function abrirModalNovoFuncionario() {

    funcionarioEmEdicao = 'novo';

    document.getElementById('tituloEdicao').innerText =
        'Adicionar Funcionário';

    document.getElementById('editNome').value = '';

    document.getElementById('editCargo').value = '';

    document.getElementById('editEmail').value = '';

    document.getElementById('editContacto').value = '';

    document.getElementById('editNif').value = '';

    document.getElementById('editMorada').value = '';

    document.getElementById('modalEdicao').style.display =
        'flex';

    document.body.style.overflow = 'hidden';
}

// =======================================================
// FECHAR MODAL
// =======================================================
function fecharModalEdicao() {

    document.getElementById('modalEdicao').style.display =
        'none';

    document.body.style.overflow = '';
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================
async function salvarEdicao() {

    const dadosFuncionario = {

        nome: document.getElementById('editNome').value,

        morada: document.getElementById('editMorada').value,

        email: document.getElementById('editEmail').value,

        nif: document.getElementById('editNif').value,

        contacto: document.getElementById('editContacto').value,

        cargo: document.getElementById('editCargo').value
    };

    try {

        let url = 'http://localhost:8008/api/funcionarios';

        let metodo = 'POST';

        // =======================================================
        // EDITAR
        // =======================================================
        if (funcionarioEmEdicao !== 'novo') {

            url =
                `http://localhost:8008/api/funcionarios/${funcionarioEmEdicao}`;

            metodo = 'PUT';
        }

        const resposta = await fetch(url, {

            method: metodo,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(dadosFuncionario)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {

            throw new Error(resultado.message);
        }

        alert(resultado.message);

        fecharModalEdicao();

        carregarFuncionarios();

    } catch (erro) {

        console.error('Erro:', erro);

        alert('Erro ao guardar funcionário.');
    }
}

// =======================================================
// ELIMINAR FUNCIONÁRIO
// =======================================================
async function eliminarFuncionario(id) {

    const confirmar =
        confirm('Deseja eliminar este funcionário?');

    if (!confirmar) return;

    try {

        const resposta = await fetch(
            `http://localhost:8008/api/funcionarios/${id}`,
            {
                method: 'DELETE'
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {

            throw new Error(resultado.message);
        }

        alert(resultado.message);

        carregarFuncionarios();

    } catch (erro) {

        console.error('Erro:', erro);

        alert('Erro ao eliminar funcionário.');
    }
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarFuncionarios;
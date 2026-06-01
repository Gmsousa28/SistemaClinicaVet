// =======================================================
// LISTA DE RESGATES
// =======================================================
// Guarda todos os resgates carregados da API.
let listaResgates = [];

// Guarda o ID do resgate que esta a ser editado no modal.
let idResgateAtual = null;

// =======================================================
// CARREGAR RESGATES
// =======================================================
// Vai buscar os resgates a API e mostra-os na tabela.
async function carregarResgates() {

    try {

        const resposta = await fetch(
            'http://localhost:8008/api/resgates'
        );

        const resultado =
            await resposta.json();

        listaResgates =
            resultado.data;

        const tabela =
            document.getElementById(
                'tabelaResgates'
            );

        if (!tabela) return;

        tabela.innerHTML = '';

        listaResgates.forEach(resgate => {

            tabela.innerHTML += `

                <tr>

                    <td>
                        ${resgate.especie} - ${resgate.raca}
                    </td>

                    <td>
                        ${resgate.data_resgate
                            ? resgate.data_resgate.split('T')[0]
                            : '-'}
                    </td>

                    <td>

                        <span class="badge concluido">

                            ${resgate.estado || 'Ativo'}

                        </span>

                    </td>

                    <td>
                        Funcionário ID: ${resgate.id_funcionario}
                    </td>

                    <td>

                        <div style="
                            display: flex;
                            gap: 8px;
                            justify-content: center;
                        ">

                            <button
                                class="btn-pequeno"
                                onclick="editarResgate(${resgate.id_resgate})"
                                title="Editar"
                            >
                                <i class="fa fa-edit"></i>
                            </button>

                            <button
                                class="btn-pequeno"
                                onclick="eliminarResgate(${resgate.id_resgate})"
                                title="Eliminar"
                                style="
                                    background-color: #e74c3c;
                                    color: white;
                                    border: none;
                                    cursor: pointer;
                                "
                            >
                                <i class="fa fa-trash"></i>
                            </button>

                        </div>

                    </td>

                </tr>

            `;
        });

    } catch (erro) {

        console.error(
            'Erro ao carregar resgates:',
            erro
        );

        alert(
            'Erro ao carregar resgates.'
        );
    }
}

// =======================================================
// EDITAR RESGATE
// =======================================================
// Procura o resgate escolhido e preenche o modal com os seus dados.
function editarResgate(id) {

    const resgate =
        listaResgates.find(
            r => r.id_resgate == id
        );

    if (!resgate) return;

    idResgateAtual = id;

    const modal =
        document.getElementById(
            'modalEdicao'
        );

    if (modal) {

        modal.style.display =
            'flex';

        document.body.style.overflow =
            'hidden';
    }

    document.getElementById(
        'tituloEdicao'
    ).innerText =
        'Editar Resgate';

    // ESPÉCIE
    const inputNome =
        document.getElementById(
            'editNome'
        );

    if (inputNome) {

        inputNome.value =
            resgate.especie || '';
    }

    // ESTADO
    const inputEstado =
        document.getElementById(
            'editEstadoResgate'
        );

    if (inputEstado) {

        inputEstado.value =
            resgate.estado || 'Ativo';
    }

    // DATA
    const inputData =
        document.getElementById(
            'editDataResgate'
        );

    if (inputData) {

        inputData.value =
            resgate.data_resgate
                ? resgate.data_resgate.split('T')[0]
                : '';
    }
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================
// Guarda as alteracoes do resgate.
// Mantem os dados que nao sao editados neste modal.
async function salvarEdicao() {

    try {

        const resgateOriginal =
            listaResgates.find(
                r => r.id_resgate == idResgateAtual
            );

        if (!resgateOriginal) {

            alert(
                'Resgate não encontrado.'
            );

            return;
        }

        const resposta = await fetch(

            `http://localhost:8008/api/resgates/${idResgateAtual}`,

            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    // MANTER O ID ORIGINAL
                    id_animal:
                        resgateOriginal.id_animal,

                    id_funcionario:
                        resgateOriginal.id_funcionario,

                    data_resgate:
                        document.getElementById(
                            'editDataResgate'
                        ).value,

                    idade:
                        resgateOriginal.idade
                })
            }
        );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            console.error(resultado);

            throw new Error(
                resultado.message
            );
        }

        alert(
            'Resgate atualizado com sucesso!'
        );

        fecharModalEdicao();

        carregarResgates();

    } catch (erro) {

        console.error(
            'Erro ao atualizar resgate:',
            erro
        );

        alert(
            'Erro ao atualizar resgate.'
        );
    }
}

// =======================================================
// ELIMINAR RESGATE
// =======================================================
// Elimina um resgate depois de confirmar com o utilizador.
async function eliminarResgate(id) {

    const confirmar = confirm(
        'Deseja eliminar este resgate?'
    );

    if (!confirmar) return;

    try {

        const resposta = await fetch(

            `http://localhost:8008/api/resgates/${id}`,

            {
                method: 'DELETE'
            }
        );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                resultado.message
            );
        }

        alert(
            'Resgate eliminado com sucesso!'
        );

        carregarResgates();

    } catch (erro) {

        console.error(
            'Erro ao eliminar resgate:',
            erro
        );

        alert(
            'Erro ao eliminar resgate.'
        );
    }
}

// =======================================================
// FECHAR MODAL
// =======================================================
// Fecha o modal de edicao e volta a permitir scroll na pagina.
function fecharModalEdicao() {

    const modal =
        document.getElementById(
            'modalEdicao'
        );

    if (modal) {

        modal.style.display =
            'none';

        document.body.style.overflow =
            '';
    }
}

// =======================================================
// INICIAR
// =======================================================
// Carrega os resgates quando a pagina abre.
window.onload = carregarResgates;
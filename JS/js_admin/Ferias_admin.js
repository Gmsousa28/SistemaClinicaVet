// =======================================================
// LISTA DE FÉRIAS
// =======================================================
let listaFerias = [];
let idFeriasAtual = null;

// =======================================================
// CARREGAR FÉRIAS DA API
// =======================================================
async function carregarFerias() {

    try {

        const resposta = await fetch(
            'http://localhost:8008/api/ocorrencias_laborais'
        );

        const resultado = await resposta.json();

        listaFerias = resultado.data;

        const tabela =
            document.getElementById('tabelaFerias');

        if (!tabela) return;

        tabela.innerHTML = '';

        listaFerias.forEach(ferias => {

            tabela.innerHTML += `

                <tr>

                    <td>${ferias.id_colaborador}</td>

                    <td>${ferias.tipo}</td>

                    <td>${ferias.data_inicio.split('T')[0]}</td>

                    <td>${ferias.data_fim.split('T')[0]}</td>

                    <td>

                        <span class="badge ${
                            ferias.tipo === 'Aprovado'
                            ? 'concluido'
                            : 'pendente'
                        }">

                            ${ferias.tipo}

                        </span>

                    </td>

                    <td>

                        <div style="display: flex; gap: 8px; justify-content: center;">

                            <button
                                class="btn-pequeno"
                                onclick="editarFerias(${ferias.id_colaborador})"
                                title="Editar"
                            >
                                <i class="fa fa-edit"></i>
                            </button>

                            <button
                                class="btn-pequeno"
                                onclick="eliminarFerias(${ferias.id_colaborador})"
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

        console.error(
            'Erro ao carregar férias:',
            erro
        );

        alert('Erro ao carregar férias.');
    }
}

// =======================================================
// EDITAR FÉRIAS
// =======================================================
function editarFerias(id) {

    const ferias =
        listaFerias.find(
            f => f.id_colaborador == id
        );

    if (!ferias) return;

    idFeriasAtual = id;

    document.getElementById(
        'tituloEdicao'
    ).innerText = 'Editar Férias';

    document.getElementById(
        'editNome'
    ).value = ferias.id_colaborador;

    document.getElementById(
        'editEstadoFerias'
    ).value = ferias.tipo;

    document.getElementById(
        'editDataInicio'
    ).value =
        ferias.data_inicio.split('T')[0];

    document.getElementById(
        'editDataFim'
    ).value =
        ferias.data_fim.split('T')[0];

    document.getElementById(
        'modalEdicao'
    ).style.display = 'flex';

    document.body.style.overflow =
        'hidden';
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================
async function salvarEdicao() {

    const dados = {

        data_inicio:
            document.getElementById(
                'editDataInicio'
            ).value,

        data_fim:
            document.getElementById(
                'editDataFim'
            ).value,

        tipo:
            document.getElementById(
                'editEstadoFerias'
            ).value,

        observacoes: 'Atualizado'
    };

    try {

        const resposta = await fetch(

            `http://localhost:8008/api/ocorrencias_laborais/${idFeriasAtual}`,

            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify(dados)
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
            'Férias atualizadas com sucesso!'
        );

        fecharModalEdicao();

        carregarFerias();

    } catch (erro) {

        console.error(erro);

        alert(
            'Erro ao atualizar férias.'
        );
    }
}

// =======================================================
// ELIMINAR FÉRIAS
// =======================================================
async function eliminarFerias(id) {

    const confirmar = confirm(
        'Deseja eliminar estas férias?'
    );

    if (!confirmar) return;

    try {

        const resposta = await fetch(
            `http://localhost:8008/api/ocorrencias_laborais/${id}`,
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
            'Férias eliminadas com sucesso!'
        );

        carregarFerias();

    } catch (erro) {

        console.error(
            'Erro ao eliminar férias:',
            erro
        );

        alert(
            'Erro ao eliminar férias.'
        );
    }
}

// =======================================================
// FECHAR MODAL
// =======================================================
function fecharModalEdicao() {

    const modal =
        document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'none';

        document.body.style.overflow = '';
    }
}

// =======================================================
// INICIAR PÁGINA
// =======================================================
window.onload = carregarFerias;
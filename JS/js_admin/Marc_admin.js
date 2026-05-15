// =======================================================
// LISTA DE MARCAÇÕES
// =======================================================
let listaMarcacoes = [];

let idMarcacaoAtual = null;

// =======================================================
// CARREGAR MARCAÇÕES
// =======================================================
async function carregarMarcacoes() {

    try {

        const resposta = await fetch(
            'http://localhost:8008/api/consultas'
        );

        const resultado =
            await resposta.json();

        listaMarcacoes =
            resultado.data;

        const tabela =
            document.getElementById(
                'tabelaMarcacoes'
            );

        if (!tabela) return;

        tabela.innerHTML = '';

        listaMarcacoes.forEach(marcacao => {

            const dataConsulta =
                new Date(
                    marcacao.data_consulta
                );

            const data =
                dataConsulta.toLocaleDateString(
                    'pt-PT'
                );

            const hora =
                dataConsulta.toLocaleTimeString(
                    'pt-PT',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            tabela.innerHTML += `

                <tr>

                    <td>${marcacao.id_consulta}</td>

                    <td>${marcacao.id_animal}</td>

                    <td>${data}</td>

                    <td>${hora}</td>

                    <td>${marcacao.motivo || '-'}</td>

                    <td>

                        <span class="badge concluido">

                            ${marcacao.estado || 'Realizado'}

                        </span>

                    </td>

                    <td>

                        <div style="display: flex; gap: 8px; justify-content: center;">

                            <button 
                                class="btn-pequeno"
                                onclick="editarMarcacao(${marcacao.id_consulta})"
                                title="Editar"
                            >
                                <i class="fa fa-edit"></i>
                            </button>

                            <button 
                                class="btn-pequeno"
                                onclick="eliminarMarcacao(${marcacao.id_consulta})"
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
            'Erro ao carregar marcações:',
            erro
        );

        alert(
            'Erro ao carregar marcações.'
        );
    }
}

// =======================================================
// EDITAR MARCAÇÃO
// =======================================================
function editarMarcacao(id) {

    const marcacao =
        listaMarcacoes.find(
            m => m.id_consulta == id
        );

    if (!marcacao) return;

    idMarcacaoAtual = id;

    const modal =
        document.getElementById(
            'modalEdicao'
        );

    if (modal) {

        modal.style.display = 'flex';

        document.body.style.overflow =
            'hidden';
    }

    const dataConsulta =
        new Date(
            marcacao.data_consulta
        );

    const data =
        dataConsulta.toISOString().split('T')[0];

    const hora =
        dataConsulta.toTimeString().slice(0, 5);

    // PREENCHER NOME
    if (document.getElementById('editNome')) {

        document.getElementById(
            'editNome'
        ).value =
            `Animal ID: ${marcacao.id_animal}`;
    }

    // PREENCHER DATA
    if (document.getElementById('editDataMarcacao')) {

        document.getElementById(
            'editDataMarcacao'
        ).value = data;
    }

    // PREENCHER HORA
    if (document.getElementById('editHoraMarcacao')) {

        document.getElementById(
            'editHoraMarcacao'
        ).value = hora;
    }

    calcularHoraFim();
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================
async function salvarEdicao() {

    try {

        const marcacaoOriginal =
            listaMarcacoes.find(
                m => m.id_consulta == idMarcacaoAtual
            );

        if (!marcacaoOriginal) {

            alert(
                'Marcação não encontrada.'
            );

            return;
        }

        const data =
            document.getElementById(
                'editDataMarcacao'
            ).value;

        const hora =
            document.getElementById(
                'editHoraMarcacao'
            ).value;

        const data_consulta =
            `${data} ${hora}`;

        const resposta = await fetch(

            `http://localhost:8008/api/consultas/${idMarcacaoAtual}`,

            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    id_animal:
                        marcacaoOriginal.id_animal,

                    id_veterinario:
                        marcacaoOriginal.id_veterinario,

                    data_consulta,

                    motivo:
                        marcacaoOriginal.motivo || 'Consulta',

                    diagnostico:
                        marcacaoOriginal.diagnostico || '',

                    estado:
                        marcacaoOriginal.estado || 'Pendente',

                    preco:
                        marcacaoOriginal.preco || 0
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
            'Marcação atualizada com sucesso!'
        );

        fecharModalEdicao();

        carregarMarcacoes();

    } catch (erro) {

        console.error(
            'Erro ao atualizar marcação:',
            erro
        );

        alert(
            'Erro ao atualizar marcação.'
        );
    }
}

// =======================================================
// ELIMINAR MARCAÇÃO
// =======================================================
async function eliminarMarcacao(id) {

    const confirmar = confirm(
        'Deseja eliminar esta marcação?'
    );

    if (!confirmar) return;

    try {

        const resposta = await fetch(

            `http://localhost:8008/api/consultas/${id}`,

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
            'Marcação eliminada com sucesso!'
        );

        carregarMarcacoes();

    } catch (erro) {

        console.error(
            'Erro ao eliminar marcação:',
            erro
        );

        alert(
            'Erro ao eliminar marcação.'
        );
    }
}

// =======================================================
// FECHAR MODAL
// =======================================================
function fecharModalEdicao() {

    const modal =
        document.getElementById(
            'modalEdicao'
        );

    if (modal) {

        modal.style.display = 'none';

        document.body.style.overflow =
            '';
    }
}

// =======================================================
// CALCULAR HORA FIM
// =======================================================
function calcularHoraFim() {

    const horaInicioInput =
        document.getElementById(
            'editHoraMarcacao'
        );

    const inputHoraFim =
        document.getElementById(
            'editHoraFim'
        );

    const checkboxesMarcadas =
        document.querySelectorAll(
            'input[name="servico"]:checked'
        );

    if (
        !horaInicioInput ||
        !inputHoraFim
    ) return;

    const horaInicio =
        horaInicioInput.value;

    if (
        !horaInicio ||
        checkboxesMarcadas.length === 0
    ) {

        inputHoraFim.value = '';

        return;
    }

    let minutosTotais =
        checkboxesMarcadas.length * 30;

    const [
        strHoras,
        strMinutos
    ] = horaInicio.split(':');

    const horas =
        parseInt(strHoras, 10);

    const minutos =
        parseInt(strMinutos, 10);

    let dataCalculo =
        new Date();

    dataCalculo.setHours(
        horas,
        minutos + minutosTotais,
        0
    );

    const horasFinal =
        String(
            dataCalculo.getHours()
        ).padStart(2, '0');

    const minutosFinal =
        String(
            dataCalculo.getMinutes()
        ).padStart(2, '0');

    inputHoraFim.value =
        `${horasFinal}:${minutosFinal}`;
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarMarcacoes;
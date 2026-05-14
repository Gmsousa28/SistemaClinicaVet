// =======================================================
// BASE DE DADOS FICTÍCIA - MARCAÇÕES
// =======================================================
const listaMarcacoes = [
    {
        cliente: "João Silva",
        animal: "Max",
        data: "2026-04-10",
        hora: "14:30",
        tipo: "Vacinação",
        estado: "Confirmada"
    },
    {
        cliente: "Maria Santos",
        animal: "Luna",
        data: "2026-04-11",
        hora: "10:00",
        tipo: "Consulta Geral",
        estado: "Pendente"
    }
];

// =======================================================
// CARREGAR TABELA
// =======================================================
function carregarMarcacoes() {

    const tabela = document.getElementById('tabelaMarcacoes');

    if (!tabela) return;

    tabela.innerHTML = '';

    listaMarcacoes.forEach(marcacao => {

        tabela.innerHTML += `
            <tr>

                <td>${marcacao.cliente}</td>

                <td>${marcacao.animal}</td>

                <td>${marcacao.data}</td>

                <td>${marcacao.hora}</td>

                <td>${marcacao.tipo}</td>

                <td>
                    <span class="badge ${marcacao.estado === 'Confirmada' ? 'concluido' : 'pendente'}">
                        ${marcacao.estado}
                    </span>
                </td>

                <td>

                    <div style="display: flex; gap: 8px; justify-content: center;">

                        <button 
                            class="btn-pequeno"
                            onclick="editarMarcacao('${marcacao.animal}')"
                            title="Editar"
                        >
                            <i class="fa fa-edit"></i>
                        </button>

                        <button 
                            class="btn-pequeno"
                            onclick="eliminarMarcacao('${marcacao.animal}')"
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
// EDITAR MARCAÇÃO
// =======================================================
function editarMarcacao(animal) {

    const modal = document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'flex';

        document.body.style.overflow = 'hidden';

        document.getElementById('tituloEdicao').innerText = 'Editar Marcação';

        document.getElementById('editAnimal').value = animal;
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
function salvarEdicao() {

    alert("Marcação atualizada com sucesso!");

    fecharModalEdicao();
}

// =======================================================
// ELIMINAR MARCAÇÃO
// =======================================================
function eliminarMarcacao(animal) {

    const confirmar = confirm(`Deseja eliminar a marcação de ${animal}?`);

    if (confirmar) {

        alert("Marcação eliminada com sucesso!");
    }
}

// =======================================================
// CÁLCULO AUTOMÁTICO DA HORA FINAL
// =======================================================
function calcularHoraFim() {

    const horaInicioInput = document.getElementById('editHoraMarcacao');

    const inputHoraFim = document.getElementById('editHoraFim');

    const checkboxesMarcadas = document.querySelectorAll('input[name="servico"]:checked');

    if (!horaInicioInput || !inputHoraFim) return;

    const horaInicio = horaInicioInput.value;

    if (!horaInicio || checkboxesMarcadas.length === 0) {

        inputHoraFim.value = "";

        return;
    }

    let minutosTotais = checkboxesMarcadas.length * 30;

    const [strHoras, strMinutos] = horaInicio.split(':');

    const horas = parseInt(strHoras, 10);

    const minutos = parseInt(strMinutos, 10);

    let dataCalculo = new Date();

    dataCalculo.setHours(horas, minutos + minutosTotais, 0);

    const horasFinal = String(dataCalculo.getHours()).padStart(2, '0');

    const minutosFinal = String(dataCalculo.getMinutes()).padStart(2, '0');

    inputHoraFim.value = `${horasFinal}:${minutosFinal}`;
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarMarcacoes;
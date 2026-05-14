// =======================================================
// BASE DE DADOS FICTÍCIA - RESGATES
// =======================================================
const listaResgates = [
    {
        especie: "Cão (Beagle)",
        data: "2026-03-15",
        estado: "Para Adoção",
        entidade: "Associação Patinhas"
    },
    {
        especie: "Gato (Siamês)",
        data: "2026-03-20",
        estado: "Em Tratamento",
        entidade: "Canil Municipal"
    }
];

// =======================================================
// CARREGAR TABELA
// =======================================================
function carregarResgates() {

    const tabela = document.getElementById('tabelaResgates');

    if (!tabela) return;

    tabela.innerHTML = '';

    listaResgates.forEach(resgate => {

        tabela.innerHTML += `
            <tr>

                <td>${resgate.especie}</td>

                <td>${resgate.data}</td>

                <td>
                    <span class="badge ${resgate.estado === 'Para Adoção' ? 'concluido' : 'pendente'}">
                        ${resgate.estado}
                    </span>
                </td>

                <td>${resgate.entidade}</td>

                <td>

                    <div style="display: flex; gap: 8px; justify-content: center;">

                        <button 
                            class="btn-pequeno"
                            onclick="editarResgate('${resgate.especie}')"
                            title="Editar"
                        >
                            <i class="fa fa-edit"></i>
                        </button>

                        <button 
                            class="btn-pequeno"
                            onclick="eliminarResgate('${resgate.especie}')"
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
// EDITAR RESGATE
// =======================================================
function editarResgate(especie) {

    const modal = document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'flex';

        document.body.style.overflow = 'hidden';

        document.getElementById('tituloEdicao').innerText = 'Editar Resgate';

        document.getElementById('editNome').value = 'Outros';

        if (especie.includes('Cão')) {
            document.getElementById('editNome').value = 'Cão';
        }

        else if (especie.includes('Gato')) {
            document.getElementById('editNome').value = 'Gato';
        }
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

    alert("Resgate atualizado com sucesso!");

    fecharModalEdicao();
}

// =======================================================
// ELIMINAR RESGATE
// =======================================================
function eliminarResgate(especie) {

    const confirmar = confirm(`Deseja eliminar o resgate de ${especie}?`);

    if (confirmar) {

        alert("Resgate eliminado com sucesso!");
    }
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarResgates;
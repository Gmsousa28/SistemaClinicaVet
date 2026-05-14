// =======================================================
// BASE DE DADOS FICTÍCIA - FÉRIAS
// =======================================================
const listaFerias = [
    {
        nome: "Dr. Rui Silva",
        cargo: "Veterinário",
        inicio: "2026-08-01",
        fim: "2026-08-15",
        estado: "Aprovado"
    },
    {
        nome: "Marta Sousa",
        cargo: "Rececionista",
        inicio: "2026-12-24",
        fim: "2026-12-31",
        estado: "Pendente"
    }
];

// =======================================================
// CARREGAR TABELA
// =======================================================
function carregarFerias() {

    const tabela = document.getElementById('tabelaFerias');

    if (!tabela) return;

    tabela.innerHTML = '';

    listaFerias.forEach(ferias => {

        tabela.innerHTML += `
            <tr>

                <td>${ferias.nome}</td>

                <td>${ferias.cargo}</td>

                <td>${ferias.inicio}</td>

                <td>${ferias.fim}</td>

                <td>
                    <span class="badge ${ferias.estado === 'Aprovado' ? 'concluido' : 'pendente'}">
                        ${ferias.estado}
                    </span>
                </td>

                <td>

                    <div style="display: flex; gap: 8px; justify-content: center;">

                        <button 
                            class="btn-pequeno"
                            onclick="editarFerias('${ferias.nome}')"
                            title="Editar"
                        >
                            <i class="fa fa-edit"></i>
                        </button>

                        <button 
                            class="btn-pequeno"
                            onclick="eliminarFerias('${ferias.nome}')"
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
// EDITAR FÉRIAS
// =======================================================
function editarFerias(nome) {

    const modal = document.getElementById('modalEdicao');

    if (modal) {

        modal.style.display = 'flex';

        document.body.style.overflow = 'hidden';

        document.getElementById('tituloEdicao').innerText = 'Editar Férias';

        document.getElementById('editNome').value = nome;
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

    alert("Férias atualizadas com sucesso!");

    fecharModalEdicao();
}

// =======================================================
// ELIMINAR FÉRIAS
// =======================================================
function eliminarFerias(nome) {

    const confirmar = confirm(`Deseja eliminar as férias de ${nome}?`);

    if (confirmar) {

        alert("Férias eliminadas com sucesso!");
    }
}

// =======================================================
// INICIAR
// =======================================================
window.onload = carregarFerias;
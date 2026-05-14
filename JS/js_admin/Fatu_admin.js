// =======================================================
// DADOS FICTICIOS -  FATURAÇÃO
// =======================================================

const faturas = [
    {
        cliente: "João Silva",
        animal: "Max",
        servico: "Consulta",
        valor: 45,
        data: "2026-04-01"
    },
    {
        cliente: "Maria Santos",
        animal: "Luna",
        servico: "Cirurgia",
        valor: 300,
        data: "2026-04-05"
    }
];

// =======================================================
// CARREGAR TABELA
// =======================================================

function carregarFaturas() {

    const tabela = document.getElementById('tabelaFaturas');

    if (!tabela) return;

    tabela.innerHTML = faturas.map(fatura => `

        <tr>

            <td>${fatura.cliente}</td>

            <td>${fatura.animal}</td>

            <td>${fatura.servico}</td>

            <td>${fatura.valor}€</td>

            <td>${fatura.data}</td>

            <td>

                <div style="display: flex; gap: 8px; justify-content: center;">

                    <button
                        class="btn-pequeno"
                        onclick="eliminarFatura('${fatura.cliente}')"
                        title="Eliminar"
                        style="background-color: #e74c3c; color: white; border: none; cursor: pointer;"
                    >
                        <i class="fa fa-trash"></i>
                    </button>

                </div>

            </td>

        </tr>

    `).join('');
}

// =======================================================
// ELIMINAR FATURA
// =======================================================

function eliminarFatura(cliente) {

    const confirmar = confirm(
        `Deseja eliminar a fatura de ${cliente}?`
    );

    if (confirmar) {

        alert('Fatura eliminada com sucesso!');
    }
}

// =======================================================
// EDITAR FATURA
// =======================================================

function editarFatura(cliente) {

    document.getElementById('tituloEdicao').innerText =
        'Editar Fatura';

    document.getElementById('modalEdicao').style.display = 'flex';

    document.body.style.overflow = 'hidden';
}

// =======================================================
// FECHAR MODAL
// =======================================================

function fecharModalEdicao() {

    document.getElementById('modalEdicao').style.display = 'none';

    document.body.style.overflow = '';
}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================

function salvarEdicao() {

    alert('Alterações guardadas com sucesso!');

    fecharModalEdicao();
}

// =======================================================
// NOVA FATURA
// =======================================================

function abrirModalNovaFatura() {

    document.getElementById('tituloEdicao').innerText =
        'Adicionar Fatura';

    document.getElementById('modalEdicao').style.display = 'flex';

    document.body.style.overflow = 'hidden';
}

// =======================================================
// INICIAR PÁGINA
// =======================================================

window.onload = carregarFaturas;
// =======================================================
// LISTA DE FATURAS
// =======================================================
let listaFaturas = [];

// =======================================================
// CARREGAR FATURAS DA API
// =======================================================
async function carregarFaturas() {

    try {

        const resposta = await fetch(
            'http://localhost:8008/api/faturas'
        );

        const resultado = await resposta.json();

        listaFaturas = resultado.data;

        const tabela =
            document.getElementById('tabelaFaturas');

        if (!tabela) return;

        tabela.innerHTML = '';

        listaFaturas.forEach(fatura => {

            tabela.innerHTML += `

                <tr>

                    <td>${fatura.id_consulta || '-'}</td>

                    <td>${fatura.id_servicos || '-'}</td>

                    <td>${fatura.valor_total}€</td>

                    <td>${fatura.id_fatura}</td>

                </tr>

            `;
        });

    } catch (erro) {

        console.error(
            'Erro ao carregar faturas:',
            erro
        );

        alert('Erro ao carregar faturas.');
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
    }

    document.body.style.overflow = '';
}

// =======================================================
// INICIAR PÁGINA
// =======================================================
window.onload = carregarFaturas;
const API_BASE = "http://localhost:8008/api";

// Guarda o estado usado pela faturacao, carrinho e historico
let contasPendentesBD = [];
let historicoPagamentos = [];
let carrinhoAtual = [];
let contaSelecionada = null;

document.addEventListener('DOMContentLoaded', () => {
    // Carrega as contas que ainda estao por pagar
    const listaPendentes = document.getElementById('lista-pendentes');
    if (listaPendentes) carregarPendentes(listaPendentes);

    // Liga os botoes e inputs principais da pagina
    const btnAdd = document.getElementById('btn-add-produto');
    if (btnAdd) btnAdd.addEventListener('click', adicionarItem);

    const inputDesconto = document.getElementById('input-desconto-perc');
    if (inputDesconto) inputDesconto.addEventListener('input', atualizarTalao);

    document.querySelectorAll('.btn-checkout').forEach(btn => {
        btn.addEventListener('click', (evento) => {
            const metodo = evento.target.getAttribute('data-metodo') || evento.target.innerText;
            pagar(metodo);
        });
    });

    const tabelaFatura = document.getElementById('itens-fatura');
    if (tabelaFatura) {
        tabelaFatura.addEventListener('click', (evento) => {
            // O botao de lixo usa o indice do item no carrinho
            const btnLixo = evento.target.closest('.btn-lixo');
            if (btnLixo) removerItem(parseInt(btnLixo.getAttribute('data-index')));
        });
    }

    const btnAbrirHist = document.getElementById('btn-abrir-historico');
    if (btnAbrirHist) btnAbrirHist.addEventListener('click', abrirHistorico);

    const fecharModalHist = () => document.getElementById('modal-historico').style.display = 'none';

    const btnFecharIcon = document.getElementById('btn-fechar-historico-icon');
    if (btnFecharIcon) btnFecharIcon.addEventListener('click', fecharModalHist);

    const btnFecharBtn = document.getElementById('btn-fechar-historico-btn');
    if (btnFecharBtn) btnFecharBtn.addEventListener('click', fecharModalHist);
});

function escaparHTML(valor) {
    // Evita que valores vindos da base de dados sejam interpretados como HTML
    return String(valor ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function formatarMoeda(valor) {
    return Number(valor || 0).toFixed(2) + " €";
}

async function carregarPendentes(container) {
    try {
        // Vai buscar consultas ou servicos ainda nao liquidados
        const resposta = await fetch(`${API_BASE}/faturas/pendentes`);
        const resultado = await resposta.json();

        if (resultado.status !== 200) {
            throw new Error(resultado.message || "Erro ao carregar pendentes");
        }

        contasPendentesBD = resultado.data.map(conta => ({
            id: `${conta.tipo}-${conta.id_origem}`,
            tipo: conta.tipo,
            id_origem: conta.id_origem,
            id_fatura: conta.id_fatura,
            cliente: conta.cliente,
            nif: conta.nif,
            animal: conta.animal,
            servico: conta.servico,
            preco: Number(conta.preco || 0)
        }));

        renderizarListaPendentes(container);
    } catch (erro) {
        console.error("Erro ao carregar faturacao pendente:", erro);
        container.innerHTML = '<div class="loading-state" style="color: #e74c3c; padding: 20px 0;">Nao foi possivel carregar os pendentes da BD.</div>';
    }
}

function renderizarListaPendentes(container) {
    // Redesenha a lista lateral sempre com os dados atuais
    container.innerHTML = '';

    if (contasPendentesBD.length === 0) {
        container.innerHTML = '<div class="loading-state" style="color: #7f8c8d; font-style: italic; padding: 20px 0;">Nao existem consultas ou servicos por liquidar.</div>';
        return;
    }

    contasPendentesBD.forEach(conta => {
        const div = document.createElement('div');
        div.className = 'item-pendente';
        div.innerHTML = `
            <div>
                <strong style="color: #2c3e50; font-size: 1.1rem; display: block;">${escaparHTML(conta.cliente)}</strong>
                <span style="color: #7f8c8d; font-size: 0.85rem;">${escaparHTML(conta.animal)} - ${escaparHTML(conta.servico)}</span>
            </div>
            <div style="font-weight: bold; color: #e74c3c; font-size: 1.1rem; display: flex; align-items: center;">
                ${formatarMoeda(conta.preco)}
            </div>
        `;

        div.addEventListener('click', function() {
            document.querySelectorAll('.item-pendente').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            abrirConta(conta);
        });

        container.appendChild(div);
    });
}

function abrirConta(conta) {
    // Ao escolher uma conta, ela passa a ser a base do recibo atual
    contaSelecionada = conta;

    document.getElementById('cliente-nome').innerText = `Conta: ${conta.cliente}`;
    document.getElementById('cliente-info').innerText = `NIF: ${conta.nif} | Paciente: ${conta.animal}`;

    const zonaVenda = document.getElementById('zona-venda-direta');
    if (zonaVenda) zonaVenda.style.display = 'flex';

    const zonaDesc = document.getElementById('zona-desconto');
    if (zonaDesc) zonaDesc.style.display = 'flex';

    document.querySelectorAll('.btn-checkout').forEach(btn => btn.disabled = false);

    const boxDesconto = document.getElementById('input-desconto-perc');
    if (boxDesconto) boxDesconto.value = '';

    carrinhoAtual = [{ desc: conta.servico, preco: Number(conta.preco) }];
    atualizarTalao();
}

function adicionarItem() {
    // Adiciona produtos extra ao recibo antes do pagamento
    const selectBox = document.getElementById('select-produto');
    if (!selectBox || !selectBox.value) return alert("Selecione um produto primeiro.");

    const valorOpcao = parseFloat(selectBox.value);
    const descProduto = selectBox.options[selectBox.selectedIndex].text.split('(')[0].trim();

    carrinhoAtual.push({ desc: descProduto, preco: valorOpcao });
    atualizarTalao();
    selectBox.value = '';
}

function atualizarTalao() {
    try {
        // Recalcula subtotal, iva e total sempre que o carrinho muda
        const corpoTabela = document.getElementById('itens-fatura');
        if (!corpoTabela) return;

        corpoTabela.innerHTML = '';
        let totalProdutos = 0;

        carrinhoAtual.forEach((item, index) => {
            totalProdutos += item.preco;
            corpoTabela.innerHTML += `
                <tr class="linha-item-recibo">
                    <td><strong>${escaparHTML(item.desc)}</strong></td>
                    <td class="txt-dir">${formatarMoeda(item.preco)}</td>
                    <td style="text-align: right; width: 40px;">
                        <button type="button" class="btn-lixo" data-index="${index}" title="Remover item">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const boxDesconto = document.getElementById('input-desconto-perc');
        let percDesconto = 0;

        if (boxDesconto && boxDesconto.value !== '') {
            percDesconto = parseFloat(boxDesconto.value) || 0;
        }

        if (percDesconto > 100) percDesconto = 100;
        if (percDesconto < 0) percDesconto = 0;

        if (percDesconto > 0 && totalProdutos > 0) {
            const valorDesconto = totalProdutos * (percDesconto / 100);
            totalProdutos -= valorDesconto;

            corpoTabela.innerHTML += `
                <tr class="linha-item-recibo">
                    <td style="color: #e74c3c;"><i>Desconto (${percDesconto}%)</i></td>
                    <td class="txt-dir" style="color: #e74c3c;">-${formatarMoeda(valorDesconto)}</td>
                    <td></td>
                </tr>
            `;
        }

        const valorIva = totalProdutos > 0 ? totalProdutos - (totalProdutos / 1.23) : 0;
        const valorSubtotal = totalProdutos - valorIva;

        document.getElementById('subtotal').innerText = formatarMoeda(valorSubtotal);
        document.getElementById('iva').innerText = formatarMoeda(valorIva);
        document.getElementById('total-final').innerText = formatarMoeda(totalProdutos);
    } catch (erro) {
        console.error("Erro na matematica:", erro);
    }
}

function removerItem(index) {
    // Remove apenas o item escolhido e volta a calcular os totais
    carrinhoAtual.splice(index, 1);
    atualizarTalao();
}

async function pagar(metodo) {
    if (!contaSelecionada) return;

    // O backend recebe o valor final ja com descontos aplicados
    const valorTotalTexto = document.getElementById('total-final').innerText;
    const valorTotal = Number(valorTotalTexto.replace('€', '').replace(',', '.').trim());

    try {
        const resposta = await fetch(`${API_BASE}/faturas/pagar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: contaSelecionada.tipo,
                id_origem: contaSelecionada.id_origem,
                valor_total: valorTotal
            })
        });

        const resultado = await resposta.json();

        if (resultado.status !== 201) {
            throw new Error(resultado.message || "Erro ao registar pagamento");
        }

        alert(`Sucesso!\nPagamento de ${formatarMoeda(valorTotal)} registado via ${metodo}.`);
        window.location.reload();
    } catch (erro) {
        console.error("Erro ao pagar fatura:", erro);
        alert("Erro ao registar pagamento na BD.");
    }
}

async function abrirHistorico() {
    // Abre o modal e carrega as faturas ja liquidadas
    const corpoHistorico = document.getElementById('lista-historico-body');
    const modal = document.getElementById('modal-historico');
    let somaTotal = 0;

    corpoHistorico.innerHTML = '<tr><td colspan="5" style="padding: 15px; color: #7f8c8d;"><i class="fa fa-spinner fa-spin"></i> A carregar historico...</td></tr>';
    modal.style.display = 'flex';

    try {
        const resposta = await fetch(`${API_BASE}/faturas/historico`);
        const resultado = await resposta.json();

        if (resultado.status !== 200) {
            throw new Error(resultado.message || "Erro ao carregar historico");
        }

        historicoPagamentos = resultado.data.map(pago => ({
            hora: new Date(pago.data_servico).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
            cliente: pago.cliente,
            nif: pago.nif,
            itens: pago.servico,
            metodo: "Registado",
            total: Number(pago.valor_total || 0)
        }));

        corpoHistorico.innerHTML = '';

        if (historicoPagamentos.length === 0) {
            corpoHistorico.innerHTML = '<tr><td colspan="5" style="padding: 15px; color: #7f8c8d;">Ainda nao existem faturas liquidadas.</td></tr>';
        }

        historicoPagamentos.forEach(pago => {
            somaTotal += pago.total;

            corpoHistorico.innerHTML += `
                <tr style="border-bottom: 1px solid #f1f2f6; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">
                    <td style="padding: 15px; color: #7f8c8d; font-weight: bold;">${escaparHTML(pago.hora)}</td>
                    <td style="padding: 15px;">
                        <strong style="color: #2c3e50;">${escaparHTML(pago.cliente)}</strong><br>
                        <span style="color: #95a5a6; font-size: 0.8rem;">NIF: ${escaparHTML(pago.nif)}</span>
                    </td>
                    <td style="padding: 15px; color: #7f8c8d;">${escaparHTML(pago.itens)}</td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background-color: #e0f2f1; color: #2ea89c; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">${escaparHTML(pago.metodo)}</span>
                    </td>
                    <td style="padding: 15px; text-align: right; color: #2c3e50; font-weight: bold; font-size: 1.05rem;">${formatarMoeda(pago.total)}</td>
                </tr>
            `;
        });

        document.getElementById('total-caixa-hoje').innerText = formatarMoeda(somaTotal);
    } catch (erro) {
        console.error("Erro ao carregar historico:", erro);
        corpoHistorico.innerHTML = '<tr><td colspan="5" style="padding: 15px; color: #e74c3c;">Nao foi possivel carregar o historico da BD.</td></tr>';
        document.getElementById('total-caixa-hoje').innerText = formatarMoeda(0);
    }
}

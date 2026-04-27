// =======================================================
// TERMINAL DE PAGAMENTO (P.O.S.) - Clínica Miacãomigo
// =======================================================

// 1. DADOS SIMULADOS E ESTADO
const contasPendentesBD = [
    { id: 101, cliente: "Carlos Sousa", nif: "123456789", animal: "Bobby (Cão)", servico: "Consulta", preco: 45.00 },
    { id: 102, cliente: "Marta Vila", nif: "987654321", animal: "Luna (Gato)", servico: "Banho", preco: 20.00 },
    { id: 103, cliente: "Rui Pedro", nif: "111222333", animal: "Thor (Cão)", servico: "Tosquia", preco: 20.00 },
    { id: 104, cliente: "Ana Lima", nif: "444555666", animal: "Mia (Gato)", servico: "Banho e Tosquia", preco: 40.00 }
];

const historicoPagamentos = [
    { hora: "09:15", cliente: "Maria João", nif: "234567890", itens: "Vacina Raiva, Ração", metodo: "Multibanco", total: 57.50 },
    { hora: "10:30", cliente: "José Silva", nif: "123456789", itens: "Consulta Geral", metodo: "Dinheiro", total: 45.00 },
    { hora: "11:45", cliente: "Carla Antunes", nif: "987654321", itens: "Banho e Tosquia", metodo: "MBWay", total: 40.00 }
];

let carrinhoAtual = [];
let contaSelecionada = null;

// 2. INICIALIZAÇÃO "MESTRE" E EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do P.O.S. (Lado Esquerdo e Direito) ---
    const listaPendentes = document.getElementById('lista-pendentes');
    if (listaPendentes) {
        setTimeout(() => { renderizarListaPendentes(listaPendentes); }, 300);
    }

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
            const btnLixo = evento.target.closest('.btn-lixo');
            if (btnLixo) {
                const index = parseInt(btnLixo.getAttribute('data-index'));
                removerItem(index);
            }
        });
    }

    // --- Lógica do Modal de Histórico ---
    const btnAbrirHist = document.getElementById('btn-abrir-historico');
    if (btnAbrirHist) btnAbrirHist.addEventListener('click', abrirHistorico);

    const fecharModalHist = () => document.getElementById('modal-historico').style.display = 'none';
    
    const btnFecharIcon = document.getElementById('btn-fechar-historico-icon');
    if (btnFecharIcon) btnFecharIcon.addEventListener('click', fecharModalHist);
    
    const btnFecharBtn = document.getElementById('btn-fechar-historico-btn');
    if (btnFecharBtn) btnFecharBtn.addEventListener('click', fecharModalHist);
});


// =======================================================
// FUNÇÕES DO TERMINAL (P.O.S.)
// =======================================================

// 3. RENDERIZAR LISTA
function renderizarListaPendentes(container) {
    container.innerHTML = ''; 
    contasPendentesBD.forEach(conta => {
        const div = document.createElement('div');
        div.className = 'item-pendente';
        div.innerHTML = `
            <div>
                <strong style="color: #2c3e50; font-size: 1.1rem; display: block;">${conta.cliente}</strong>
                <span style="color: #7f8c8d; font-size: 0.85rem;">${conta.animal} • ${conta.servico}</span>
            </div>
            <div style="font-weight: bold; color: #e74c3c; font-size: 1.1rem; display: flex; align-items: center;">
                ${conta.preco.toFixed(2)} €
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

// 4. ABRIR CONTA
function abrirConta(conta) {
    contaSelecionada = conta;
    
    document.getElementById('cliente-nome').innerText = `Conta: ${conta.cliente}`;
    document.getElementById('cliente-info').innerText = `NIF: ${conta.nif} | Paciente: ${conta.animal}`;
    
    const zonaVenda = document.getElementById('zona-venda-direta');
    if(zonaVenda) zonaVenda.style.display = 'flex';
    
    const zonaDesc = document.getElementById('zona-desconto');
    if(zonaDesc) zonaDesc.style.display = 'flex';
    
    document.querySelectorAll('.btn-checkout').forEach(btn => btn.disabled = false);

    const boxDesconto = document.getElementById('input-desconto-perc');
    if(boxDesconto) boxDesconto.value = '';

    carrinhoAtual = [{ desc: conta.servico, preco: Number(conta.preco) }];
    atualizarTalao();
}

// 5. ADICIONAR PRODUTOS EXTRA
function adicionarItem() { 
    const selectBox = document.getElementById('select-produto');
    if (!selectBox || !selectBox.value) return alert("Selecione um produto primeiro.");

    const valorOpcao = parseFloat(selectBox.value);
    const descProduto = selectBox.options[selectBox.selectedIndex].text.split('(')[0].trim();
    
    carrinhoAtual.push({ desc: descProduto, preco: valorOpcao });
    
    atualizarTalao();
    selectBox.value = ''; 
}

// 6. MATEMÁTICA E DESENHO DA TABELA DO P.O.S.
function atualizarTalao() {
    try {
        const corpoTabela = document.getElementById('itens-fatura');
        if(!corpoTabela) return;
        
        corpoTabela.innerHTML = '';
        let totalProdutos = 0;

        carrinhoAtual.forEach((item, index) => {
            totalProdutos += item.preco;
            corpoTabela.innerHTML += `
                <tr class="linha-item-recibo">
                    <td><strong>${item.desc}</strong></td>
                    <td class="txt-dir">${item.preco.toFixed(2)} €</td>
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
                    <td class="txt-dir" style="color: #e74c3c;">-${valorDesconto.toFixed(2)} €</td>
                    <td></td>
                </tr>
            `;
        }

        const valorIva = totalProdutos > 0 ? totalProdutos - (totalProdutos / 1.23) : 0; 
        const valorSubtotal = totalProdutos - valorIva;

        document.getElementById('subtotal').innerText = valorSubtotal.toFixed(2) + " €";
        document.getElementById('iva').innerText = valorIva.toFixed(2) + " €";
        document.getElementById('total-final').innerText = totalProdutos.toFixed(2) + " €";

    } catch (erro) {
        console.error("Erro na matemática:", erro);
    }
}

// 7. REMOVER ITEM DO CARRINHO
function removerItem(index) {
    carrinhoAtual.splice(index, 1);
    atualizarTalao();
}

// 8. PAGAR
function pagar(metodo) {
    if (!contaSelecionada) return;
    const valorTotal = document.getElementById('total-final').innerText;
    alert(`Sucesso!\nPagamento de ${valorTotal} registado via ${metodo}.`);
    window.location.reload();
}


// =======================================================
// FUNÇÕES DO HISTÓRICO DE FATURAÇÃO
// =======================================================

// 9. ABRIR E RENDERIZAR O MODAL DE HISTÓRICO
function abrirHistorico() {
    const corpoHistorico = document.getElementById('lista-historico-body');
    const modal = document.getElementById('modal-historico');
    let somaTotal = 0;

    corpoHistorico.innerHTML = '';

    historicoPagamentos.forEach(pago => {
        somaTotal += pago.total;
        
        corpoHistorico.innerHTML += `
            <tr style="border-bottom: 1px solid #f1f2f6; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 15px; color: #7f8c8d; font-weight: bold;">${pago.hora}</td>
                <td style="padding: 15px;">
                    <strong style="color: #2c3e50;">${pago.cliente}</strong><br>
                    <span style="color: #95a5a6; font-size: 0.8rem;">NIF: ${pago.nif}</span>
                </td>
                <td style="padding: 15px; color: #7f8c8d;">${pago.itens}</td>
                <td style="padding: 15px; text-align: center;">
                    <span style="background-color: #e0f2f1; color: #2ea89c; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">${pago.metodo}</span>
                </td>
                <td style="padding: 15px; text-align: right; color: #2c3e50; font-weight: bold; font-size: 1.05rem;">${pago.total.toFixed(2)} €</td>
            </tr>
        `;
    });

    document.getElementById('total-caixa-hoje').innerText = somaTotal.toFixed(2) + " €";
    modal.style.display = 'flex';
}
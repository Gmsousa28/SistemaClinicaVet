// =======================================================
// TERMINAL DE PAGAMENTO (P.O.S.) - Clínica Miacãomigo
// =======================================================

// 1. DADOS SIMULADOS (Tabela de Preços)
const contasPendentesBD = [
    { id: 101, cliente: "Carlos Sousa", nif: "123456789", animal: "Bobby (Cão)", servico: "Consulta", preco: 45.00 },
    { id: 102, cliente: "Marta Vila", nif: "987654321", animal: "Luna (Gato)", servico: "Banho", preco: 20.00 },
    { id: 103, cliente: "Rui Pedro", nif: "111222333", animal: "Thor (Cão)", servico: "Tosquia", preco: 20.00 },
    { id: 104, cliente: "Ana Lima", nif: "444555666", animal: "Mia (Gato)", servico: "Banho e Tosquia", preco: 40.00 }
];

let carrinhoAtual = [];
let contaSelecionada = null;

// 2. INICIALIZAR
document.addEventListener('DOMContentLoaded', () => {
    const listaPendentes = document.getElementById('lista-pendentes');
    if (listaPendentes) {
        setTimeout(() => { renderizarListaPendentes(listaPendentes); }, 300);
    }
});

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
        
        div.onclick = function() {
            document.querySelectorAll('.item-pendente').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            abrirConta(conta);
        };
        container.appendChild(div);
    });
}

// 4. ABRIR CONTA (Protegido)
window.abrirConta = function(conta) {
    contaSelecionada = conta;
    
    // Atualiza cabeçalhos
    document.getElementById('cliente-nome').innerText = `Conta: ${conta.cliente}`;
    document.getElementById('cliente-info').innerText = `NIF: ${conta.nif} | Paciente: ${conta.animal}`;
    
    // Mostra as zonas (se existirem no HTML)
    const zonaVenda = document.getElementById('zona-venda-direta');
    if(zonaVenda) zonaVenda.style.display = 'flex';
    
    const zonaDesc = document.getElementById('zona-desconto');
    if(zonaDesc) zonaDesc.style.display = 'flex';
    
    document.querySelectorAll('.btn-checkout').forEach(btn => btn.disabled = false);

    const boxDesconto = document.getElementById('input-desconto-perc');
    if(boxDesconto) boxDesconto.value = '';

    // Coloca a Consulta/Serviço base no carrinho
    carrinhoAtual = [{ desc: conta.servico, preco: Number(conta.preco) }];
    
    // Força o cálculo imediato
    atualizarTalao();
};

// 5. ADICIONAR PRODUTOS EXTRA (Protegido)
window.adicionarItem = function() { 
    const selectBox = document.getElementById('select-produto');
    if (!selectBox || !selectBox.value) return alert("Selecione um produto primeiro.");

    const valorOpcao = parseFloat(selectBox.value);
    const descProduto = selectBox.options[selectBox.selectedIndex].text.split('(')[0].trim();
    
    carrinhoAtual.push({ desc: descProduto, preco: valorOpcao });
    
    atualizarTalao();
    selectBox.value = ''; // Limpa a dropdown
};

// 6. MATEMÁTICA INFALÍVEL
window.atualizarTalao = function() {
    try {
        const corpoTabela = document.getElementById('itens-fatura');
        if(!corpoTabela) return;
        
        corpoTabela.innerHTML = '';
        let totalProdutos = 0;

        // A. Imprime o carrinho atual
        carrinhoAtual.forEach(item => {
            totalProdutos += item.preco;
            corpoTabela.innerHTML += `
                <tr class="linha-item-recibo">
                    <td><strong>${item.desc}</strong></td>
                    <td class="txt-dir">${item.preco.toFixed(2)} €</td>
                </tr>
            `;
        });

        // B. Verifica Descontos em Segurança
        const boxDesconto = document.getElementById('input-desconto-perc');
        let percDesconto = 0;
        
        if (boxDesconto && boxDesconto.value !== '') {
            percDesconto = parseFloat(boxDesconto.value) || 0;
        }

        // C. Aplica Limites e Faz a Conta do Desconto
        if (percDesconto > 100) percDesconto = 100;
        if (percDesconto < 0) percDesconto = 0;

        if (percDesconto > 0) {
            const valorDesconto = totalProdutos * (percDesconto / 100);
            totalProdutos -= valorDesconto;
            
            corpoTabela.innerHTML += `
                <tr class="linha-item-recibo">
                    <td style="color: #e74c3c;"><i>Desconto (${percDesconto}%)</i></td>
                    <td class="txt-dir" style="color: #e74c3c;">-${valorDesconto.toFixed(2)} €</td>
                </tr>
            `;
        }

        // D. Impostos e Injeção no HTML
        const valorIva = totalProdutos - (totalProdutos / 1.23); 
        const valorSubtotal = totalProdutos - valorIva;

        document.getElementById('subtotal').innerText = valorSubtotal.toFixed(2) + " €";
        document.getElementById('iva').innerText = valorIva.toFixed(2) + " €";
        document.getElementById('total-final').innerText = totalProdutos.toFixed(2) + " €";

    } catch (erro) {
        console.error("Erro na matemática:", erro);
    }
};

// 7. PAGAR
window.pagar = function(metodo) {
    if (!contaSelecionada) return;
    const valorTotal = document.getElementById('total-final').innerText;
    alert(`Sucesso!\nPagamento de ${valorTotal} registado via ${metodo}.`);
    window.location.reload();
};
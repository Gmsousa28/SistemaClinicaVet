document.addEventListener('DOMContentLoaded', async function() {
    
    const API_BASE = "http://localhost:8008/api";

    // =======================================================
    // 1. IDENTIFICAR A CONSULTA ATUAL (LENDO A MOCHILA)
    // =======================================================
    const dadosConsulta = JSON.parse(localStorage.getItem('consultaAIniciar'));
    
    if (!dadosConsulta || !dadosConsulta.id_animal || !dadosConsulta.id_consulta) {
        alert("Erro: Dados da consulta perdidos. Vai ser redirecionado para o painel principal.");
        window.location.href = "consulta.html";
        return;
    }

    const idConsultaAtual = dadosConsulta.id_consulta;
    const idAnimalAtual = dadosConsulta.id_animal;

    // =======================================================
    // 2. LIMPAR A INTERFACE (Sincronizado com o novo HTML)
    // =======================================================
    const barraPassos = document.querySelector('.barra-passos');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    
    if (barraPassos) barraPassos.style.display = 'none';
    if (btnVoltar) btnVoltar.style.display = 'none';
    if (btnAvancar) btnAvancar.style.display = 'none';

    // Mostramos diretamente os detalhes da medicação e o botão de Confirmar
    const passo2 = document.getElementById('passo-2');
    const btnConfirmar = document.getElementById('btn-confirmar');
    
    if (passo2) passo2.style.display = 'block';
    if (btnConfirmar) btnConfirmar.style.display = 'inline-block';

    // =======================================================
    // 3. CARREGAR OS MEDICAMENTOS DA API
    // =======================================================
    // 🧪 Atualizado para o ID correto do novo HTML: container-medicamentos
    const containerMedicamentos = document.getElementById('container-medicamentos');

    if (containerMedicamentos) {

        try {
            // Loading
            containerMedicamentos.innerHTML = `
                <div style="text-align:center; padding:20px; color: #7f8c8d;">
                    <i class="fa fa-spinner fa-spin"></i>
                    A carregar medicamentos...
                </div>
            `;

            // Pedido API
            const resposta = await fetch(`${API_BASE}/medicamentos`);
            const resultado = await resposta.json();

            console.log("Resultado medicamentos:", resultado);

            // Buscar array
            const todosProdutos = resultado.data || resultado;
            containerMedicamentos.innerHTML = "";

            // Sem medicamentos em stock
            if (!todosProdutos || todosProdutos.length === 0) {
                containerMedicamentos.innerHTML = `
                    <p style="color:#e74c3c; width:100%; text-align:center;">
                        Não há medicamentos disponíveis na base de dados.
                    </p>
                `;
            } else {

                todosProdutos.forEach(med => {

                    const idMedicamento = med.id_medicamento || med.id_produto || med.id;
                    const nomeMedicamento = med.nome || med.nome_medicamento || "Medicamento Indefinido";
                    
                    // Se não houver preço definido, pomos a referência ou as riscas
                    const precoOuRef = med.preco ? `${med.preco}€` : (med.dosagem_referencia || "--");

                    const cartaoHTML = `
                        <label class="cartao-opcao-radio" style="cursor:pointer;">
                            
                            <input
                                type="checkbox"
                                name="medicamento_selecionado"
                                value="${idMedicamento}"
                                class="esconder-radio"
                            >

                            <div class="conteudo-cartao-opcao" style="display:flex; align-items:center; text-align:left; gap:15px; padding:15px;">
                                
                                <div class="avatar-medico" style="background-color:#e8f5e9; color:#2ea89c; width:45px; height:45px; display:flex; justify-content:center; align-items:center; border-radius:50%; flex-shrink:0;">
                                    <i class="fa fa-pills" style="font-size:1.3rem;"></i>
                                </div>

                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-weight:600; color:#2c3e50; font-size:0.95rem;">
                                        ${nomeMedicamento}
                                    </span>
                                    <small style="color:#7f8c8d; font-size:0.85rem;">
                                        ${precoOuRef}
                                    </small>
                                </div>

                            </div>
                        </label>
                    `;

                    containerMedicamentos.innerHTML += cartaoHTML;
                });
            }

        } catch (erro) {
            console.error("Erro ao carregar medicamentos:", erro);
            containerMedicamentos.innerHTML = `
                <p style="color:red; width:100%; text-align:center;">
                    Erro ao carregar medicamentos.
                </p>
            `;
        }
    }

    // =======================================================
// 4. GRAVAR A PRESCRIÇÃO DOS MEDICAMENTOS (FORMATO STRING)
// =======================================================
const formMarcacao = document.getElementById('form-prescrever-medicamento');

if (formMarcacao) {
    formMarcacao.addEventListener('submit', async function(evento) {
        evento.preventDefault();

        // 1. Captura as checkboxes selecionadas
        const caixasCheckadas = document.querySelectorAll('input[name="medicamento_selecionado"]:checked');

        // 2. Transforma as caixas em TEXTO CORRIDO (ex: "4" ou "4, 7") igualzinho aos teus exames!
        const medicamentosTexto = Array.from(caixasCheckadas)
    .map(cb => ({
        id_medicamento: Number(cb.value)
    }));

        // Validar seleção
        if (medicamentosTexto.length === 0) {
            alert('Por favor, selecione pelo menos um medicamento.');
            return;
        }

        // ===================================================
        // DADOS PARA ENVIAR (FORMATO STRING IDENTICO AOS EXAMES)
        // ===================================================
        const dadosParaEnviar = {
            id_consulta: idConsultaAtual,
            id_animal: idAnimalAtual,
            id_medicamento: medicamentosTexto // 👈 AGORA VAI COMO STRING! Ex: medicamentos: "4"
        };

        console.log("🚀 A enviar para a API (Formato String):", dadosParaEnviar);

        try {
            const resposta = await fetch(`${API_BASE}/orienta-medicamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            const resultado = await resposta.json();
            console.log("Resposta do Servidor:", resultado);

            if (resultado.status === 201 || resposta.ok) {
                alert('🎉 Medicamento(s) registado(s) com sucesso!');
                window.location.href = "momento_consulta.html";
            } else {
                alert('Erro ao gravar: ' + (resultado.message || 'Tente novamente.'));
            }

        } catch (erro) {
            console.error("Erro grave no Fetch:", erro);
            alert("Erro ao ligar ao servidor.");
        }
    });
}
});
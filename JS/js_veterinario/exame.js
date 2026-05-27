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
    // 2. LIMPAR A INTERFACE (Adeus Passo 1 e NIF!)
    // =======================================================
    // Escondemos tudo o que não interessa ao médico nesta fase
    const barraPassos = document.querySelector('.barra-passos');
    const passo1 = document.getElementById('passo-1');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    
    if (barraPassos) barraPassos.style.display = 'none';
    if (passo1) passo1.style.display = 'none';
    if (btnVoltar) btnVoltar.style.display = 'none';
    if (btnAvancar) btnAvancar.style.display = 'none';

    // Mostramos diretamente os exames e o botão de Confirmar
    const passo2 = document.getElementById('passo-2');
    const btnConfirmar = document.getElementById('btn-confirmar');
    
    if (passo2) passo2.style.display = 'block';
    if (btnConfirmar) btnConfirmar.style.display = 'inline-block';

// =======================================================
// 3. CARREGAR OS EXAMES DA API
// =======================================================

const containerExames =
    document.getElementById('container-exames');

if (containerExames) {

    try {

        // Loading
        containerExames.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <i class="fa fa-spinner fa-spin"></i>
                A carregar exames...
            </div>
        `;

        // Pedido API
        const resposta =
            await fetch(`${API_BASE}/exames`);

        // Converter resposta
        const resultado =
            await resposta.json();

        console.log("Resultado exames:", resultado);

        // Buscar array
        const todosServicos =
            resultado.data || resultado;

        // Mostrar TODOS
        const apenasExames =
            todosServicos;

        // Limpar container
        containerExames.innerHTML = "";

        // Sem exames
        if (!apenasExames || apenasExames.length === 0) {

            containerExames.innerHTML = `
                <p style="
                    color:#e74c3c;
                    width:100%;
                    text-align:center;
                ">
                    Não há exames disponíveis na base de dados.
                </p>
            `;

        } else {

            apenasExames.forEach(exame => {

                const idServico =
                    exame.id_exame ||
                    exame.id_servico ||
                    exame.id;

                const nomeExame =
                    exame.nome ||
                    exame.nome_exame ||
                    "Exame Indefinido";

                const preco =
                    exame.preco
                        ? `${exame.preco}€`
                        : "--";

                const cartaoHTML = `
                    <label
                        class="cartao-opcao-radio"
                        style="cursor:pointer;"
                    >

                        <input
                            type="checkbox"
                            name="exame_selecionado"
                            value="${idServico}"
                            class="esconder-radio"
                        >

                        <div
                            class="conteudo-cartao-opcao"
                            style="
                                display:flex;
                                align-items:center;
                                text-align:left;
                                gap:15px;
                                padding:15px;
                            "
                        >

                            <div
                                class="avatar-medico"
                                style="
                                    background-color:#e3f2fd;
                                    color:#3498db;
                                    width:45px;
                                    height:45px;
                                    display:flex;
                                    justify-content:center;
                                    align-items:center;
                                    border-radius:50%;
                                    flex-shrink:0;
                                "
                            >

                                <i
                                    class="fa fa-microscope"
                                    style="font-size:1.3rem;"
                                ></i>

                            </div>

                            <div
                                style="
                                    display:flex;
                                    flex-direction:column;
                                "
                            >

                                <span
                                    style="
                                        font-weight:600;
                                        color:#2c3e50;
                                        font-size:0.95rem;
                                    "
                                >
                                    ${nomeExame}
                                </span>

                                <small
                                    style="
                                        color:#7f8c8d;
                                        font-size:0.85rem;
                                    "
                                >
                                    ${preco}
                                </small>

                            </div>

                        </div>

                    </label>
                `;

                containerExames.innerHTML += cartaoHTML;

            });
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar exames:",
            erro
        );

        containerExames.innerHTML = `
            <p style="
                color:red;
                width:100%;
                text-align:center;
            ">
                Erro ao carregar exames.
            </p>
        `;
    }
}
   // =======================================================
// 4. GRAVAR A PRESCRIÇÃO DOS EXAMES
// =======================================================
const formMarcacao = document.getElementById('form-marcar-exame');

if (formMarcacao) {
    formMarcacao.addEventListener('submit', async function(evento) {
        evento.preventDefault();

        // ===================================================
        // BUSCAR EXAMES SELECIONADOS (E CONVERTER PARA NÚMERO)
        // ===================================================
        const examesSelecionados = Array.from(
            document.querySelectorAll('input[name="exame_selecionado"]:checked')
        ).map(cb => cb.value)
        .join(', ');

        // Validar seleção
        if (examesSelecionados.length === 0) {
            alert('Por favor, selecione pelo menos um exame.');
            return;
        }

        // ===================================================
        // DADOS PARA ENVIAR
        // ===================================================
        const dadosParaEnviar = {
            id_consulta: idConsultaAtual,
            id_animal: idAnimalAtual,
            exames: examesSelecionados
        };

        console.log("🚀 A enviar exames:", dadosParaEnviar);

        try {
            // ===================================================
            // FETCH API
            // ===================================================
            // ⚠️ ATENÇÃO: Confirma se a tua rota tem "/consultas" ou não!
            const resposta = await fetch(`${API_BASE}/prescrever-exames`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            // Converter resposta
            const resultado = await resposta.json();

            // ===================================================
            // SUCESSO
            // ===================================================
            if (resultado.status === 201 || resposta.ok) {
                alert('🎉 Exame(s) registado(s) com sucesso!');
                window.location.href = "momento_consulta.html";
            }
            // ===================================================
            // ERRO PERSONALIZADO DO SERVIDOR
            // ===================================================
            else {
                alert('Erro ao gravar exame: ' + (resultado.message || 'Tente novamente.'));
            }

        } catch (erro) {
            // ===================================================
            // ERRO GRAVE (Ex: Servidor desligado)
            // ===================================================
            console.error("Erro grave no Fetch:", erro);
            alert("Erro ao ligar ao servidor. Verifica a Consola (F12).");
        }
    });
}
});

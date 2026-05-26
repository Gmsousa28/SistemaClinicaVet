// =================================================================
// 1. FUNÇÕES DOS POPUPS (MOTIVO E RELATÓRIO)
// =================================================================

// --- Popup Motivo ---
function fecharPopupInfo() {
    const popup = document.getElementById('popup-motivo');
    if (popup) popup.style.display = 'none';
}

function abrirPopupInfo(textoMotivo) {
    const spanTexto = document.getElementById('texto-motivo-dinamico');
    if (spanTexto) {
        spanTexto.textContent = textoMotivo;
    }
    const popup = document.getElementById('popup-motivo');
    if (popup) popup.style.display = 'flex';
}

// --- Popup Relatório/Diagnóstico ---
function fecharPopupInfo1() {
    const popup = document.getElementById('popup-relatorio');
    if (popup) popup.style.display = 'none';
}

function abrirPopupInfo1(textoRelatorio) {
    const spanTexto = document.getElementById('texto-relatorio-dinamico');
    if (spanTexto) {
        spanTexto.textContent = textoRelatorio;
    }
    const popup = document.getElementById('popup-relatorio');
    if (popup) popup.style.display = 'flex';
}

// =================================================================
// 2. CARREGAR HISTÓRICO DA API (SÓ CONSULTAS PASSADAS)
// =================================================================
async function carregarHistoricoConsultasAnimal() {

    const tbody = document.getElementById('corpo-tabela-historico-animal');

    if (!tbody) {
        console.error("tbody não encontrado!");
        return;
    }

    // Buscar dados guardados
    const dadosConsulta = localStorage.getItem('consultaAIniciar');

    if (!dadosConsulta) {

        console.error("Nenhuma consulta encontrada no localStorage!");

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:red;">
                    Nenhum animal selecionado.
                </td>
            </tr>
        `;

        return;
    }

    // Converter objeto
    const consultaAtual = JSON.parse(dadosConsulta);

    console.log("consultaAtual:", consultaAtual);

    /*
        ⚠️ IMPORTANTE
        Aqui vais buscar o ID correto.
        Ajusta conforme o nome do campo do teu objeto.
    */

    const idAnimalAtendido =
        consultaAtual.id_animal;

    console.log("ID DO ANIMAL:", idAnimalAtendido);

    // Validar ID
    if (
        idAnimalAtendido === undefined ||
        idAnimalAtendido === null ||
        idAnimalAtendido === ""
    ) {

        console.error("ID do animal inválido!");

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:red;">
                    ID do animal não encontrado.
                </td>
            </tr>
        `;

        return;
    }

    try {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px;">
                    <i class="fa fa-spinner fa-spin"></i>
                    A carregar histórico...
                </td>
            </tr>
        `;

        // Pedido à API
        const resposta = await fetch(
            `http://localhost:8008/api/consultas/animal/${idAnimalAtendido}`
        );

        // Verificar resposta
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const resultado = await resposta.json();

        console.log("Resultado API:", resultado);

        const todasConsultas = resultado.data || resultado;

        tbody.innerHTML = "";

        // Sem consultas
        if (!todasConsultas || todasConsultas.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        Sem histórico de consultas.
                    </td>
                </tr>
            `;

            return;
        }

        // Data atual
        const agora = new Date();

        // Filtrar consultas passadas
        const historicoFiltrado = todasConsultas
            .filter(c => {

                if (!c.data_consulta) return false;

                const dataConsulta = new Date(c.data_consulta);

                return dataConsulta < agora;
            })
            .sort(
                (a, b) =>
                    new Date(b.data_consulta) -
                    new Date(a.data_consulta)
            );

        // Desenhar tabela
        historicoFiltrado.forEach(consulta => {

            const dataConsulta = new Date(consulta.data_consulta);

            const dataFormatada =
                dataConsulta.toLocaleDateString('pt-PT');

            const horaFormatada =
                dataConsulta.toLocaleTimeString('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

            const nomeAnimal =
                consulta.nome_animal || "Desconhecido";

            const nomeVeterinario =
                consulta.nome_veterinario || "Desconecido";

            const especie =
                (
                    consulta.especie_animal ||
                    consulta.especie ||
                    ""
                ).toLowerCase();

            const motivo =
                (consulta.motivo || "Sem motivo")
                    .replace(/'/g, "\\'");

            const relatorio =
                (consulta.diagnostico || "Sem relatório")
                    .replace(/'/g, "\\'");

            let icone = "paw";

            if (
                especie.includes("cão") ||
                especie.includes("cao")
            ) {
                icone = "dog";
            }
            else if (especie.includes("gato")) {
                icone = "cat";
            }

            const tr = document.createElement("tr");


            tr.innerHTML = `
    <td>
        <strong>${dataFormatada}</strong>
        às ${horaFormatada}
    </td>

    <td>
        <i class="fa fa-${icone}"></i>
        ${nomeAnimal}
    </td>

    <td>
        <i class="fa fa-user-md"></i>
        ${nomeVeterinario}
    </td>

    <td style="text-align:center;">
        <button
            onclick="abrirPopupInfo('${motivo}')"
            title="Ver motivo"
        >
            <i class="fa fa-info"></i>
        </button>
    </td>

    <td style="text-align:center;">
        <button
            onclick="abrirPopupInfo1('${relatorio}')"
            title="Ver relatório"
        >
            <i class="fa fa-file-medical"></i>
        </button>
    </td>
`;
            tbody.appendChild(tr);
        });

    }
    catch (erro) {

        console.error("Erro:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:red;">
                    Erro ao carregar histórico.
                </td>
            </tr>
        `;
    }
};

// =================================================================
// 3. MOTOR DE ARRANQUE DA PÁGINA (DOM COMPLETAMENTE CARREGADO)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicia o carregamento do histórico da tabela
    carregarHistoricoConsultasAnimal();

    // 2. Eventos do Popup: MOTIVO
    const btnFecharXMotivo = document.getElementById('btn-fechar-x-motivo');
    if (btnFecharXMotivo) btnFecharXMotivo.addEventListener('click', fecharPopupInfo);

    const btnFecharOkMotivo = document.getElementById('btn-fechar-ok-motivo');
    if (btnFecharOkMotivo) btnFecharOkMotivo.addEventListener('click', fecharPopupInfo);

    const popupMotivo = document.getElementById('popup-motivo');
    if (popupMotivo) {
        popupMotivo.addEventListener('click', (evento) => {
            if (evento.target === popupMotivo) fecharPopupInfo();
        });
    }

    // 3. Eventos do Popup: RELATÓRIO
    const btnFecharXRelatorio = document.getElementById('btn-fechar-x-relatorio');
    if (btnFecharXRelatorio) btnFecharXRelatorio.addEventListener('click', fecharPopupInfo1);

    const btnFecharOkRelatorio = document.getElementById('btn-fechar-ok-relatorio');
    if (btnFecharOkRelatorio) btnFecharOkRelatorio.addEventListener('click', fecharPopupInfo1);

    const popupRelatorio = document.getElementById('popup-relatorio');
    if (popupRelatorio) {
        popupRelatorio.addEventListener('click', (evento) => {
            if (evento.target === popupRelatorio) fecharPopupInfo1();
        });
    }
});
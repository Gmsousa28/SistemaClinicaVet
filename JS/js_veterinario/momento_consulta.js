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
        console.error("tbody não encontrado no HTML!");
        return;
    }

    // 🎒 Buscar os dados da consulta atual à mochila
    const dadosConsulta = localStorage.getItem('consultaAIniciar');
    
    if (!dadosConsulta) {
        console.error("Erro: Não há dados da consulta na mochila!");
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #e74c3c;">Erro: Animal não identificado. Volta ao ecrã anterior.</td></tr>`;
        return;
    }

    const consultaAtual = JSON.parse(dadosConsulta);
    const idAnimalAtendido = consultaAtual.id_animal; 

    try {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;"><i class="fa fa-spinner fa-spin"></i> A carregar o histórico clínico...</td></tr>`;

        // Fazer o pedido à API (Traz todas as consultas ou usa a rota específica do animal se tiveres)
        const resposta = await fetch(`http://localhost:8008/api/consultas/animal/${idAnimalAtendido}`);
        const resultado = await resposta.json();

        if (!resposta.ok) throw new Error(resultado.message);

        const todasConsultas = resultado.data || resultado; 
        const agora = new Date();
        let historicoFiltrado = [];

        // 🛡️ Filtrar as consultas passadas exclusivas deste animal
        todasConsultas.forEach(consulta => {
            // Filtro 1: Tem de ser do animal que estamos a atender
            if (Number(consulta.id_animal) !== Number(idAnimalAtendido)) {
                return; 
            }

            if (consulta.data_consulta) {
                const dataDaConsulta = new Date(consulta.data_consulta);

                // Filtro 2: Tem de ser no PASSADO (menor que o momento atual)
                if (dataDaConsulta < agora) {
                    
                    // Formata a data e hora à portuguesa
                    const dataFormatada = dataDaConsulta.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const horaFormatada = dataDaConsulta.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    
                    // Limpa plicas para os botões não darem erro no HTML
                    const motivoTexto = consulta.motivo || "Nenhum motivo registado.";
                    const motivoSeguro = motivoTexto.replace(/'/g, "\\'");
                    
                    const relatorioTexto = consulta.diagnostico || "Sem relatório ou diagnóstico registado nesta consulta.";
                    const relatorioSeguro = relatorioTexto.replace(/'/g, "\\'");

                    historicoFiltrado.push({
                        dataObjeto: dataDaConsulta, 
                        dataExibicao: dataFormatada,
                        horaExibicao: horaFormatada,
                        nomeAnimal: consulta.nome_animal || "Desconhecido", 
                        especie: consulta.especie_animal || consulta.especie || "Desconhecida", 
                        motivoSeguro: motivoSeguro,
                        relatorioSeguro: relatorioSeguro
                    });
                }
            }
        });

        // Ordenar da MAIS RECENTE para a MAIS ANTIGA (Ordem decrescente: b - a)
        historicoFiltrado.sort((a, b) => b.dataObjeto - a.dataObjeto);

        tbody.innerHTML = ""; 

        if (historicoFiltrado.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: #7f8c8d; font-weight: bold;"><i class="fa fa-folder-open"></i> Este animal não tem histórico de consultas anteriores.</td></tr>`;
            return;
        }

        // Desenhar a tabela dinamicamente
        historicoFiltrado.forEach(consulta => {
            let especieStr = consulta.especie.toLowerCase();
            let icone = especieStr.includes('cão') || especieStr.includes('cao') ? 'dog' : (especieStr.includes('gato') ? 'cat' : 'paw');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${consulta.dataExibicao}</strong> às ${consulta.horaExibicao}</td>
                <td><i class="fa fa-${icone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                
                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo('${consulta.motivoSeguro}')" 
                        title="Ver motivo da consulta"
                        style="background-color: transparent; color: #3498db; border: 2px solid #3498db; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.backgroundColor='#3498db'; this.style.color='white';"
                        onmouseout="this.style.backgroundColor='transparent'; this.style.color='#3498db';"
                    >
                        <i class="fa fa-info"></i>
                    </button>
                </td>

                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo1('${consulta.relatorioSeguro}')" 
                        title="Ver relatório da consulta"
                        style="background-color: transparent; color: #2ea89c; border: 2px solid #2ea89c; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.backgroundColor='#2ea89c'; this.style.color='white';"
                        onmouseout="this.style.backgroundColor='transparent'; this.style.color='#2ea89c';"
                    >
                        <i class="fa fa-file-medical"></i> 
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar dados da API:", erro);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #e74c3c;"><i class="fa fa-exclamation-triangle"></i> Erro de ligação à Base de Dados. Confirma se o servidor está ligado.</td></tr>`;
    }
}

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
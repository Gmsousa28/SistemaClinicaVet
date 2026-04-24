document.addEventListener("DOMContentLoaded", () => {
    carregarHistoricoConsultasAnimal();

    
});

async function carregarHistoricoConsultasAnimal() {
    const tbody = document.getElementById('corpo-tabela-historico-animal');

    try {
        // ⬇️ DADOS SIMULADOS CORRIGIDOS (Adicionado hora, nomeAnimal e tipoIcone)
        const dataHoje = new Date().toISOString().split('T')[0]; 
        const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const tresDiasAtras = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

        const consultasAPI = [
            { data: dataHoje, hora: "08:00", nomeAnimal: "Max", tipoIcone: "dog", motivo: "Vómitos", relatorio: "Gastrite leve." }, // Passou
            { data: dataHoje, hora: "23:59", nomeAnimal: "Max", tipoIcone: "cat", motivo: "Vacina", relatorio: "Tudo ok." }, // Futuro (ignorado)
            { data: ontem, hora: "14:30", nomeAnimal: "Max", tipoIcone: "dog", motivo: "Check-up", relatorio: "Saudável." }, // Ontem
            { data: ontem, hora: "16:00", nomeAnimal: "Max", tipoIcone: "cat", motivo: "Tosse", relatorio: "Receitado xarope." }, // Ontem
            { data: tresDiasAtras, hora: "10:00", nomeAnimal: "Max", tipoIcone: "dog", motivo: "Ferida", relatorio: "Limpeza e penso." } // Passado
        ];
        // ⬆️ FIM DOS DADOS SIMULADOS

        const agora = new Date();
        const dataHojeAtual = agora.toISOString().split('T')[0];
        const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + 
                          agora.getMinutes().toString().padStart(2, '0');

        // 1. Filtrar: Apenas consultas que JÁ PASSARAM
        let historico = consultasAPI.filter(consulta => {
            if (consulta.data < dataHojeAtual) return true;
            if (consulta.data === dataHojeAtual && consulta.hora < horaAtual) return true;
            return false; 
        });

        // 2. Ordenar da mais RECENTE para a mais ANTIGA
        historico.sort((a, b) => {
            const dataHoraA = a.data + "T" + a.hora;
            const dataHoraB = b.data + "T" + b.hora;
            return dataHoraB.localeCompare(dataHoraA); 
        });

        // Limpar o conteúdo antes de preencher
        tbody.innerHTML = "";

        if (historico.length === 0) {
            // Ajustado para 4 colunas (Data/Hora, Animal, Motivo, Relatório)
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">Não há histórico de consultas.</td></tr>`;
            return;
        }

        // CORREÇÃO: Alterado de "consultas" para "historico"
        historico.forEach(consulta => {
            const tr = document.createElement('tr');
            
            // Formatar a data para algo legível em PT (DD/MM/AAAA)
            const partesData = consulta.data.split('-');
            const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
            
            // Constrói o HTML com as duas colunas de botões separadas
            tr.innerHTML = `
                <td><strong>${dataFormatada}</strong> às ${consulta.hora}</td>
                <td><i class="fa fa-${consulta.tipoIcone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                
                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo('${consulta.motivo}')" 
                        title="Ver motivo da consulta"
                        style="background-color: transparent; color: #3498db; border: 2px solid #3498db; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: inline-flex; justify-content: center; align-items: center; transition: all 0.2s;"
                        onmouseover="this.style.backgroundColor='#3498db'; this.style.color='white';"
                        onmouseout="this.style.backgroundColor='transparent'; this.style.color='#3498db';"
                    >
                        <i class="fa fa-info"></i>
                    </button>
                </td>

                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo1('${consulta.relatorio}')" 
                        title="Ver relatório da consulta"
                        style="background-color: transparent; color: #2ea89c; border: 2px solid #2ea89c; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: inline-flex; justify-content: center; align-items: center; transition: all 0.2s;"
                        onmouseover="this.style.backgroundColor='#2ea89c'; this.style.color='white';"
                        onmouseout="this.style.backgroundColor='transparent'; this.style.color='#2ea89c';"
                    >
                        <i class="fa fa-file-medical"></i> </button>
                </td>
            `;

            // Adiciona a linha à tabela
            tbody.appendChild(tr);
        });


    } catch (erro) {
        console.error("Erro ao carregar o histórico:", erro);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}

// ==========================================
// Lógica do Popup de Informação
// ==========================================

function fecharPopupInfo() {
    const popup = document.getElementById('popup-motivo');
    if(popup) popup.style.display = 'none';
}

function abrirPopupInfo(motivoDaConsulta) {
    const spanTexto = document.getElementById('texto-motivo-dinamico');
    if (spanTexto) spanTexto.textContent = motivoDaConsulta;
    
    const popup = document.getElementById('popup-motivo');
    if (popup) popup.style.display = 'flex'; 
}

function fecharPopupInfo1() {
    const popup = document.getElementById('popup-relatorio');
    if(popup) popup.style.display = 'none';
}

// CORREÇÃO: A função estava com nome duplicado "abrirPopupInfo". Mudei para "abrirPopupInfo1"
function abrirPopupInfo1(relatorioDaConsulta) {
    const spanTexto = document.getElementById('texto-relatorio-dinamico');
    if (spanTexto) spanTexto.textContent = relatorioDaConsulta;
    
    const popup = document.getElementById('popup-relatorio');
    if (popup) popup.style.display = 'flex'; 
}


// EventListeners para fechar ao clicar fora da caixa branca
// Têm de estar dentro de um if() para garantir que a página não dá erro se o HTML do popup não existir ainda
const popupMotivo = document.getElementById('popup-motivo');
if (popupMotivo) {
    popupMotivo.addEventListener('click', function(event) {
        if (event.target === this) fecharPopupInfo();
    });
}

const popupRelatorio = document.getElementById('popup-relatorio');
if (popupRelatorio) {
    popupRelatorio.addEventListener('click', function(event) {
        if (event.target === this) fecharPopupInfo1();
    });
}

const btnFecharXMotivo = document.getElementById('btn-fechar-x-motivo');
    if (btnFecharXMotivo) btnFecharXMotivo.addEventListener('click', fecharPopupInfo);

    const btnFecharOkMotivo = document.getElementById('btn-fechar-ok-motivo');
    if (btnFecharOkMotivo) btnFecharOkMotivo.addEventListener('click', fecharPopupInfo);

    // --- LIGAÇÕES DOS BOTÕES DO POPUP RELATÓRIO ---
    const btnFecharXRelatorio = document.getElementById('btn-fechar-x-relatorio');
    if (btnFecharXRelatorio) btnFecharXRelatorio.addEventListener('click', fecharPopupInfo1);

    const btnFecharOkRelatorio = document.getElementById('btn-fechar-ok-relatorio');
    if (btnFecharOkRelatorio) btnFecharOkRelatorio.addEventListener('click', fecharPopupInfo1);
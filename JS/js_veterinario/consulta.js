document.addEventListener("DOMContentLoaded", () => {

    carregarConsultasDaAPI();

    const btnFecharX = document.getElementById('btn-fechar-x-motivo');
    if (btnFecharX) {
        btnFecharX.addEventListener('click', fecharPopupInfo);
    }

    const popupMotivo = document.getElementById('popup-motivo');
    if (popupMotivo) {
        popupMotivo.addEventListener('click', function(event) {
            if (event.target === this) {
                fecharPopupInfo();
            }
        });
    }
});


// ==========================================
async function carregarConsultasDaAPI() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    if (!tbody) {
        console.error("tbody não encontrado!");
        return;
    }

    try {

        const consultas = [
            { id: 101, hora: "09:30", nomeAnimal: "Max", tipoIcone: "dog", especie: "Cão", raca: "Labrador", cliente: "João Silva", motivo: "Vómitos e letargia há 2 dias. Suspeita de gastroenterite." },
            { id: 102, hora: "10:15", nomeAnimal: "Luna", tipoIcone: "cat", especie: "Gato", raca: "Siamês", cliente: "Ana Costa", motivo: "Check-up anual de rotina." }
        ];

        tbody.innerHTML = "";

        if (consultas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Não há consultas agendadas para hoje.</td></tr>`;
            return;
        }

        consultas.forEach(consulta => {

            const tr = document.createElement('tr');

            // ⚠️ evitar problemas com aspas no texto
            const motivoSeguro = consulta.motivo.replace(/'/g, "\\'");

            tr.innerHTML = `
                <td>${consulta.hora}</td>
                <td><i class="fa fa-${consulta.tipoIcone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.especie}</td>
                <td>${consulta.raca}</td>
                <td>${consulta.cliente}</td>
                
                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo('${motivoSeguro}')" 
                        title="Ver motivo da consulta"
                        style="background-color: transparent; color: #3498db; border: 2px solid #3498db; border-radius: 50%; width: 32px; height: 32px; cursor: pointer;"
                    >
                        <i class="fa fa-info"></i>
                    </button>
                </td>

                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="irParaConsulta(${consulta.id})"
                        style="background-color: #2ea89c; color: white; border: none; border-radius: 8px; padding: 6px 15px; cursor: pointer;"
                    >
                        <i class="fa fa-play"></i> Iniciar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar:", erro);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}


// ==========================================
function irParaConsulta(id) {
    // ✔️ redirecionamento limpo
    window.location.href = `momento_consulta.html?id=${id}`;
}


// ==========================================
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
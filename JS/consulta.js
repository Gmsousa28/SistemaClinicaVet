// Função principal que arranca quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
    carregarConsultasDaAPI();
});

async function carregarConsultasDaAPI() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    try {
        // Substitui este URL pelo endpoint real da tua API
        // const resposta = await fetch('https://tua-api.com/consultas-hoje');
        // const consultas = await resposta.json();

        // ⬇️ DADOS SIMULADOS (atualizados com motivo)
        const consultas = [
            { id: 101, hora: "09:30", nomeAnimal: "Max", tipoIcone: "dog", especie: "Cão", raca: "Labrador", cliente: "João Silva", servico: "Vacinação", motivo: "Vómitos e letargia há 2 dias. Suspeita de gastroenterite." },
            { id: 102, hora: "10:15", nomeAnimal: "Luna", tipoIcone: "cat", especie: "Gato", raca: "Siamês", cliente: "Ana Costa", servico: "Consulta Geral", motivo: "Check-up anual de rotina." }
        ];
        // ⬆️ FIM DOS DADOS SIMULADOS

        // Limpa o conteúdo
        tbody.innerHTML = "";

        // Se a API devolver um array vazio
        if (consultas.length === 0) {
            // colspan alterado para 7 devido à nova coluna "Iniciar"
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Não há consultas agendadas para hoje.</td></tr>`;
            return;
        }

        // Percorre cada consulta que veio da API e cria a linha
        consultas.forEach(consulta => {
            const tr = document.createElement('tr');
            
            // Constrói o HTML com as duas colunas de botões separadas
            tr.innerHTML = `
                <td>${consulta.hora}</td>
                <td><i class="fa fa-${consulta.tipoIcone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.especie}</td>
                <td>${consulta.raca}</td>
                <td>${consulta.cliente}</td>
                
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
                        onclick="window.location.href='momento_consulta.html?id=${consulta.id}'" 
                        title="Iniciar Consulta"
                        style="background-color: #2ea89c; color: white; border: none; border-radius: 8px; padding: 6px 15px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; display: inline-flex; align-items: center; gap: 6px;"
                        onmouseover="this.style.backgroundColor='#23857a';"
                        onmouseout="this.style.backgroundColor='#2ea89c';"
                    >
                        <i class="fa fa-play"></i> Iniciar
                    </button>
                </td>
            `;

            // Adiciona a linha à tabela
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar as consultas:", erro);
        // colspan alterado para 7
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}

// ==========================================
// Lógica do Popup de Informação
// ==========================================

function fecharPopupInfo() {
    const popup = document.getElementById('popup-motivo');
    popup.style.display = 'none';
}

function abrirPopupInfo(textoMotivo) {
    const popup = document.getElementById('popup-motivo');
    
    // Altera apenas o parágrafo dentro do popup
    const paragrafoMotivo = popup.querySelector('p');
    paragrafoMotivo.innerHTML = `<strong>Sintomas descritos:</strong> ${textoMotivo}`;
    
    // Mostra o popup
    popup.style.display = 'flex';
}

// Fechar ao clicar fora da caixa branca
document.getElementById('popup-motivo').addEventListener('click', function(event) {
    if (event.target === this) {
        fecharPopupInfo();
    }
});
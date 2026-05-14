async function carregarConsultasDaAPI() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    if (!tbody) {
        console.error("tbody não encontrado no HTML!");
        return;
    }

    try {
        // Mostrar uma mensagem de "A carregar" enquanto a API responde
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">A carregar consultas...</td></tr>`;

        // O URL REAL DA TUA API
        const urlAPI = 'http://localhost:8008/api/consultas'; 
        
        // Fazer a chamada à API
        const resposta = await fetch(urlAPI);

        // Verificar se a resposta foi bem sucedida (status 200-299)
        if (!resposta.ok) {
            throw new Error(`Erro na API! Status: ${resposta.status}`);
        }

        // CORREÇÃO 1: Tratar a resposta da tua API (que vem dentro do .data por causa do teu handleResponse)
        const respostaDaAPI = await resposta.json();
        const consultas = respostaDaAPI.data || respostaDaAPI;

        // Limpar o "A carregar..."
        tbody.innerHTML = "";

        // Se a lista vier vazia ou for indefinida
        if (!consultas || consultas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Não há consultas agendadas para hoje.</td></tr>`;
            return;
        }

        // Construir as linhas da tabela
        consultas.forEach(consulta => {
            const tr = document.createElement('tr');

            // Garantir que o motivo existe antes de fazer replace para evitar erros
            const motivoTexto = consulta.motivo || "Nenhum motivo especificado.";
            const motivoSeguro = motivoTexto.replace(/'/g, "\\'");

            // CUIDADO AQUI: Garante que os nomes (consulta.hora, consulta.nomeAnimal) 
            // batem certo com as colunas que vêm da tua base de dados!
            tr.innerHTML = `
                <td>${consulta.data_consulta || '--:--'}</td> 
                <td><i class="fa fa-paw"></i> ${consulta.nome}</td>
                <td>${consulta.especie }</td> 
                <td>${consulta.raca }</td>
                <td>${consulta.nome_cliente }</td> 
                
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
                        onclick="irParaConsulta(${consulta.id_consulta || consulta.id})"
                        style="background-color: #2ea89c; color: white; border: none; border-radius: 8px; padding: 6px 15px; cursor: pointer;"
                    >
                        <i class="fa fa-play"></i> Iniciar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar dados da API:", erro);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar os dados. Confirma a ligação à API ou se o servidor está ligado.</td></tr>`;
    }
}

// Redirecionamento
function irParaConsulta(id) {
    window.location.href = `momento_consulta.html?id=${id}`;
}
 
// ==========================================
// Popups
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

// CORREÇÃO 2: Este é o "motor de arranque". Manda a função correr assim que a página carrega!
document.addEventListener('DOMContentLoaded', () => {
    carregarConsultasDaAPI();
});
document.addEventListener("DOMContentLoaded", () => {
    // Se tiveres as duas tabelas na mesma página, chamas ambas aqui:
    // carregarProximasConsultas(); 
    carregarHistoricoConsultas();
});

async function carregarHistoricoConsultas() {
    const tbody = document.getElementById('corpo-tabela-historico');

    try {
        // ⬇️ DADOS SIMULADOS (Para testares a lógica do tempo)
        const dataHoje = new Date().toISOString().split('T')[0]; 
        const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const tresDiasAtras = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

        const consultasAPI = [
            { data: dataHoje, hora: "08:00", nomeAnimal: "Rex", tipoIcone: "dog", cliente: "Tiago", servico: "Vacinação" }, // Hoje, já passou
            { data: dataHoje, hora: "23:00", nomeAnimal: "Max", tipoIcone: "dog", cliente: "João", servico: "Vacinação" }, // Hoje, futuro (não deve aparecer)
            { data: ontem, hora: "15:30", nomeAnimal: "Luna", tipoIcone: "cat", cliente: "Ana", servico: "Consulta Geral" }, // Ontem
            { data: ontem, hora: "18:00", nomeAnimal: "Mia", tipoIcone: "cat", cliente: "Rui", servico: "Check-up" }, // Ontem
            { data: tresDiasAtras, hora: "10:00", nomeAnimal: "Bobi", tipoIcone: "dog", cliente: "Sara", servico: "Raio-X" } // Passado distante
        ];
        // ⬆️ FIM DOS DADOS SIMULADOS

        const agora = new Date();
        const dataHojeAtual = agora.toISOString().split('T')[0];
        const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + 
                          agora.getMinutes().toString().padStart(2, '0');

        // 1. Filtrar: Apenas consultas que JÁ PASSARAM
        let historico = consultasAPI.filter(consulta => {
            // Se a data da consulta é inferior a hoje (ex: ontem), passou!
            if (consulta.data < dataHojeAtual) return true;
            
            // Se for hoje, a hora tem de ser inferior à hora atual
            if (consulta.data === dataHojeAtual && consulta.hora < horaAtual) return true;
            
            // Caso contrário (é no futuro), rejeita
            return false; 
        });

        // 2. Ordenar da mais RECENTE para a mais ANTIGA
        historico.sort((a, b) => {
            // Juntamos data e hora para comparar tudo de uma vez
            const dataHoraA = a.data + "T" + a.hora;
            const dataHoraB = b.data + "T" + b.hora;
            return dataHoraB.localeCompare(dataHoraA); // Invertido para decrescente
        });

        // 3. Ficar apenas com as últimas 5 para não encher o ecrã
        const ultimas5 = historico.slice(0, 5);

        tbody.innerHTML = "";

        if (ultimas5.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">Nenhum histórico de consultas encontrado.</td></tr>`;
            return;
        }

        // 4. Desenhar no HTML
        ultimas5.forEach(consulta => {
            // Formatar data (De: 2026-04-20 Para: 20/04/2026)
            const partesData = consulta.data.split('-');
            const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>${dataFormatada}</strong></td>
                <td>${consulta.hora}</td>
                <td><i class="fa fa-${consulta.tipoIcone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.cliente}</td>
                <td>${consulta.servico}</td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar o histórico:", erro);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}

// Função para fechar o popup (a que já tens no teu HTML)
function fecharPopupInfo() {
    const popup = document.getElementById('popup-motivo');
    popup.style.display = 'none';
}

// Função para abrir o popup e injetar o motivo correto
function abrirPopupInfo(textoMotivo) {
    const popup = document.getElementById('popup-motivo');
    
    // Procura o parágrafo dentro do popup para alterar o texto
    const paragrafoMotivo = popup.querySelector('p');
    
    // Atualiza o texto com o motivo da consulta selecionada
    paragrafoMotivo.innerHTML = `<strong>Sintomas descritos:</strong> ${textoMotivo}`;
    
    // Mostra o popup (usamos 'flex' em vez de 'block' por causa do teu align-items/justify-content)
    popup.style.display = 'flex';
}

// Extra: Fechar o popup se o utilizador clicar na zona escura (fora da caixa branca)
document.getElementById('popup-motivo').addEventListener('click', function(event) {
    if (event.target === this) {
        fecharPopupInfo();
    }
});
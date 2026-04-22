document.addEventListener("DOMContentLoaded", () => {
    carregarProximasConsultas();
});

async function carregarProximasConsultas() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    try {
        // Exemplo de como farias o fetch:
        // const resposta = await fetch('https://tua-api.com/consultas');
        // const consultasAPI = await resposta.json();

        // ⬇️ DADOS SIMULADOS DA API (Nota: adicionei a "data" para podermos filtrar)
        // Assumimos que a data vem no formato YYYY-MM-DD
        const dataHojeSimulada = new Date().toISOString().split('T')[0]; 
        const dataAmanhaSimulada = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const consultasAPI = [
            { data: dataHojeSimulada, hora: "08:00", nomeAnimal: "Rex", tipoIcone: "dog", cliente: "Tiago", servico: "Vacinação" }, // Já passou (exemplo)
            { data: dataHojeSimulada, hora: "20:30", nomeAnimal: "Max", tipoIcone: "dog", cliente: "João Silva", servico: "Vacinação" },
            { data: dataHojeSimulada, hora: "21:00", nomeAnimal: "Luna", tipoIcone: "cat", cliente: "Ana Costa", servico: "Consulta Geral" },
            { data: dataHojeSimulada, hora: "21:45", nomeAnimal: "Mia", tipoIcone: "cat", cliente: "Rui", servico: "Check-up" },
            { data: dataHojeSimulada, hora: "22:15", nomeAnimal: "Bobi", tipoIcone: "dog", cliente: "Sara", servico: "Vacinação" },
            { data: dataHojeSimulada, hora: "23:00", nomeAnimal: "Thor", tipoIcone: "dog", cliente: "Nuno", servico: "Raio-X" },
            { data: dataHojeSimulada, hora: "23:30", nomeAnimal: "Nina", tipoIcone: "cat", cliente: "Rita", servico: "Consulta Geral" }, // Esta seria a 6ª, vai ser cortada
            { data: dataAmanhaSimulada, hora: "10:00", nomeAnimal: "Zeus", tipoIcone: "dog", cliente: "Pedro", servico: "Cirurgia" } // É amanhã, vai ser ignorada
        ];
        // ⬆️ FIM DOS DADOS SIMULADOS

        // 1. Obter a data e hora atuais do sistema do utilizador
        const agora = new Date();
        const dataHoje = agora.toISOString().split('T')[0]; // Formato: "2026-04-20"
        // Formatar hora para "HH:MM" (ex: "09:05")
        const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + 
                          agora.getMinutes().toString().padStart(2, '0');

        // 2. Filtrar os dados: Apenas consultas DE HOJE e que a HORA seja >= à hora atual
        let consultasFiltradas = consultasAPI.filter(consulta => {
            return consulta.data === dataHoje && consulta.hora >= horaAtual;
        });

        // 3. Ordenar por hora (garantir que vêm da mais cedo para a mais tarde)
        consultasFiltradas.sort((a, b) => a.hora.localeCompare(b.hora));

        // 4. Cortar a lista para ficar no máximo com 5 consultas
        const proximas5 = consultasFiltradas.slice(0, 5);

        // 5. Desenhar o HTML
        tbody.innerHTML = "";

        if (proximas5.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;">Não há mais consultas agendadas para hoje.</td></tr>`;
            return;
        }

        proximas5.forEach(consulta => {
            const tr = document.createElement('tr');
            
            // Nota: Sem 'cursor: pointer' e sem 'onclick', pois é só informativo
            tr.innerHTML = `
                <td>${consulta.hora}</td>
                <td><i class="fa fa-${consulta.tipoIcone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.cliente}</td>
                <td>${consulta.servico}</td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar as consultas:", erro);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>`;
    }
}
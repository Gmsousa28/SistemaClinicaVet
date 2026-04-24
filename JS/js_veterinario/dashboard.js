// ==========================================
// 1. ARRANQUE DA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // Carrega a tabela de consultas assim que a página abre
    carregarProximasConsultas();

    // Lógica da Pesquisa do Cliente
    const formPesquisa = document.getElementById('form-pesquisa-cliente');
    const inputNif = document.getElementById('pesquisa-nif');

    if (formPesquisa && inputNif) {
        formPesquisa.addEventListener('submit', (evento) => {
            // 1. Impede a página de recarregar
            evento.preventDefault(); 

            const nifDigitado = inputNif.value.trim();

            // 2. Base de Dados Simulada
            const baseDeDadosClientes = [
                { nif: "123456789", nome: "João Silva", telefone: "912345678", email: "joao.silva@email.com", morada: "Rua das Flores, 12" },
                { nif: "987654321", nome: "Ana Costa", telefone: "961234567", email: "ana.costa@email.com", morada: "Av. da Liberdade, 45" }
            ];

            // 3. Procura se existe algum cliente com este NIF
            const clienteEncontrado = baseDeDadosClientes.find(cliente => cliente.nif === nifDigitado);

            // 4. Resultado da Pesquisa
            if (clienteEncontrado) {
                // Sucesso! 
                alert(`Cliente Encontrado!\nNome: ${clienteEncontrado.nome}\nTelefone: ${clienteEncontrado.telefone}`);
                
                // Abre o modal SÓ DEPOIS de confirmar que o cliente existe
                if (typeof abrirModalCliente === "function") {
                    abrirModalCliente(); 
                }

            } else {
                // Fracasso! Não encontrou ninguém.
                alert("Cliente não encontrado. Por favor, verifique se o NIF está correto.");
                inputNif.focus(); 
            }
        });
    }
});

// ==========================================
// 2. FUNÇÃO DE CARREGAR TABELA
// ==========================================
async function carregarProximasConsultas() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    try {
        const dataHojeSimulada = new Date().toISOString().split('T')[0]; 
        const dataAmanhaSimulada = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const consultasAPI = [
            { data: dataHojeSimulada, hora: "08:00", nomeAnimal: "Rex", tipoIcone: "dog", cliente: "Tiago", servico: "Vacinação" },
            { data: dataHojeSimulada, hora: "20:30", nomeAnimal: "Max", tipoIcone: "dog", cliente: "João Silva", servico: "Vacinação" },
            { data: dataHojeSimulada, hora: "21:00", nomeAnimal: "Luna", tipoIcone: "cat", cliente: "Ana Costa", servico: "Consulta Geral" },
            { data: dataHojeSimulada, hora: "21:45", nomeAnimal: "Mia", tipoIcone: "cat", cliente: "Rui", servico: "Check-up" },
            { data: dataHojeSimulada, hora: "22:15", nomeAnimal: "Bobi", tipoIcone: "dog", cliente: "Sara", servico: "Vacinação" },
            { data: dataHojeSimulada, hora: "23:00", nomeAnimal: "Thor", tipoIcone: "dog", cliente: "Nuno", servico: "Raio-X" },
            { data: dataHojeSimulada, hora: "23:30", nomeAnimal: "Nina", tipoIcone: "cat", cliente: "Rita", servico: "Consulta Geral" }, 
            { data: dataAmanhaSimulada, hora: "10:00", nomeAnimal: "Zeus", tipoIcone: "dog", cliente: "Pedro", servico: "Cirurgia" } 
        ];

        const agora = new Date();
        const dataHoje = agora.toISOString().split('T')[0]; 
        const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + 
                          agora.getMinutes().toString().padStart(2, '0');

        let consultasFiltradas = consultasAPI.filter(consulta => {
            return consulta.data === dataHoje && consulta.hora >= horaAtual;
        });

        consultasFiltradas.sort((a, b) => a.hora.localeCompare(b.hora));

        const proximas5 = consultasFiltradas.slice(0, 5);

        tbody.innerHTML = "";

        if (proximas5.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;">Não há mais consultas agendadas para hoje.</td></tr>`;
            return;
        }

        proximas5.forEach(consulta => {
            const tr = document.createElement('tr');
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
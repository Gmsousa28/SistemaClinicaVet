// =================================================================
// 1. ARRANQUE DA PÁGINA, SEGURANÇA INTELIGENTE E SAUDAÇÃO REAL
// =================================================================
document.addEventListener("DOMContentLoaded", async () => {
    
    // --- PASSO A: VERIFICAR SE O UTILIZADOR ESTÁ LOGADO ---
    const dadosMochila = localStorage.getItem('utilizadorLogado');
    const tipoUtilizador = localStorage.getItem('tipoUtilizador');

    // Segurança 1: Se a mochila estiver vazia, bloqueia logo
    if (!dadosMochila || !tipoUtilizador) {
        alert("Sessão expirada. Por favor, faz login novamente.");
        window.location.href = '../Logins_Sessões/login.html'; 
        return;
    }

    // Criamos uma versão limpa em minúsculas para comparar sem medo de acentos ou espaços
    const tipoLimpo = tipoUtilizador.toLowerCase().trim();

    // Segurança 2: Permite entrar se for "veterinario" (HTML) ou "veterinário" (Base de Dados)
    if (tipoLimpo !== 'veterinario' && tipoLimpo !== 'veterinário') {
        alert("Acesso negado! Área exclusiva a Veterinários. O teu cargo atual é: " + tipoUtilizador);
        window.location.href = '../Logins_Sessões/login.html'; 
        return;
    }

    // Extrair com segurança os dados guardados no login
    const utilizador = JSON.parse(dadosMochila);
    const idDoVetLogado = utilizador.id_colaborador; 

    // --- PASSO B: IR À API BUSCAR O NOME DO MÉDICO ---
    try {
        const respostaVet = await fetch(`http://localhost:8008/api/veterinarios/perfil/${idDoVetLogado}`);
        
        if (respostaVet.ok) {
            const dadosPerfil = await respostaVet.json();
            const nomeDoMedico = dadosPerfil.data.nome; // Nome real vindo do PostgreSQL
            
            // Injeta o nome do médico na mensagem de boas-vindas do teu HTML
            document.getElementById('mensagem-boas-vindas').innerText = `Bom turno, Dr. ${nomeDoMedico}!`;
        } else {
            document.getElementById('mensagem-boas-vindas').innerText = "Olá! Bom turno de trabalho.";
        }
    } catch (erro) {
        console.error("Erro ao buscar o nome do médico:", erro);
        document.getElementById('mensagem-boas-vindas').innerText = "Olá! Bom turno de trabalho.";
    }

    // --- PASSO C: CARREGAR A TABELA DE CONSULTAS FILTRADA ---
    carregarProximasConsultas(idDoVetLogado);

    // ==========================================
    // 2. LÓGICA DA PESQUISA DE CLIENTE POR NIF
    // ==========================================
    const formPesquisa = document.getElementById('form-pesquisa-cliente');
    const inputNif = document.getElementById('pesquisa-nif');

    if (formPesquisa && inputNif) {
        formPesquisa.addEventListener('submit', async (evento) => {
            evento.preventDefault(); // Impede a página de recarregar o ecrã

            const nifDigitado = inputNif.value.trim();

            if (nifDigitado.length !== 9) {
                alert("Por favor, introduz um NIF válido com 9 dígitos.");
                return;
            }

            try {
                // Fazer o pedido ao backend para procurar o cliente pelo NIF
                const resposta = await fetch(`http://localhost:8008/api/clientes/nif/${nifDigitado}`);
                const resultado = await resposta.json();

                if (resposta.ok && resultado.data && resultado.data.length > 0) {
                    const clienteEncontrado = resultado.data[0];

                    alert(`Cliente Encontrado!\nNome: ${clienteEncontrado.nome}\nContacto: ${clienteEncontrado.contacto}\nMorada: ${clienteEncontrado.morada}`);
                    
                    // Se tiveres a função de abrir modal criada no teu ficheiro de modais
                    if (typeof abrirModalCliente === "function") {
                        abrirModalCliente(); 
                    }
                } else {
                    alert("Cliente não encontrado na Base de Dados. Verifica se o NIF está correto.");
                    inputNif.focus(); 
                }
            } catch (erro) {
                console.error("Erro ao comunicar com o servidor:", erro);
                alert("Erro de ligação. O servidor está ligado?");
            }
        });
    }
});

// =================================================================
// 3. FUNÇÃO DE CARREGAR AS PRÓXIMAS CONSULTAS (APENAS DESTE MÉDICO)
// =================================================================
async function carregarProximasConsultas(idDoVetLogado) {
    const tbody = document.getElementById('corpo-tabela-consultas');
    
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #7f8c8d;"><i class="fa fa-spinner fa-spin"></i> A carregar as tuas consultas de hoje...</td></tr>`;

    try {
        // Pedir todas as consultas agendadas ao backend
        const resposta = await fetch('http://localhost:8008/api/consultas');
        const resultado = await resposta.json();

        if (!resposta.ok) throw new Error(resultado.message);

        const todasConsultas = resultado.data; 

        // 1. Capturar o tempo presente (LOCAL) igual à função que funciona
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const dataDeHojeTexto = `${ano}-${mes}-${dia}`; 

        let consultasFiltradas = [];

        todasConsultas.forEach(consulta => {
            // 🛡️ FILTRO 1: Se a consulta não pertencer a este médico logado, ignora!
            if (Number(consulta.id_veterinario) !== Number(idDoVetLogado)) {
                return; 
            }

            // 🛡️ FILTRO 2: Só queremos as consultas de HOJE
            if (consulta.data_consulta && consulta.data_consulta.startsWith(dataDeHojeTexto)) {
                
                // Converte a data da BD num objeto de data real do JavaScript (que assume o teu fuso horário)
                const dataDaConsulta = new Date(consulta.data_consulta);

                // 🛡️ FILTRO 3: A consulta ainda vai acontecer hoje? (Compara o tempo diretamente)
                if (dataDaConsulta >= agora) {
                    
                    // Extrai a hora já convertida e formatada para Portugal (PT-PT)
                    const horaFormatada = dataDaConsulta.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    
                    consultasFiltradas.push({
                        dataObjeto: dataDaConsulta, // Guardamos o objeto para ordenar facilmente depois
                        horaDisplay: horaFormatada,
                        nomeAnimal: consulta.nome_animal || consulta.nome || "Paciente", // Tenta ler nome_animal primeiro
                        especie: consulta.especie_animal || consulta.especie || "cão", 
                        cliente: consulta.nome_cliente || consulta.nome || "Proprietário",
                        servico: consulta.motivo || "Consulta Geral"
                    });
                }
            }
        });

        // Ordenar a lista cronologicamente da mais cedo para a mais tarde (usa o tempo real)
        consultasFiltradas.sort((a, b) => a.dataObjeto - b.dataObjeto);

        // Limitar a exibição às próximas 5 consultas do turno
        const proximas5 = consultasFiltradas.slice(0, 5);

        tbody.innerHTML = ""; // Limpar mensagem de carregamento

        // Se o médico não tiver trabalho agendado para o resto do dia
        if (proximas5.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: #2ea89c; font-weight: bold;"><i class="fa fa-mug-hot"></i> Não tens mais consultas agendadas para hoje. Bom descanso!</td></tr>`;
            return;
        }

        // Renderizar as linhas da tabela no HTML
        proximas5.forEach(consulta => {
            let especieStr = consulta.especie.toLowerCase();
            let icone = especieStr.includes('cão') || especieStr.includes('cao') ? 'dog' : (especieStr.includes('gato') ? 'cat' : 'paw');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: #2ea89c;">${consulta.horaDisplay}</td>
                <td><i class="fa fa-${icone}" style="color: #7f8c8d; margin-right: 8px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.cliente}</td>
                <td><span class="badge-servico" style="background: #e0f2f1; color: #2ea89c; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${consulta.servico}</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar as consultas reais:", erro);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #e74c3c;"><i class="fa fa-exclamation-triangle"></i> Erro de ligação à Base de Dados.</td></tr>`;
    }
}
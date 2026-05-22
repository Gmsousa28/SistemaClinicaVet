// =================================================================
// 1. FUNÇÕES DOS POPUPS E REDIRECIONAMENTO
// =================================================================
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

function irParaConsulta(id) {
    window.location.href = `momento_consulta.html?id=${id}`;
}

// =================================================================
// 2. CARREGAR CONSULTAS FUTURAS DA API (COM MARGEM DE 30 MIN)
// =================================================================
async function carregarConsultasDaAPI() {
    const tbody = document.getElementById('corpo-tabela-consultas');

    if (!tbody) {
        console.error("tbody não encontrado no HTML!");
        return;
    }

    // 🎒 Buscar os dados do Veterinário logado
    const dadosMochila = localStorage.getItem('utilizadorLogado');
    
    if (!dadosMochila) {
        console.error("Erro: Médico não está logado!");
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e74c3c;">Sessão inválida ou expirada. Por favor, volta a fazer login.</td></tr>`;
        return;
    }

    const utilizador = JSON.parse(dadosMochila);
    const idDoVetLogado = utilizador.id_colaborador; 

    try {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #7f8c8d;"><i class="fa fa-spinner fa-spin"></i> A carregar consultas futuras...</td></tr>`;

        // Fazer o pedido à API
        const resposta = await fetch(`http://localhost:8008/api/consultas/veterinario/${idDoVetLogado}`);
        const resultado = await resposta.json();

        if (!resposta.ok) throw new Error(resultado.message);

        const todasConsultas = resultado.data || resultado; 
        const agora = new Date();
        let consultasFiltradas = [];

        // Filtrar as consultas futuras com tolerância de 30 min
        todasConsultas.forEach(consulta => {
            if (Number(consulta.id_veterinario) !== Number(idDoVetLogado)) {
                return; 
            }

            if (consulta.data_consulta) {
                const dataDaConsulta = new Date(consulta.data_consulta);
                const limiteParaDesaparecer = new Date(dataDaConsulta.getTime() + 30 * 60000);

                if (limiteParaDesaparecer >= agora) {
                    // Formata a data para "Dia/Mês" e "Hora:Minutos"
                    const diaMes = dataDaConsulta.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                    const hora = dataDaConsulta.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    const dataEHoraDisplay = `${diaMes} <br> <span style="font-size: 0.85em; color: #7f8c8d;">${hora}</span>`;

                    const motivoTexto = consulta.motivo || "Nenhum motivo especificado.";
                    const motivoSeguro = motivoTexto.replace(/'/g, "\\'");

                    consultasFiltradas.push({
                        dataObjeto: dataDaConsulta, 
                        id_consulta: consulta.id_consulta,
                        horaDisplay: dataEHoraDisplay, 
                        nomeAnimal: consulta.nome_animal || "Desconhecido", 
                        especie: consulta.especie_animal || "Desconhecida", 
                        raca: consulta.raca_animal || "N/A",
                        cliente: consulta.nome_cliente || "Desconhecido",
                        motivoSeguro: motivoSeguro
                    });
                }
            }
        });

        // Ordenar do mais próximo para o mais distante
        consultasFiltradas.sort((a, b) => a.dataObjeto - b.dataObjeto);

        tbody.innerHTML = ""; 

        if (consultasFiltradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: #2ea89c; font-weight: bold;"><i class="fa fa-calendar-check"></i> A tua agenda está totalmente limpa! Não há consultas futuras marcadas.</td></tr>`;
            return;
        }

        // Desenhar a tabela dinamicamente
        consultasFiltradas.forEach(consulta => {
            let especieStr = consulta.especie.toLowerCase();
            let icone = especieStr.includes('cão') || especieStr.includes('cao') ? 'dog' : (especieStr.includes('gato') ? 'cat' : 'paw');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: #2ea89c; text-align: center;">${consulta.horaDisplay}</td> 
                <td><i class="fa fa-${icone}" style="color: #7f8c8d; margin-right: 5px;"></i> ${consulta.nomeAnimal}</td>
                <td>${consulta.especie}</td> 
                <td>${consulta.raca}</td>
                <td>${consulta.cliente}</td> 
                
                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="abrirPopupInfo('${consulta.motivoSeguro}')" 
                        title="Ver motivo da consulta"
                        style="background-color: transparent; color: #3498db; border: 2px solid #3498db; border-radius: 50%; width: 32px; height: 32px; cursor: pointer;"
                    >
                        <i class="fa fa-info"></i>
                    </button>
                </td>

                <td style="text-align: center;">
                    <button 
                        type="button"
                        onclick="irParaConsulta(${consulta.id_consulta})"
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
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e74c3c;"><i class="fa fa-exclamation-triangle"></i> Erro de ligação à Base de Dados. Confirma se o servidor está ligado.</td></tr>`;
    }
}

// =================================================================
// 3. MOTOR DE ARRANQUE DA PÁGINA (DOM COMPLETAMENTE CARREGADO)
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // 🎒 Buscar os dados do Veterinário logado para a saudação dinâmica
    const dadosMochila = localStorage.getItem('utilizadorLogado');
    const msgBoasVindas = document.getElementById('mensagem-boas-vindas');

    if (dadosMochila && msgBoasVindas) {
        const utilizador = JSON.parse(dadosMochila);
        const idDoVetLogado = utilizador.id_colaborador;

        try {
            // Chamar a API do perfil para ler o nome verdadeiro do médico
            const respostaVet = await fetch(`http://localhost:8008/api/veterinarios/perfil/${idDoVetLogado}`);
            
            if (respostaVet.ok) {
                const dadosPerfil = await respostaVet.json();
                const nomeDoMedico = dadosPerfil.data.nome;
                
                // Injeta: "Olá Dr(a). Nome! Bom turno de trabalho."
                msgBoasVindas.innerHTML = `Olá Dr(a). <strong>${nomeDoMedico}</strong>! Boa consulta.`;
            } else {
                msgBoasVindas.innerText = "Olá! Bom turno de trabalho.";
            }
        } catch (erro) {
            console.error("Erro ao buscar o nome do médico:", erro);
            msgBoasVindas.innerText = "Olá! Boa consulta.";
        }
    }

    // Carrega a tabela assim que abre a página
    carregarConsultasDaAPI();

    // Liga o clique do botão "X" do popup de forma segura
    const btnFechar = document.getElementById('btn-fechar-x-motivo');
    if (btnFechar) {
        btnFechar.addEventListener('click', fecharPopupInfo);
    }

    // Fecha o popup ao clicar na área escura envolvente
    const popup = document.getElementById('popup-motivo');
    if (popup) {
        popup.addEventListener('click', (evento) => {
            if (evento.target === popup) { 
                fecharPopupInfo();
            }
        });
    }
});
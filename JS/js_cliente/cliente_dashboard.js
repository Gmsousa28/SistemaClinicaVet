// ==========================================================================
// LÓGICA DO DASHBOARD (PAINEL PRINCIPAL) DO CLIENTE
// ==========================================================================

async function carregarDadosDashboard() {
    // 1. Descobrir quem é o cliente logado e o seu NOME
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    if (!dadosLoginStr) return;
    
    let idClienteLogado;
    let nomeCliente = "Cliente";

    try {
        const utilizador = JSON.parse(dadosLoginStr);
        idClienteLogado = utilizador.id_cliente;
        // Apanha só o primeiro nome (Ex: "Rui Costa" fica "Rui")
        nomeCliente = utilizador.nome ? utilizador.nome.split(' ')[0] : "Cliente"; 
    } catch (e) { return; }


    // ==========================================
    // A TUA SAUDAÇÃO INTELIGENTE! 
    // ==========================================
    const tituloDashboard = document.querySelector('.header-texto h1');
    if (tituloDashboard) {
        const horaAtual = new Date().getHours();
        let saudacao = 'Boa noite'; 

        if (horaAtual >= 6 && horaAtual < 12) {
            saudacao = 'Bom dia';
        } else if (horaAtual >= 12 && horaAtual < 20) {
            saudacao = 'Boa tarde';
        }
        // Aplica a saudação com o nome real da BD!
        tituloDashboard.innerHTML = `${saudacao}, ${nomeCliente} 👋`;
    }


    try {
        // 2. Ir buscar os Animais à Base de Dados
        const respAnimais = await fetch(`http://localhost:8008/api/animais/cliente/${idClienteLogado}`);
        let totalAnimaisAtivos = 0; // Mudámos o nome da variável para ser mais claro
        
        if (respAnimais.ok) {
            const resAnimais = await respAnimais.json();
            
            // ==========================================
            // NOVO: FILTRO PARA IGNORAR ANIMAIS MORTOS
            // ==========================================
            if (resAnimais.data && Array.isArray(resAnimais.data)) {
                const animaisVivos = resAnimais.data.filter(animal => {
                    const estado = animal.estado ? animal.estado.toLowerCase() : '';
                    const isMorto = (estado === 'falecido' || estado === 'morto' || estado === 'inativo' || animal.vivo === false);
                    return !isMorto; // Só guarda os que NÃO estão mortos
                });
                totalAnimaisAtivos = animaisVivos.length;
            }
        }

        // 3. Ir buscar as Consultas à Base de Dados
        const respConsultas = await fetch(`http://localhost:8008/api/consultas/cliente/${idClienteLogado}`);
        let consultas = [];
        if (respConsultas.ok) {
            const resConsultas = await respConsultas.json();
            consultas = resConsultas.data || [];
        }

        // 4. Separar Consultas (Passadas vs Futuras)
        const hoje = new Date();
        const consultasFuturas = consultas
            .filter(c => new Date(c.data_hora) > hoje)
            .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora)); 
        
        const consultasPassadas = consultas.filter(c => new Date(c.data_hora) <= hoje);

        // ==========================================
        // PREENCHER OS 4 CARTÕES BRANCOS
        // ==========================================
        const paragrafosCards = document.querySelectorAll('.card-branco p');

        if (consultasFuturas.length > 0) {
            const proxData = new Date(consultasFuturas[0].data_hora);
            const diaMes = proxData.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' });
            const hora = proxData.toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });
            paragrafosCards[0].innerText = `${diaMes} - ${hora}`;
        } else {
            paragrafosCards[0].innerText = "Sem marcações";
        }

        // AGORA USA A VARIÁVEL DOS ANIMAIS ATIVOS!
        paragrafosCards[1].innerText = `${totalAnimaisAtivos} registado${totalAnimaisAtivos !== 1 ? 's' : ''}`;

        const vacinasPendentes = consultasFuturas.filter(c => c.motivo.toLowerCase().includes('vacina')).length;
        paragrafosCards[2].innerText = `${vacinasPendentes} pendente${vacinasPendentes !== 1 ? 's' : ''}`;

        paragrafosCards[3].innerText = `${consultasPassadas.length} consulta${consultasPassadas.length !== 1 ? 's' : ''}`;


        // ==========================================
        // AVISO LARANJA (MANTENDO O BOTÃO AGENDAR!)
        // ==========================================
        const barraAviso = document.querySelector('.barra-larga');
        const avisoDestaque = document.querySelector('.aviso-destaque .mensagem-aviso');
        const daquiA3Dias = new Date();
        daquiA3Dias.setDate(hoje.getDate() + 3);

        const avisosUrgentes = consultasFuturas.filter(c => new Date(c.data_hora) <= daquiA3Dias);

        if (avisosUrgentes.length > 0) {
            const proximo = avisosUrgentes[0];
            
            // Adicionámos o botão "X"
            avisoDestaque.innerHTML = `
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <div><strong>Atenção:</strong> Tens uma consulta de <strong>${proximo.motivo}</strong> para o <strong>${proximo.nome_animal}</strong> a aproximar-se.</div>
                    <i class="fa fa-times btn-fechar-aviso" style="cursor: pointer; color: #888; font-size: 1.2rem; padding-left: 15px;" title="Fechar aviso"></i>
                </div>
            `;

            // Lógica de Fechar o Aviso (Esconde só o texto e não o botão!)
            const btnFechar = avisoDestaque.querySelector('.btn-fechar-aviso');
            btnFechar.addEventListener('click', function() {
                avisoDestaque.style.transition = 'opacity 0.3s ease';
                avisoDestaque.style.opacity = '0';
                
                setTimeout(() => {
                    // Substitui a mensagem de perigo por uma mensagem de paz
                    avisoDestaque.innerHTML = `<strong>Tudo tranquilo:</strong> Lembrete ocultado.`;
                    avisoDestaque.style.opacity = '1';
                }, 300);
            });

        } else {
            // Se o cliente entrar no site e não tiver avisos, o botão continua lá!
            avisoDestaque.innerHTML = `<strong>Tudo tranquilo:</strong> Não tens consultas urgentes a aproximar-se.`;
            document.querySelector('.titulo-seccao').innerText = "Tudo em dia com os seus patudos!";
        }


        // ==========================================
        // PREENCHER A TABELA
        // ==========================================
        const containerTabela = document.querySelector('.cartao-tabela');
        const linhaVazia = containerTabela.querySelector('.linha-tabela-vazia');

        if (consultasFuturas.length > 0) {
            if (linhaVazia) linhaVazia.style.display = 'none'; 

            consultasFuturas.slice(0, 4).forEach(consulta => {
                const dataObj = new Date(consulta.data_hora);
                const dataStr = dataObj.toLocaleDateString('pt-PT');
                const horaStr = dataObj.toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'});
                
                const linhaHTML = `
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); padding: 15px; border-bottom: 1px solid #eee; align-items: center; font-size: 0.9rem;">
                        <div><i class="fa-regular fa-calendar"></i> ${dataStr} ${horaStr}</div>
                        <div><i class="fa-solid fa-paw" style="color: #2ea89c;"></i> ${consulta.nome_animal}</div>
                        <div>${consulta.motivo}</div>
                        <div><i class="fa-solid fa-user-doctor"></i> ${consulta.nome_veterinario || 'A atribuir'}</div>
                        <div>
                            <a href="consultas_cliente.html" style="background: #2c3e50; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.8rem;">Ver Detalhes</a>
                        </div>
                    </div>
                `;
                containerTabela.innerHTML += linhaHTML;
            });
        }

    } catch (erro) {
        console.error("Erro ao carregar o dashboard:", erro);
    }
}

// Dispara a função quando a página acaba de carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDashboard();
});
document.addEventListener('DOMContentLoaded', function() {
    
    // Configuração (ajusta se tiveres IDs diferentes no HTML)
    const API_BASE = "http://localhost:8008/api";
    const tbodyConsultasHoje = document.querySelector('table tbody'); // Seleciona o corpo da tabela

    // Executa a função logo que a página carrega
    if (tbodyConsultasHoje) {
        carregarConsultasDeHoje();
    }

    async function carregarConsultasDeHoje() {
        // Mostra a carregar
        tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fa fa-spinner fa-spin"></i> A procurar consultas para hoje...</td></tr>';

        try {
            // 1. Vai buscar TODAS as consultas à base de dados
            const resposta = await fetch(`${API_BASE}/consultas`);
            const resultado = await resposta.json();

            if (resultado.status === 200) {
                
                // 2. 🛡️ FILTRO: Descobrir a data exata de HOJE (Formato YYYY-MM-DD)
                const dataHojeLocal = new Date();
                const ano = dataHojeLocal.getFullYear();
                const mes = String(dataHojeLocal.getMonth() + 1).padStart(2, '0');
                const dia = String(dataHojeLocal.getDate()).padStart(2, '0');
                const dataDeHojeTexto = `${ano}-${mes}-${dia}`; // Ex: "2026-05-17"

                // Filtra o array para manter APENAS as que começam com a data de hoje
                const consultasHoje = resultado.data.filter(c => {
                    return c.data_consulta && c.data_consulta.startsWith(dataDeHojeTexto);
                });

                tbodyConsultasHoje.innerHTML = ''; // Limpa a tabela

                // Se não houver consultas para hoje
                if (consultasHoje.length === 0) {
                    tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#7f8c8d;">Sem consultas marcadas para o dia de hoje. Bom descanso!</td></tr>';
                    return;
                }

                // 3. Desenhar as consultas na tabela
                consultasHoje.forEach(c => {
                    // Extrair só a hora (Ex: 09:30)
                    const horaConsulta = new Date(c.data_consulta).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'});
                    
                    const tr = document.createElement('tr');
                    
                    // Nota: Substitui as partes estáticas pelos dados reais da tua BD se a tua API os enviar 
                    // (ex: c.nome_animal, c.nome_cliente, etc.)
                    tr.innerHTML = `
                        <td>${horaConsulta}</td>
                        <td><i class="fa fa-dog" style="color:#7f8c8d;"></i> Animal ID: ${c.id_animal}</td>
                        <td>Cliente ID</td> 
                        <td>${c.motivo || 'Consulta'}</td>
                        <td>Vet ID: ${c.id_veterinario}</td>
                        <td>
                            <button class="btn-alternar-validar" style="background-color:#2ea89c; color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; font-weight:bold; transition: 0.3s;">
                                <i class="fa fa-check"></i> Validar
                            </button>
                        </td>
                    `;
                    tbodyConsultasHoje.appendChild(tr);
                });

                // =========================================================
                // 4. 🖱️ A MAGIA DO BOTÃO (EFEITO TOGGLE / LIGA-DESLIGA)
                // =========================================================
                const botoesValidar = document.querySelectorAll('.btn-alternar-validar');
                
                botoesValidar.forEach(botao => {
                    botao.addEventListener('click', function() {
                        
                        // Se o botão já disser "Validado", volta a "Validar"
                        if (this.innerText.includes('Validado')) {
                            this.innerHTML = '<i class="fa fa-check"></i> Validar';
                            this.style.backgroundColor = '#2ea89c'; // O teu verde original
                            this.style.opacity = '1';
                        } 
                        // Se disser "Validar", muda para "Validado"
                        else {
                            this.innerHTML = '<i class="fa fa-check-double"></i> Validado';
                            this.style.backgroundColor = '#7f8c8d'; // Um cinzento para mostrar que já está tratado
                            this.style.opacity = '0.7';
                        }
                    });
                });

            }
        } catch (erro) {
            console.error("Erro ao carregar a dashboard:", erro);
            tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro ao ligar ao servidor.</td></tr>';
        }
    }
});
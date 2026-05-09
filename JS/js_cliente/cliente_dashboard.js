document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. SAUDAÇÃO INTELIGENTE (Hora do dia) ---
    const tituloDashboard = document.querySelector('.titulo-dashboard');
    
    if (tituloDashboard) {
        const horaAtual = new Date().getHours();
        let saudacao = 'Boa noite'; // Por defeito é noite

        // Se for entre as 6h00 e as 11h59
        if (horaAtual >= 6 && horaAtual < 12) {
            saudacao = 'Bom dia';
        } 
        // Se for entre as 12h00 e as 19h59
        else if (horaAtual >= 12 && horaAtual < 20) {
            saudacao = 'Boa tarde';
        }

        // Troca o texto no HTML, mantendo o nome do João e o emoji
        tituloDashboard.innerHTML = `${saudacao}, João 👋`;
    }

    // --- 2. AVISOS INTERATIVOS ---
    const secAvisos = document.querySelector('.avisos-container');
    
    if (secAvisos) {
        secAvisos.addEventListener('click', function(e) {
            
            // Verifica se clicou no botão "X"
            const btnFechar = e.target.closest('.btn-fechar-aviso');
            
            if (btnFechar) {
                const aviso = btnFechar.closest('.aviso');
                
                // Animação de desaparecer
                aviso.style.opacity = '0';
                aviso.style.transform = 'translateX(30px)';
                
                // Espera 300ms e remove o HTML
                setTimeout(function() {
                    aviso.remove();
                    
                    // Se já não houver avisos, mostra uma mensagem de "Tudo limpo!"
                    const avisosRestantes = secAvisos.querySelectorAll('.aviso');
                    if (avisosRestantes.length === 0) {
                        const semAvisos = document.createElement('p');
                        semAvisos.style.textAlign = 'center';
                        semAvisos.style.color = '#888';
                        semAvisos.style.marginTop = '20px';
                        semAvisos.innerHTML = '<i class="fa fa-check-circle" style="color: #2ea89c; font-size: 24px; display: block; margin-bottom: 10px;"></i> Está tudo em dia! Não há novos avisos.';
                        secAvisos.appendChild(semAvisos);
                    }
                }, 300);
            }
        });
    }

});
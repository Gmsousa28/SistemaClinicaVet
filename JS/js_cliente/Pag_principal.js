document.addEventListener("DOMContentLoaded", () => {
    // 1. AS CHAVES DE LOGIN
    const chavesLogin = [
        "clienteLogado",
        "utilizadorLogado",
        "usuarioLogado",
        "userLogado",
        "isLoggedIn",
        "clienteAtual",
        "utilizadorAtual",
        "usuarioAtual",
        "user"
    ];

    const temValorDeLogin = (valor) => {
        if (!valor) {
            return false;
        }

        const normalizado = String(valor).trim().toLowerCase();
        return normalizado !== "false" &&
            normalizado !== "null" &&
            normalizado !== "undefined";
    };

    const estaLogado = chavesLogin.some((chave) => {
        return temValorDeLogin(localStorage.getItem(chave)) ||
            temValorDeLogin(sessionStorage.getItem(chave));
    });

    // 2. MOSTRAR/ESCONDER ELEMENTOS BASE
    document.querySelectorAll("[data-guest]").forEach((elemento) => {
        elemento.classList.toggle("oculto", estaLogado);
    });

    document.querySelectorAll("[data-auth]").forEach((elemento) => {
        elemento.classList.toggle("oculto", !estaLogado);
    });

    // ==========================================================================
    // --- A MAGIA DA NAVEGAÇÃO CONDICIONAL (ADMIN, VET, RECEÇÃO vs CLIENTE) ---
    // ==========================================================================
    if (estaLogado) {
        // Pega no tipo de utilizador e converte para minúsculas para evitar erros de maiúsculas
        let tipoUtilizador = localStorage.getItem("tipoUtilizador");
        if (tipoUtilizador) tipoUtilizador = tipoUtilizador.toLowerCase(); 

        const btnPerfil = document.querySelector('a[data-auth][href*="perfil_cliente.html"]');
        const btnMarcarConsulta = document.querySelector("a[data-requer-login]");
        const btnSair = document.querySelector("button[data-logout]");

        // SE FOR QUALQUER TIPO DE STAFF (Não é cliente)
        if (tipoUtilizador && tipoUtilizador !== "cliente") {
            
            // 1. Esconde o botão "Sair" para TODO o staff na página principal
            if (btnSair) btnSair.classList.add("oculto");

            // 2. Encaminhar consoante o Cargo exato
            if (tipoUtilizador === "admin") {
                if (btnPerfil) {
                    btnPerfil.href = "../frontend/Pag/Admin/admin_dashboard.html";
                    btnPerfil.innerText = "Dashboard Admin";
                }
                if (btnMarcarConsulta) {
                    btnMarcarConsulta.href = "../frontend/Pag/Admin/marcacoes_admin.html";
                    btnMarcarConsulta.innerText = "Gerir Marcações";
                }
            } 
            else if (tipoUtilizador === "veterinario" || tipoUtilizador === "vet") {
                if (btnPerfil) {
                    btnPerfil.href = "../frontend/Pag/Veterinário/dashboard_vet.html";
                    btnPerfil.innerText = "Dashboard Médico";
                }
                if (btnMarcarConsulta) {
                    btnMarcarConsulta.href = "../frontend/Pag/Veterinário/marcacoes_vet.html";
                    btnMarcarConsulta.innerText = "Ver Consultas";
                }
            } 
            else if (tipoUtilizador === "rececionista" || tipoUtilizador === "rececao") {
                if (btnPerfil) {
                    btnPerfil.href = "../frontend/Pag/Receção/rececionista.html";
                    btnPerfil.innerText = "Dashboard Receção";
                }
                if (btnMarcarConsulta) {
                    btnMarcarConsulta.href = "../frontend/Pag/Receção/marcacoes_recep.html";
                    btnMarcarConsulta.innerText = "Gerir Marcações";
                }
            }
        }
    }
    // ==========================================================================

    // 3. CLIQUE EM LINKS QUE REQUEREM LOGIN (Ex: Marcar Consulta)
    document.querySelectorAll("[data-requer-login]").forEach((link) => {
        link.addEventListener("click", (evento) => {
            if (estaLogado) {
                return; // Se estiver logado, o navegador segue o link normalmente
            }

            evento.preventDefault();

            const mensagem = link.dataset.avisoLogin ||
                "Precisa de iniciar sessão para continuar.";
            const paginaLogin = link.dataset.loginUrl;

            alert(mensagem);

            if (paginaLogin) {
                window.location.href = paginaLogin;
            }
        });
    });

    // 4. LÓGICA DE SAIR (LOGOUT)
    document.querySelectorAll("[data-logout]").forEach((botao) => {
        botao.addEventListener("click", () => {
            // Limpa todas as chaves possíveis de login
            chavesLogin.forEach((chave) => {
                localStorage.removeItem(chave);
                sessionStorage.removeItem(chave);
            });
            
            // GARANTIA EXTRA: Limpa também o tipo de utilizador para não haver bugs!
            localStorage.removeItem("tipoUtilizador");
            sessionStorage.removeItem("tipoUtilizador");

            window.location.href = "Pag_principal.html";
        });
    });
});
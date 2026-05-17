document.addEventListener("DOMContentLoaded", () => {
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

    document.querySelectorAll("[data-guest]").forEach((elemento) => {
        elemento.classList.toggle("oculto", estaLogado);
    });

    document.querySelectorAll("[data-auth]").forEach((elemento) => {
        elemento.classList.toggle("oculto", !estaLogado);
    });

    document.querySelectorAll("[data-logout]").forEach((botao) => {
        botao.addEventListener("click", () => {
            chavesLogin.forEach((chave) => {
                localStorage.removeItem(chave);
                sessionStorage.removeItem(chave);
            });

            window.location.href = "Pag_principal.html";
        });
    });
});
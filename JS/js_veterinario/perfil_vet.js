// O evento DOMContentLoaded garante que o HTML já está todo desenhado no ecrã
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mandar carregar os dados
    carregarDadosPerfil();

    // 2. Colocar o evento do botão de editar
    const btnEditar = document.getElementById('btn-editar-perfil');
    if(btnEditar) {
        btnEditar.addEventListener('click', () => {
            alert("Função de editar perfil será aberta aqui!");
        });
    }

    // 3. Configurar o botão de Sair (Logout)
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) {
        btnLogout.addEventListener('click', (event) => {
            event.preventDefault(); 
            // Limpa a memória
            localStorage.removeItem('utilizadorLogado');
            localStorage.removeItem('tipoUtilizador');
            // Manda de volta para a entrada
            window.location.href = '/frontend/Pag_principal.html';
        });
    }
});

async function carregarDadosPerfil() {
    try {
        // --- 1. ABRIR A MOCHILA (Verificar quem está logado) ---
        const dadosMochila = localStorage.getItem('utilizadorLogado');
        const tipoUtilizador = localStorage.getItem('tipoUtilizador');

        // Se a mochila estiver vazia ou não for veterinário, manda embora!
        if (!dadosMochila || tipoUtilizador !== 'veterinario') {
            alert("Sessão expirada ou acesso negado. Faz login novamente.");
            window.location.href = '../../login.html';
            return;
        }

        const utilizador = JSON.parse(dadosMochila);
        const idColaborador = utilizador.id_colaborador; // O ID que guardámos no momento do login!

        // --- 2. PEDIR OS DADOS REAIS À BASE DE DADOS ---
        // (O teu backend precisa de ter esta rota criada)
        const resposta = await fetch(`http://localhost:8008/api/veterinarios/${idColaborador}`);
        
        if (!resposta.ok) {
            throw new Error("Erro ao ir buscar os dados ao servidor.");
        }

        const json = await resposta.json();
        const dadosMedico = json.data; // Os dados que vêm do PostgreSQL

        // --- 3. PREENCHER LADO ESQUERDO (Visualização) ---
        // Se ainda não tiveres fotos na BD, deixamos uma imagem genérica
        document.getElementById('perfil-foto').src = dadosMedico.fotoUrl || "../../img/default_avatar.png";
        document.getElementById('perfil-nome-completo').textContent = dadosMedico.nome;
        document.getElementById('perfil-cargo').textContent = `${utilizador.cargo} - ${dadosMedico.especialidade}`; 
        
        // Como não temos "ano de entrada" na BD, podemos pôr algo genérico ou omitir
        document.getElementById('perfil-data-entrada').textContent = `Colaborador Ativo`;

        // --- 4. PREENCHER LADO DIREITO (Inputs do Formulário) ---
        document.getElementById('input-nome').value = dadosMedico.nome;
        document.getElementById('input-morada').value = dadosMedico.morada;
        document.getElementById('input-email').value = dadosMedico.email;
        document.getElementById('input-NIF').value = dadosMedico.nif; // Atenção: Em JS convém ser minúsculas se na BD estiver minúsculas
        document.getElementById('input-telefone').value = dadosMedico.contacto;
        document.getElementById('input-especialidade').value = dadosMedico.especialidade;

    } catch (erro) {
        console.error("Erro ao carregar o perfil:", erro);
        alert("Não foi possível carregar os dados reais do perfil. Verifica se o backend está ligado!");
    }
}
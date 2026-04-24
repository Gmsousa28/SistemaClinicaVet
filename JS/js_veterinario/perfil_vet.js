// O evento DOMContentLoaded garante que o HTML já está todo desenhado no ecrã
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mandar carregar os dados
    carregarDadosPerfil();

    // 2. Colocar o evento do botão AQUI DENTRO (Segurança extra)
    document.getElementById('btn-editar-perfil').addEventListener('click', () => {
        alert("Função de editar perfil será aberta aqui!");
    });
});

async function carregarDadosPerfil() {
    try {
        const dadosMedico = {
            fotoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
            titulo: "Dr.",
            nome: "Carlos Eduardo",
            morada: "Rua das Flores, 123, Lisboa",
            especialidade: "Veterinário", // Tu tens especialidade aqui...
            anoEntrada: 2015,
            email: "drjoao@miacaomigo.pt",
            NIF: "111222333",
            telefone: "932513429",
        };

        // 1. PREENCHER LADO ESQUERDO (Visualização)
        document.getElementById('perfil-foto').src = dadosMedico.fotoUrl;
        document.getElementById('perfil-nome-completo').textContent = `${dadosMedico.titulo} ${dadosMedico.nome}`;
        document.getElementById('perfil-cargo').textContent = dadosMedico.especialidade; 
        document.getElementById('perfil-data-entrada').textContent = `Na clínica desde ${dadosMedico.anoEntrada}`;

        // 2. PREENCHER LADO DIREITO (Inputs do Formulário)
        document.getElementById('input-nome').value = dadosMedico.nome;
        document.getElementById('input-morada').value = dadosMedico.morada;
        document.getElementById('input-email').value = dadosMedico.email;
        document.getElementById('input-NIF').value = dadosMedico.NIF;
        document.getElementById('input-telefone').value = dadosMedico.telefone;
        document.getElementById('input-especialidade').value = dadosMedico.especialidade;

    } catch (erro) {
        console.error("Erro ao carregar o perfil:", erro);
        alert("Não foi possível carregar os dados do perfil.");
    }
}
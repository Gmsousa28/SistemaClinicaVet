const API_BASE = "http://localhost:8008/api";

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. Ler quem fez login
    const utilizadorStorage = localStorage.getItem('utilizadorLogado');

    if (!utilizadorStorage) {
        alert("Sessão expirada. A redirecionar para o Login...");
        window.location.href = "../../index.html"; 
        return;
    }

    const utilizadorSessao = JSON.parse(utilizadorStorage);
    const idColaborador = utilizadorSessao.id_colaborador;
    const emailColaborador = utilizadorSessao.email;

    // 2. Preencher logo o Email e o @Username para não haver ecrãs vazios
    const elUsername = document.getElementById('perfil-username');
    const inputEmail = document.getElementById('conta-email');
    
    if (elUsername) elUsername.textContent = `@${emailColaborador.split('@')[0]}`;
    if (inputEmail) inputEmail.value = emailColaborador;

    let dadosFinais = null;

    // 3. Ligar à nova rota do Backend que tem a query do COALESCE
    try {
        const resposta = await fetch(`${API_BASE}/colaboradores/${idColaborador}`);
        
        if (resposta.ok) {
            const resultado = await resposta.json();
            dadosFinais = resultado.data; // Sucesso! Recebemos a linha com o nome, nif, telefone e morada
        } else {
            console.warn("Erro na resposta do servidor. Verifica se a rota /colaboradores/:id existe.");
        }
    } catch (erro) {
        console.error("Servidor offline ou erro de rede:", erro);
    }

    // 4. PLANO B (Caso a base de dados falhe, não quebra a página)
    if (!dadosFinais) {
        const parteEmail = emailColaborador.split('@')[0];
        const nomeCapitalizado = parteEmail.charAt(0).toUpperCase() + parteEmail.slice(1).split('.')[0];

        dadosFinais = {
            nome: utilizadorSessao.nome || `${nomeCapitalizado} (Offline)`,
            nif: "A carregar...",
            telefone: "N/A",
            morada: "N/A"
        };
    }

    // 5. Separar o Nome do Apelido
    let nomeCompleto = dadosFinais.nome || "Sem Nome";
    let primeiroNome = nomeCompleto;
    let apelido = "";

    if (nomeCompleto.includes(" ")) {
        const partes = nomeCompleto.trim().split(" ");
        primeiroNome = partes[0];
        apelido = partes.slice(1).join(" "); // Junta todos os apelidos que sobrarem
    }

    // 6. Injetar os dados reais no HTML
    const elNomeCompleto = document.getElementById('perfil-nome-completo');
    const inputNome = document.getElementById('conta-nome');
    const inputApelido = document.getElementById('conta-apelido');
    const inputNif = document.getElementById('conta-nif');
    const inputTelefone = document.getElementById('conta-telefone');
    const inputMorada = document.getElementById('conta-morada');

    if (elNomeCompleto) elNomeCompleto.textContent = nomeCompleto;
    if (inputNome) inputNome.value = primeiroNome;
    if (inputApelido) inputApelido.value = apelido;
    if (inputNif) inputNif.value = dadosFinais.nif || "";
    if (inputTelefone) inputTelefone.value = dadosFinais.telefone || "";
    if (inputMorada) inputMorada.value = dadosFinais.morada || "";

    // -------------------------------------------------------
    // 7. SISTEMA DE EDIÇÃO DE PERFIL
    // -------------------------------------------------------
    const btnEditar = document.getElementById('btn-editar-perfil');
    let modoEdicao = false;

    if (btnEditar) {
        btnEditar.addEventListener('click', function() {
            modoEdicao = !modoEdicao;
            
            // Campos que a pessoa pode editar (NIF e Email ficam trancados)
            const camposEditaveis = [inputNome, inputApelido, inputTelefone, inputMorada];
            
            camposEditaveis.forEach(campo => {
                if (campo) campo.disabled = !modoEdicao;
            });

            if (modoEdicao) {
                btnEditar.textContent = "Guardar Alterações";
                btnEditar.style.backgroundColor = "#e67e22"; // Laranja para chamar a atenção
            } else {
                btnEditar.textContent = "Editar Perfil";
                btnEditar.style.backgroundColor = ""; // Volta à cor normal
                
                // Mostra o popup verde de sucesso
                const alerta = document.getElementById('alerta-sucesso');
                if (alerta) {
                    alerta.style.display = 'block';
                    setTimeout(() => alerta.style.display = 'none', 3000);
                }
            }
        });
    }
});
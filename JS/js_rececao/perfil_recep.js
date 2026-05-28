const API_BASE = "http://localhost:8008/api";

document.addEventListener('DOMContentLoaded', async function() {
    
    // Le os dados guardados da sessao atual
    const utilizadorStorage = localStorage.getItem('utilizadorLogado');

    if (!utilizadorStorage) {
        alert("Sessão expirada. A redirecionar para o Login...");
        window.location.href = "../../index.html"; 
        return;
    }

    const utilizadorSessao = JSON.parse(utilizadorStorage);
    const idColaborador = utilizadorSessao.id_colaborador;
    const emailColaborador = utilizadorSessao.email;

    // Preenche logo o email e o username para evitar campos vazios
    const elUsername = document.getElementById('perfil-username');
    const inputEmail = document.getElementById('conta-email');
    
    if (elUsername) elUsername.textContent = `@${emailColaborador.split('@')[0]}`;
    if (inputEmail) inputEmail.value = emailColaborador;

    let dadosFinais = null;

    // Procura no backend os dados completos do colaborador
    try {
        const resposta = await fetch(`${API_BASE}/colaboradores/${idColaborador}`);
        
        if (resposta.ok) {
            const resultado = await resposta.json();
            dadosFinais = resultado.data; // dados completos do perfil
        } else {
            console.warn("Erro na resposta do servidor. Verifica se a rota /colaboradores/:id existe.");
        }
    } catch (erro) {
        console.error("Servidor offline ou erro de rede:", erro);
    }

    // Plano alternativo caso o backend nao devolva dados
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

    // Separa o primeiro nome do resto do nome
    let nomeCompleto = dadosFinais.nome || "Sem Nome";
    let primeiroNome = nomeCompleto;
    let apelido = "";

    if (nomeCompleto.includes(" ")) {
        const partes = nomeCompleto.trim().split(" ");
        primeiroNome = partes[0];
        apelido = partes.slice(1).join(" "); // junta os apelidos restantes
    }

    // Preenche os campos do perfil com os dados finais
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

    // Alterna entre modo de visualizacao e modo de edicao
    const btnEditar = document.getElementById('btn-editar-perfil');
    let modoEdicao = false;

    if (btnEditar) {
        btnEditar.addEventListener('click', function() {
            modoEdicao = !modoEdicao;
            
            // O NIF e o email ficam bloqueados porque identificam a conta
            const camposEditaveis = [inputNome, inputApelido, inputTelefone, inputMorada];
            
            camposEditaveis.forEach(campo => {
                if (campo) campo.disabled = !modoEdicao;
            });

            if (modoEdicao) {
                btnEditar.textContent = "Guardar Alterações";
                btnEditar.style.backgroundColor = "#e67e22"; // destaca o modo de edicao
            } else {
                btnEditar.textContent = "Editar Perfil";
                btnEditar.style.backgroundColor = ""; // volta a cor normal
                
                // Mostra feedback depois de sair do modo de edicao
                const alerta = document.getElementById('alerta-sucesso');
                if (alerta) {
                    alerta.style.display = 'block';
                    setTimeout(() => alerta.style.display = 'none', 3000);
                }
            }
        });
    }

    
});

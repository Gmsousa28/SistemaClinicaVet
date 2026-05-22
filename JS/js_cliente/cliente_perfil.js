document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // --- SEGURANÇA E LIGAÇÃO À BASE DE DADOS ---
    // ==========================================================================
    
    // 1. Vai à gaveta nova que o auth.js criou ler os dados do utilizador
    const dadosSessao = localStorage.getItem("utilizadorLogado");
    let idClienteAtual = null;

    if (dadosSessao) {
        try {
            const utilizador = JSON.parse(dadosSessao);
            idClienteAtual = utilizador.id_cliente; // Extrai o ID do JSON
        } catch (e) {
            console.error("Erro ao ler os dados da sessão.");
        }
    }

    // 2. Expulsa quem não tem login (ou se não houver um id_cliente válido)!
    if (!idClienteAtual) {
        alert("Acesso negado! Por favor, faça login para ver o seu perfil.");
        window.location.href = "../../Pag/Logins_Sessões/login.html"; // Verifica se este caminho está certo no teu projeto
        return; // Pára o script imediatamente
    }

    const urlApiClientes = `http://localhost:8008/api/clientes`; 
    const urlApiAnimais = `http://localhost:8008/api/animais`; 
    const urlApiConsultas = `http://localhost:8008/api/consultas`; 

    // Variável Global para os IDs dos animais (para o filtro das consultas)
    let meusAnimaisIDs = [];

    // ==========================================================================
    // --- 1. DADOS DO PERFIL ---
    // ==========================================================================
    async function carregarPerfil() {
        try {
            const resposta = await fetch(`${urlApiClientes}/id/${idClienteAtual}`);
            if (!resposta.ok) return; 

            const resultado = await resposta.json();

            if (resultado.status === 200 && resultado.data) {
                const cliente = resultado.data;
                const partesNome = (cliente.nome || "").split(' ');
                const primeiroNome = partesNome[0] || "";
                const apelido = partesNome.length > 1 ? partesNome.slice(1).join(' ') : "";

                if(document.getElementById('input-nome')) document.getElementById('input-nome').value = primeiroNome;
                if(document.getElementById('input-apelido')) document.getElementById('input-apelido').value = apelido;
                if(document.getElementById('input-email')) document.getElementById('input-email').value = cliente.email || "";
                if(document.getElementById('input-nif')) document.getElementById('input-nif').value = cliente.nif || "";
                if(document.getElementById('input-contacto')) document.getElementById('input-contacto').value = cliente.contacto || "";
                if(document.getElementById('input-morada')) document.getElementById('input-morada').value = cliente.morada || "";
                
                if(document.getElementById('nome-lateral')) document.getElementById('nome-lateral').innerText = cliente.nome;
                if(document.getElementById('user-lateral')) document.getElementById('user-lateral').innerText = `@${primeiroNome.toLowerCase()}`; 
            }
        } catch (erro) {
            console.error("Erro ao carregar Perfil:", erro);
        }
    }

    carregarPerfil();

    // Guardar Perfil
    const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
    const alertaSucesso = document.getElementById('alerta-sucesso'); 

    if (btnGuardarPerfil) {
        btnGuardarPerfil.addEventListener('click', async () => {
            const nomeInput = document.getElementById('input-nome').value.trim();
            const apelidoInput = document.getElementById('input-apelido').value.trim();
            const nomeCompleto = nomeInput + (apelidoInput ? " " + apelidoInput : "");

            const dadosAtualizados = {
                nome: nomeCompleto,
                email: document.getElementById('input-email').value,
                nif: document.getElementById('input-nif').value,
                contacto: document.getElementById('input-contacto').value,
                morada: document.getElementById('input-morada').value
            };

            try {
                const resposta = await fetch(`${urlApiClientes}/${idClienteAtual}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                const resultado = await resposta.json();

                if (resultado.status === 200) {
                    const perfilNome = document.getElementById('nome-lateral');
                    const perfilUser = document.getElementById('user-lateral');
                    if(perfilNome) perfilNome.innerText = nomeCompleto;
                    if(perfilUser) perfilUser.innerText = `@${nomeInput.toLowerCase()}`;

                    if(alertaSucesso) {
                        alertaSucesso.classList.add('mostrar');
                        setTimeout(() => { alertaSucesso.classList.remove('mostrar'); }, 2500);
                    }
                } else {
                    alert("Erro ao atualizar: " + resultado.message);
                }
            } catch (erro) {
                console.error("Erro ao guardar perfil:", erro);
            }
        });
    }

    // ==========================================================================
    // --- 2. GESTÃO DOS ANIMAIS E 3. CONTADOR DE CONSULTAS ---
    // ==========================================================================
    const listaAnimais = document.querySelector('.animais-lista');
    const modalAdd = document.getElementById('modal-animal');
    
    const htmlBotaoAdicionar = `
        <button class="animal-card adicionar" type="button">
            <span class="circulo-add"><i class="fa fa-plus"></i></span>
            <p>Adicionar</p>
        </button>
    `;

    async function carregarAnimaisEConsultas() {
        if (!listaAnimais) return;

        try {
            // --- A) Buscar os Animais ---
            const respostaAnimais = await fetch(urlApiAnimais);
            if (!respostaAnimais.ok) return;

            const resultadoAnimais = await respostaAnimais.json();

            if (resultadoAnimais.status === 200 && Array.isArray(resultadoAnimais.data)) {
                const meusAnimais = resultadoAnimais.data.filter(a => a.id_cliente == idClienteAtual);
                
                // Guardar apenas os números de ID dos animais para usarmos nas consultas!
                meusAnimaisIDs = meusAnimais.map(a => a.id_animal);
                
                const statsAnimais = document.querySelector('.perfil-stats span:first-child strong');
                const badgeAnimais = document.querySelector('.meus-animais .badge');
                if (statsAnimais) statsAnimais.innerText = meusAnimais.length;
                if (badgeAnimais) badgeAnimais.innerText = `${meusAnimais.length} ativos`;

                listaAnimais.innerHTML = '';
                meusAnimais.forEach(animal => {
                    let fotoSrc = animal.especie.toLowerCase() === 'gato' 
                        ? 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=240&q=80' 
                        : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=240&q=80';
                    
                    const cartao = document.createElement('div');
                    cartao.className = 'animal-card';
                    cartao.innerHTML = `
                        <div class="foto-animal-wrapper">
                            <img src="${fotoSrc}" alt="${animal.nome}">
                            <div class="acoes-animal">
                                <button class="btn-editar-animal" type="button" aria-label="Editar ${animal.nome}"><i class="fa fa-pen"></i></button>
                                <button class="btn-apagar-animal" data-id="${animal.id_animal}" type="button" aria-label="Apagar ${animal.nome}"><i class="fa fa-trash"></i></button>
                            </div>
                        </div>
                        <p>${animal.nome}</p>
                        <small>${animal.especie}</small>
                    `;
                    listaAnimais.appendChild(cartao);
                });

                listaAnimais.insertAdjacentHTML('beforeend', htmlBotaoAdicionar);
                ligarBotaoAdicionar();
            }

            // --- B) Buscar as Consultas (agora que sabemos os IDs dos animais) ---
            const respostaConsultas = await fetch(urlApiConsultas);
            if (!respostaConsultas.ok) {
                console.warn("API de Consultas não devolveu resposta OK.");
                return;
            }

            const resultadoConsultas = await respostaConsultas.json();

            if (resultadoConsultas.status === 200 && Array.isArray(resultadoConsultas.data)) {
                const consultasFuturas = resultadoConsultas.data.filter(c => 
                    meusAnimaisIDs.includes(c.id_animal) && 
                    c.estado && 
                    (c.estado.toLowerCase() === 'agendada' || c.estado.toLowerCase() === 'pendente')
                );

                const statsConsultas = document.getElementById('stats-consultas');
                if (statsConsultas) {
                    statsConsultas.innerText = consultasFuturas.length;
                }
            }

        } catch (erro) {
            console.error("Erro ao carregar dados dinâmicos (Animais/Consultas):", erro);
        }
    }

    carregarAnimaisEConsultas();

    function ligarBotaoAdicionar() {
        const btnAdicionarNovo = document.querySelector('.animal-card.adicionar');
        if (btnAdicionarNovo && modalAdd) {
            btnAdicionarNovo.addEventListener('click', () => {
                modalAdd.classList.add('ativo');
                modalAdd.setAttribute("aria-hidden", "false");
                document.body.classList.add('no-scroll');
            });
        }
    }

    document.querySelectorAll(".fechar-modal, .modal-overlay").forEach((elemento) => {
        elemento.addEventListener("click", (evento) => {
            if (evento.target !== elemento && !elemento.classList.contains("fechar-modal")) return;
            document.querySelectorAll(".modal-overlay").forEach((modal) => {
                modal.classList.remove("ativo");
                modal.setAttribute("aria-hidden", "true");
            });
            document.body.classList.remove("no-scroll");
        });
    });

    const btnGuardarNovo = document.getElementById('btn-guardar-animal');
    if (btnGuardarNovo) {
        btnGuardarNovo.addEventListener('click', async function() {
            const nomeInput = document.getElementById('novo-nome').value.trim();
            const especieInput = document.getElementById('nova-especie').value.trim();

            if (nomeInput !== '' && especieInput !== '') {
                const novoAnimalDados = {
                    id_cliente: parseInt(idClienteAtual),
                    nome: nomeInput,
                    especie: especieInput,
                    raca: "Não definida",
                    sexo: "Desconhecido",
                    data_nascimento: null,
                    estado: "Ativo"
                };

                try {
                    const resposta = await fetch(urlApiAnimais, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(novoAnimalDados)
                    });
                    
                    const resultado = await resposta.json();

                    if (resultado.status === 201) {
                        carregarAnimaisEConsultas(); // Recarrega tudo
                        document.getElementById('novo-nome').value = '';
                        document.getElementById('nova-especie').value = '';
                        
                        modalAdd.classList.remove('ativo');
                        modalAdd.setAttribute("aria-hidden", "true");
                        document.body.classList.remove('no-scroll');
                    } else {
                        alert("Erro ao criar animal: " + resultado.message);
                    }
                } catch (erro) {
                    console.error("Erro no POST do animal:", erro);
                }
            } else {
                alert("Preencha o nome e a espécie do animal!");
            }
        });
    }

    if (listaAnimais) {
        listaAnimais.addEventListener('click', async function(e) {
            const btnApagar = e.target.closest('.btn-apagar-animal');
            
            if (btnApagar) {
                const idParaApagar = btnApagar.getAttribute('data-id');
                const cartao = btnApagar.closest('.animal-card');
                const nomeAnimal = cartao.querySelector('p').innerText;

                if (confirm(`Tem a certeza que deseja remover o(a) ${nomeAnimal}?`)) {
                    try {
                        const resposta = await fetch(`${urlApiAnimais}/${idParaApagar}`, {
                            method: 'DELETE'
                        });
                        
                        const resultado = await resposta.json();

                        if (resultado.status === 200) {
                            carregarAnimaisEConsultas(); // Atualiza a lista!
                        } else {
                            alert("Erro ao remover: " + resultado.message);
                        }
                    } catch (erro) {
                        console.error("Erro no DELETE:", erro);
                    }
                }
            }
        });
    }

    // ==========================================================================
    // --- 4. UI EXTRAS (Foto de perfil, Botão Editar e Avisos) ---
    // ==========================================================================
    const btnEditarPerfilLateral = document.querySelector('.perfil .editar');
    const inputPrimeiroNome = document.getElementById('input-nome');
    if (btnEditarPerfilLateral && inputPrimeiroNome) {
        btnEditarPerfilLateral.addEventListener('click', () => {
            inputPrimeiroNome.focus();
        });
    }

    document.querySelectorAll(".btn-fechar-aviso").forEach((botao) => {
        botao.addEventListener("click", () => botao.closest(".aviso").remove());
    });

    const inputFoto = document.getElementById('input-foto');
    const fotoPerfil = document.getElementById('foto-perfil');
    if (inputFoto && fotoPerfil) {
        inputFoto.addEventListener('change', function(evento) {
            const ficheiro = evento.target.files[0];
            if (ficheiro) {
                const leitor = new FileReader();
                leitor.onload = function(e) { fotoPerfil.src = e.target.result; }
                leitor.readAsDataURL(ficheiro);
            }
        });
    }
});
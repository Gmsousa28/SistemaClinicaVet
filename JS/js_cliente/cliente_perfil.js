document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // --- CONFIGURAÇÃO DAS APIs ---
    // ==========================================================================
    const idClienteAtual = 1; 
    const urlApiClientes = `http://localhost:8008/api/clientes`; 
    const urlApiAnimais = `http://localhost:8008/api/animais`; 

    // ==========================================================================
    // --- 1. DADOS DO PERFIL (LER E GUARDAR) ---
    // ==========================================================================
    
    // Ler Dados do Perfil
    async function carregarPerfil() {
        console.log("Iniciando carregamento do perfil...");
        try {
            const resposta = await fetch(`${urlApiClientes}/id/${idClienteAtual}`);
            const resultado = await resposta.json();

            if (resultado.status === 200) {
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
                               
                console.log("Perfil preenchido com sucesso!");
            } else {
                console.error("Erro na resposta do servidor:", resultado.message);
            }
        } catch (erro) {
            console.error("ERRO CRÍTICO ao ligar à API de Clientes.", erro);
        }
    }

    carregarPerfil();

    // Guardar Dados do Perfil
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
                    if(alertaSucesso) {
                        alertaSucesso.classList.add('mostrar');
                        setTimeout(() => { alertaSucesso.classList.remove('mostrar'); }, 3000);
                    }
                    const perfilNome = document.getElementById('nome-lateral');
                    const perfilUser = document.getElementById('user-lateral');
                    if(perfilNome) perfilNome.innerText = nomeCompleto;
                    if(perfilUser) perfilUser.innerText = `@${nomeInput.toLowerCase()}`;
                } else {
                    alert("Erro ao atualizar: " + resultado.message);
                }
            } catch (erro) {
                console.error("Erro ao guardar perfil:", erro);
                alert("Erro de comunicação com o servidor.");
            }
        });
    }

    // ==========================================================================
    // --- 2. FOTO DE PERFIL (Pré-visualização) ---
    // ==========================================================================
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

    // ==========================================================================
    // --- 3. GESTÃO DE ANIMAIS (API LIGADA) ---
    // ==========================================================================
    const listaAnimais = document.querySelector('.animais-lista');
    const modalAdd = document.getElementById('modal-animal');
    const btnAdicionarNovo = document.querySelector('.animal-card.adicionar');
    const btnGuardarNovo = document.getElementById('btn-guardar-animal');

    // Ler Animais da BD
    async function carregarAnimais() {
        if (!listaAnimais) return;

        try {
            const resposta = await fetch(urlApiAnimais);
            const resultado = await resposta.json();

            if (resultado.status === 200) {
                const meusAnimais = resultado.data.filter(a => a.id_cliente === idClienteAtual);
                listaAnimais.innerHTML = '';

                meusAnimais.forEach(animal => {
                    let fotoSrc = animal.especie.toLowerCase() === 'gato' ? '../../img/icone_gato.jpg' : '../../img/icone_cao.jpg';
                    const cartao = document.createElement('div');
                    cartao.className = 'animal-card';
                    cartao.innerHTML = `
                        <div class="foto-animal-wrapper">
                            <img src="${fotoSrc}" alt="${animal.nome}">
                            <div class="acoes-animal">
                                <button class="btn-editar-animal" title="Editar"><i class="fa fa-pencil"></i></button>
                                <button class="btn-apagar-animal" data-id="${animal.id_animal}" title="Remover"><i class="fa fa-trash"></i></button>
                            </div>
                        </div>
                        <p class="nome-animal-texto">${animal.nome}</p>
                        <small class="especie-animal-texto">${animal.especie}</small>
                    `;
                    listaAnimais.appendChild(cartao);
                });

                if(btnAdicionarNovo) listaAnimais.appendChild(btnAdicionarNovo);
            }
        } catch (erro) {
            console.error("Erro ao carregar animais:", erro);
        }
    }

    carregarAnimais();

    // Guardar Novo Animal na BD
    if (btnAdicionarNovo && modalAdd && btnGuardarNovo) {
        
        // Modal Upload Foto Preview
        const inputFotoAnimal = document.getElementById('input-foto-animal');
        const previewNovoAnimal = document.getElementById('preview-novo-animal');
        if (inputFotoAnimal && previewNovoAnimal) {
            inputFotoAnimal.addEventListener('change', function(evento) {
                const ficheiro = evento.target.files[0];
                if (ficheiro) {
                    const leitor = new FileReader();
                    leitor.onload = function(e) { previewNovoAnimal.src = e.target.result; }
                    leitor.readAsDataURL(ficheiro);
                }
            });
        }

        btnAdicionarNovo.addEventListener('click', () => {
            modalAdd.classList.add('ativo');
            document.body.classList.add('no-scroll');
        });
        
        modalAdd.querySelector('.fechar-modal').addEventListener('click', () => {
            modalAdd.classList.remove('ativo');
            document.body.classList.remove('no-scroll');
        });

        btnGuardarNovo.addEventListener('click', async function() {
            const nomeInput = document.getElementById('novo-nome').value.trim();
            const especieInput = document.getElementById('nova-especie').value.trim();

            if (nomeInput !== '' && especieInput !== '') {
                const novoAnimalDados = {
                    id_cliente: idClienteAtual,
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
                        carregarAnimais();
                        document.getElementById('novo-nome').value = '';
                        document.getElementById('nova-especie').value = '';
                        if (previewNovoAnimal) previewNovoAnimal.src = '../../img/imagemdefault.png';
                        modalAdd.classList.remove('ativo');
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

    // Apagar Animal da BD
    if (listaAnimais) {
        listaAnimais.addEventListener('click', async function(e) {
            const btnApagar = e.target.closest('.btn-apagar-animal');
            
            if (btnApagar) {
                const idParaApagar = btnApagar.getAttribute('data-id');
                const cartao = btnApagar.closest('.animal-card');
                const nomeAnimal = cartao.querySelector('.nome-animal-texto').innerText;

                if (confirm(`Tem a certeza que deseja remover o(a) ${nomeAnimal}?`)) {
                    try {
                        const resposta = await fetch(`${urlApiAnimais}/${idParaApagar}`, {
                            method: 'DELETE'
                        });
                        
                        const resultado = await resposta.json();

                        if (resultado.status === 200) {
                            cartao.remove(); 
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
    // --- 4. GESTÃO DE AVISOS INTERATIVOS ---
    // ==========================================================================
    const secAvisos = document.querySelector('.avisos');
    
    if (secAvisos) {
        secAvisos.addEventListener('click', function(e) {
            const btnFechar = e.target.closest('.btn-fechar-aviso');
            if (btnFechar) {
                const aviso = btnFechar.closest('.aviso');
                aviso.style.opacity = '0';
                aviso.style.transform = 'translateX(30px)';
                setTimeout(function() {
                    aviso.remove();
                    const avisosRestantes = secAvisos.querySelectorAll('.aviso');
                    if (avisosRestantes.length === 0) {
                        const semAvisos = document.createElement('p');
                        semAvisos.style.color = '#888';
                        semAvisos.style.textAlign = 'center';
                        semAvisos.style.padding = '20px 0';
                        semAvisos.style.fontStyle = 'italic';
                        semAvisos.innerHTML = '<i class="fa fa-check-circle" style="color: #2ea89c; font-size: 20px; display: block; margin-bottom: 10px;"></i> Não tem novos avisos!';
                        secAvisos.appendChild(semAvisos);
                    }
                }, 300);
            }
        });
    }

    // ==========================================================================
    // --- 5. BOTÃO "EDITAR PERFIL" (Cartão Lateral) ---
    // ==========================================================================
    const btnEditarPerfilLateral = document.querySelector('.editar');
    const inputPrimeiroNome = document.getElementById('input-nome');

    if (btnEditarPerfilLateral && inputPrimeiroNome) {
        btnEditarPerfilLateral.addEventListener('click', () => {
            inputPrimeiroNome.focus();
        });
    }

});
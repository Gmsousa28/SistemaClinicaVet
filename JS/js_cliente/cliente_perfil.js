document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. FOTO DE PERFIL PRINCIPAL ---
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

    // --- 2. ALERTA SUCESSO ---
    const btnEditar = document.querySelector('.editar'); 
    const alertaSucesso = document.getElementById('alerta-sucesso'); 
    if (btnEditar && alertaSucesso) {
        btnEditar.addEventListener('click', function() {
            alertaSucesso.classList.add('mostrar');
            setTimeout(function() { alertaSucesso.classList.remove('mostrar'); }, 3000);
        });
    }

    // --- 3. GESTÃO DE ANIMAIS (Adicionar, Editar e Remover) ---
    const listaAnimais = document.querySelector('.animais-lista');
    
    // Modais
    const modalAdd = document.getElementById('modal-animal');
    const modalEdit = document.getElementById('modal-editar-animal');
    
    // Botões
    const btnAdicionarNovo = document.querySelector('.animal-card.adicionar');
    const btnGuardarNovo = document.getElementById('btn-guardar-animal');
    const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
    
    let cartaoEmEdicao = null; 

    if (listaAnimais) {
        // --- A. ADICIONAR NOVO ANIMAL ---
        if (btnAdicionarNovo && modalAdd) {
            
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

            // ABRIR MODAL
            btnAdicionarNovo.addEventListener('click', () => {
                modalAdd.classList.add('ativo');
                document.body.classList.add('no-scroll'); // Bloqueia o fundo!
            });
            
            // FECHAR MODAL (X ou fora)
            modalAdd.querySelector('.fechar-modal').addEventListener('click', () => {
                modalAdd.classList.remove('ativo');
                document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
            });
            modalAdd.addEventListener('click', (e) => { 
                if(e.target === modalAdd) {
                    modalAdd.classList.remove('ativo');
                    document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
                }
            });

            // GUARDAR NOVO ANIMAL
            btnGuardarNovo.addEventListener('click', function() {
                const nome = document.getElementById('novo-nome').value;
                const especie = document.getElementById('nova-especie').value;
                
                let fotoEscolhida = "../../img/imagemdefault.png";
                if (previewNovoAnimal) { fotoEscolhida = previewNovoAnimal.src; }

                if (nome !== '' && especie !== '') {
                    const novoCartao = document.createElement('div');
                    novoCartao.className = 'animal-card';
                    
                    novoCartao.innerHTML = `
                        <div class="foto-animal-wrapper">
                            <img src="${fotoEscolhida}" alt="${nome}">
                            <div class="acoes-animal">
                                <button class="btn-editar-animal" title="Editar"><i class="fa fa-pencil"></i></button>
                                <button class="btn-apagar-animal" title="Remover"><i class="fa fa-trash"></i></button>
                            </div>
                        </div>
                        <p class="nome-animal-texto">${nome}</p>
                        <small class="especie-animal-texto">${especie}</small>
                    `;
                    
                    listaAnimais.insertBefore(novoCartao, btnAdicionarNovo);
                    
                    document.getElementById('novo-nome').value = '';
                    document.getElementById('nova-especie').value = '';
                    if (previewNovoAnimal) { previewNovoAnimal.src = '../../img/imagemdefault.png'; }
                    
                    modalAdd.classList.remove('ativo');
                    document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
                } else {
                    alert("Preencha o nome e espécie!");
                }
            });
        }

        // --- B. EDITAR E REMOVER ANIMAIS ---
        if (modalEdit) {
            const inputFotoEdit = document.getElementById('input-foto-edit');
            const previewEditAnimal = document.getElementById('preview-edit-animal');

            if (inputFotoEdit && previewEditAnimal) {
                inputFotoEdit.addEventListener('change', function(evento) {
                    const ficheiro = evento.target.files[0];
                    if (ficheiro) {
                        const leitor = new FileReader();
                        leitor.onload = function(e) { previewEditAnimal.src = e.target.result; }
                        leitor.readAsDataURL(ficheiro);
                    }
                });
            }

            // FECHAR MODAL EDIÇÃO (X ou fora)
            modalEdit.querySelector('.fechar-modal').addEventListener('click', () => {
                modalEdit.classList.remove('ativo');
                document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
            });
            modalEdit.addEventListener('click', (e) => { 
                if(e.target === modalEdit) {
                    modalEdit.classList.remove('ativo');
                    document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
                }
            });

            listaAnimais.addEventListener('click', function(e) {
                
                const btnApagar = e.target.closest('.btn-apagar-animal');
                if (btnApagar) {
                    const cartao = btnApagar.closest('.animal-card');
                    const nome = cartao.querySelector('.nome-animal-texto').innerText;
                    if (confirm(`Tem a certeza que deseja remover o(a) ${nome}?`)) {
                        cartao.remove(); 
                    }
                }

                // ABRIR MODAL DE EDIÇÃO (Clicar no Lápis)
                const btnEditarAnimal = e.target.closest('.btn-editar-animal');
                if (btnEditarAnimal) {
                    cartaoEmEdicao = btnEditarAnimal.closest('.animal-card');
                    const nomeAtual = cartaoEmEdicao.querySelector('.nome-animal-texto').innerText;
                    const especieAtual = cartaoEmEdicao.querySelector('.especie-animal-texto').innerText;
                    const fotoAtual = cartaoEmEdicao.querySelector('.foto-animal-wrapper img').src;

                    document.getElementById('edit-nome').value = nomeAtual;
                    document.getElementById('edit-especie').value = especieAtual;
                    if (previewEditAnimal) { previewEditAnimal.src = fotoAtual; }
                    
                    modalEdit.classList.add('ativo');
                    document.body.classList.add('no-scroll'); // Bloqueia o fundo!
                }
            });

            // GUARDAR EDIÇÃO
            btnSalvarEdicao.addEventListener('click', function() {
                const novoNome = document.getElementById('edit-nome').value;
                const novaEspecie = document.getElementById('edit-especie').value;
                const fotoEditada = document.getElementById('preview-edit-animal').src;

                if (novoNome !== '' && novaEspecie !== '' && cartaoEmEdicao) {
                    cartaoEmEdicao.querySelector('.nome-animal-texto').innerText = novoNome;
                    cartaoEmEdicao.querySelector('.especie-animal-texto').innerText = novaEspecie;
                    cartaoEmEdicao.querySelector('.foto-animal-wrapper img').src = fotoEditada;

                    modalEdit.classList.remove('ativo');
                    document.body.classList.remove('no-scroll'); // Desbloqueia o fundo!
                }
            });
        }
    }

    // --- 4. GESTÃO DE AVISOS INTERATIVOS ---
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

});
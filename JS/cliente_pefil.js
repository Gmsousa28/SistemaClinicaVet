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
    
    let cartaoEmEdicao = null; // Memória para saber qual animal estamos a editar

    if (listaAnimais) {
        // --- A. ADICIONAR NOVO ANIMAL (Com foto) ---
        if (btnAdicionarNovo && modalAdd) {
            
            // Lógica da Foto do NOVO Animal
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

            btnAdicionarNovo.addEventListener('click', () => modalAdd.classList.add('ativo'));
            
            // Fechar no X ou clicando fora
            modalAdd.querySelector('.fechar-modal').addEventListener('click', () => modalAdd.classList.remove('ativo'));
            modalAdd.addEventListener('click', (e) => { if(e.target === modalAdd) modalAdd.classList.remove('ativo'); });

            btnGuardarNovo.addEventListener('click', function() {
                const nome = document.getElementById('novo-nome').value;
                const especie = document.getElementById('nova-especie').value;
                
                // Vai buscar a foto que está na janela de preview, ou usa uma padrão se falhar
                let fotoEscolhida = "../../img/imagemdefault.png";
                if (previewNovoAnimal) {
                    fotoEscolhida = previewNovoAnimal.src;
                }

                if (nome !== '' && especie !== '') {
                    const novoCartao = document.createElement('div');
                    novoCartao.className = 'animal-card';
                    
                    // O novo animal agora já nasce com a foto escolhida e o menu de Lápis/Lixo!
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
                    
                    // Limpar as caixas para a próxima vez
                    document.getElementById('novo-nome').value = '';
                    document.getElementById('nova-especie').value = '';
                    if (previewNovoAnimal) {
                        previewNovoAnimal.src = '../../img/imagemdefault.png'; // Repõe a imagem padrão na janela
                    }
                    
                    modalAdd.classList.remove('ativo');
                } else {
                    alert("Preencha o nome e espécie!");
                }
            });
        }

        // --- B. EDITAR E REMOVER ANIMAIS (Agora com EDIÇÃO DE FOTO!) ---
        if (modalEdit) {
            // Lógica para carregar foto na Preview de EDIÇÃO
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

            // Fechar janela de edição
            modalEdit.querySelector('.fechar-modal').addEventListener('click', () => modalEdit.classList.remove('ativo'));
            modalEdit.addEventListener('click', (e) => { if(e.target === modalEdit) modalEdit.classList.remove('ativo'); });

            // Detetar cliques dentro da lista de animais (Lápis ou Lixo)
            listaAnimais.addEventListener('click', function(e) {
                
                // Se clicou no botão de apagar
                const btnApagar = e.target.closest('.btn-apagar-animal');
                if (btnApagar) {
                    const cartao = btnApagar.closest('.animal-card');
                    const nome = cartao.querySelector('.nome-animal-texto').innerText;
                    if (confirm(`Tem a certeza que deseja remover o(a) ${nome}?`)) {
                        cartao.remove(); // Apaga o animal da página
                    }
                }

                // Se clicou no botão de editar (A lógica mudou aqui!)
                const btnEditarAnimal = e.target.closest('.btn-editar-animal');
                if (btnEditarAnimal) {
                    cartaoEmEdicao = btnEditarAnimal.closest('.animal-card');
                    const nomeAtual = cartaoEmEdicao.querySelector('.nome-animal-texto').innerText;
                    const especieAtual = cartaoEmEdicao.querySelector('.especie-animal-texto').innerText;
                    // NOVA ZONA: Agarrar a foto do cartão que clicámos
                    const fotoAtual = cartaoEmEdicao.querySelector('.foto-animal-wrapper img').src;

                    // Preenche a janela com os dados atuais
                    document.getElementById('edit-nome').value = nomeAtual;
                    document.getElementById('edit-especie').value = especieAtual;
                    // NOVA ZONA: Preenche o preview da janela com a foto que já lá estava
                    if (previewEditAnimal) {
                        previewEditAnimal.src = fotoAtual;
                    }
                    
                    modalEdit.classList.add('ativo');
                }
            });

            // Guardar as alterações na edição (A lógica mudou aqui!)
            btnSalvarEdicao.addEventListener('click', function() {
                const novoNome = document.getElementById('edit-nome').value;
                const novaEspecie = document.getElementById('edit-especie').value;
                // NOVA ZONA: Agarrar a foto que está na preview da janela (pode ser a nova ou a antiga)
                const fotoEditada = document.getElementById('preview-edit-animal').src;

                if (novoNome !== '' && novaEspecie !== '' && cartaoEmEdicao) {
                    cartaoEmEdicao.querySelector('.nome-animal-texto').innerText = novoNome;
                    cartaoEmEdicao.querySelector('.especie-animal-texto').innerText = novaEspecie;
                    // NOVA ZONA: Atualizar a foto no cartão original!
                    cartaoEmEdicao.querySelector('.foto-animal-wrapper img').src = fotoEditada;

                    modalEdit.classList.remove('ativo');
                }
            });
        }
    }
});
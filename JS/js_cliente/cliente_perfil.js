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
        window.location.href = "../../Pag/Logins_Sessões/login.html"; 
        return; 
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
                
                // Vai buscar TODOS os animais deste cliente
                const todosMeusAnimais = resultadoAnimais.data.filter(a => a.id_cliente == idClienteAtual);
                
                // Variável para guardar apenas os IDs dos que estão vivos!
                let animaisAtivosIDs = [];

                listaAnimais.innerHTML = ''; // Limpa a lista antes de desenhar

                todosMeusAnimais.forEach(animal => {
                    // Verificar o estado do animal
                    const estadoTexto = animal.estado ? animal.estado.toLowerCase() : '';
                    const isMorto = (estadoTexto === 'falecido' || estadoTexto === 'morto' || estadoTexto === 'inativo' || animal.vivo === false);

                    // Se estiver vivo, adiciona à lista de ativos
                    if (!isMorto) {
                        animaisAtivosIDs.push(animal.id_animal);
                    }

                    // Foto default (cão ou gato)
                    let fotoSrc = animal.especie.toLowerCase() === 'gato' 
                        ? 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=240&q=80' 
                        : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=240&q=80';
                    
                    // ==========================================
                    // MAGIA DO DESIGN: Se estiver morto, fica a cinzento!
                    // ==========================================
                    const estiloImagem = isMorto ? 'filter: grayscale(100%); opacity: 0.6;' : '';
                    const estiloTexto = isMorto ? 'color: #95a5a6;' : '';
                    const tagFalecido = isMorto ? '<span style="display:block; color:#7f8c8d; font-size:11px; font-weight:bold; margin-top:2px;">Falecido 🕊️</span>' : '';
                    
                    // Se estiver morto, tiramos o botão de Editar, deixamos só o de apagar
                    const botaoEditar = !isMorto ? `<button class="btn-editar-animal" type="button" aria-label="Editar ${animal.nome}"><i class="fa fa-pen"></i></button>` : '';

                    const cartao = document.createElement('div');
                    cartao.className = 'animal-card';
                    if (isMorto) cartao.style.opacity = '0.8';

                    cartao.innerHTML = `
                        <div class="foto-animal-wrapper">
                            <img src="${fotoSrc}" alt="${animal.nome}" style="${estiloImagem}">
                            <div class="acoes-animal">
                                ${botaoEditar}
                                <button class="btn-apagar-animal" data-id="${animal.id_animal}" type="button" aria-label="Apagar ${animal.nome}"><i class="fa fa-trash"></i></button>
                            </div>
                        </div>
                        <p style="${estiloTexto}">${animal.nome}</p>
                        <small style="${estiloTexto}">${animal.especie}</small>
                        ${tagFalecido}
                    `;
                    listaAnimais.appendChild(cartao);
                });

                // Atualizar o array global com os vivos para as consultas
                meusAnimaisIDs = animaisAtivosIDs;

                // Atualizar Contadores (apenas para os VIVOS)
                const statsAnimais = document.querySelector('.perfil-stats span:first-child strong');
                const badgeAnimais = document.querySelector('.meus-animais .badge');
                if (statsAnimais) statsAnimais.innerText = animaisAtivosIDs.length;
                if (badgeAnimais) badgeAnimais.innerText = `${animaisAtivosIDs.length} ativos`;

                // Colocar o botão de "Adicionar" no fim da lista
                listaAnimais.insertAdjacentHTML('beforeend', htmlBotaoAdicionar);
                ligarBotaoAdicionar();
            }

            // --- B) Buscar as Consultas (só para os animais vivos!) ---
            const respostaConsultas = await fetch(urlApiConsultas);
            if (!respostaConsultas.ok) return;

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

  // Fechar o modal quando clica no X, no Cancelar, ou fora da caixa preta
    document.querySelectorAll(".fechar-modal-javascript, .modal-overlay").forEach((elemento) => {
        elemento.addEventListener("click", (evento) => {
            if (evento.target !== elemento && !elemento.classList.contains("fechar-modal-javascript")) return;
            
            const modalAdd = document.getElementById('modal-animal');
            if (modalAdd) {
                modalAdd.classList.remove('ativo'); 
                modalAdd.setAttribute("aria-hidden", "true");
                document.body.classList.remove("no-scroll"); 
            }
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

// 1. A função calculadora
function formatarTempoAtualizacao(dataGuardada) {
    if (!dataGuardada) return "Sem atualizações recentes";

    const dataAtualizacao = new Date(dataGuardada);
    const agora = new Date();
    const diferencaDias = Math.floor((agora - dataAtualizacao) / (1000 * 60 * 60 * 24));

    if (diferencaDias === 0) return "Atualizado hoje";
    if (diferencaDias === 1) return "Atualizado ontem";
    if (diferencaDias < 7) return `Atualizado há ${diferencaDias} dias`;
    if (diferencaDias < 14) return "Atualizado há 1 semana";
    return `Atualizado há ${Math.floor(diferencaDias / 7)} semanas`;
}

// 2. Verifica a memória local
const dataMemoria = localStorage.getItem('ultima_atualizacao_perfil');
const badge = document.getElementById('badge-atualizacao'); 

if (badge) {
    badge.innerText = formatarTempoAtualizacao(dataMemoria);
}

// 3. Atualizar a data
const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
if (btnGuardarPerfil) {
    btnGuardarPerfil.addEventListener('click', () => {
        localStorage.setItem('ultima_atualizacao_perfil', new Date().toISOString());
        if (badge) badge.innerText = "Atualizado hoje";
    });
}

// ==========================================================================
// LÓGICA DO PAINEL DE AVISOS (LEMBRETES DE CONSULTAS)
// ==========================================================================
async function carregarLembretesConsultas() {
    const dadosLoginStr = localStorage.getItem("utilizadorLogado");
    if (!dadosLoginStr) return;
    
    let idClienteLogado;
    try {
        idClienteLogado = JSON.parse(dadosLoginStr).id_cliente;
    } catch (e) { return; }

    const containerAvisos = document.getElementById('container-avisos');
    const badgeAvisos = document.getElementById('badge-avisos');

    if (!containerAvisos || !badgeAvisos) return;

    try {
        const resposta = await fetch(`http://localhost:8008/api/consultas/cliente/${idClienteLogado}`);
        if (!resposta.ok) throw new Error("Sem consultas para este cliente");
        
        const resultado = await resposta.json();
        const consultas = resultado.data || [];

        const hoje = new Date();
        const daquiA3Dias = new Date();
        daquiA3Dias.setDate(hoje.getDate() + 3);

        const avisosFuturos = consultas.filter(consulta => {
            const dataConsulta = new Date(consulta.data_hora);
            return dataConsulta > hoje && dataConsulta <= daquiA3Dias;
        });

        badgeAvisos.innerText = `${avisosFuturos.length} novo${avisosFuturos.length !== 1 ? 's' : ''}`;
        if(avisosFuturos.length > 0) {
            badgeAvisos.style.backgroundColor = '#e74c3c'; 
            badgeAvisos.style.color = '#fff';
        }

        if (avisosFuturos.length === 0) {
            containerAvisos.innerHTML = `
                <div class="aviso-vazio" style="padding: 15px; border-left: 4px solid #2ea89c; background: #f8f9fa; margin-bottom: 10px; border-radius: 5px;">
                    <i class="fa-solid fa-bell" style="color: #2ea89c;"></i> Não tem avisos de momento.
                </div>`;
            return;
        }

        containerAvisos.innerHTML = ''; 
        
        avisosFuturos.forEach(aviso => {
            const dataObj = new Date(aviso.data_hora);
            
            const dataFormatada = dataObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' });
            const horaFormatada = dataObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });

            containerAvisos.innerHTML += `
                <div style="padding: 12px 15px; border-left: 4px solid #f39c12; background: #fffdf7; margin-bottom: 10px; border-radius: 5px;">
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                        <i class="fa-solid fa-circle-exclamation" style="color: #f39c12; margin-top: 3px;"></i>
                        <div>
                            <span style="font-weight: 600; color: #2c3e50;">Lembrete: ${aviso.nome_animal}</span>
                            <p style="margin: 3px 0 0; font-size: 0.85rem; color: #34495e;">
                                Tem uma marcação para <strong>${aviso.motivo}</strong> a aproximar-se.
                            </p>
                            <small style="color: #7f8c8d; font-weight: 600;">
                                <i class="fa-regular fa-calendar-check"></i> ${dataFormatada} às ${horaFormatada}
                            </small>
                        </div>
                    </div>
                </div>`;
        });

    } catch (erro) {
        console.error("Erro ao carregar avisos:", erro);
        containerAvisos.innerHTML = `
            <div class="aviso-vazio" style="padding: 15px; border-left: 4px solid #2ea89c; background: #f8f9fa; margin-bottom: 10px; border-radius: 5px;">
                <i class="fa-solid fa-bell" style="color: #2ea89c;"></i> Não tem avisos de momento.
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarLembretesConsultas();
});
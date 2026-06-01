const API_BASE = "http://localhost:8008/api";
const ENDPOINT_PEDIDO_ADOCAO = `${API_BASE}/pedidos-adocao`;

let animaisDisponiveis = [];
let animalSelecionado = null;
let clienteSessao = null;

function abrirModalPedidoAdocao(idAnimal) {
    const modal = document.getElementById('modal-pedido-adocao');
    const animal = animaisDisponiveis.find(item => String(item.id_animal) === String(idAnimal));

    console.log("A tentar abrir modal para o animal ID:", idAnimal); // Aviso na consola para testarmos

    if (!modal) {
        alert("Erro: O HTML do Modal não foi encontrado!");
        return;
    }
    if (!animal) {
        alert("Erro: Os dados do animal não foram encontrados na memória!");
        return;
    }

    animalSelecionado = animal;

    const idInput = document.getElementById('id-animal-pedido');
    const resumoAnimal = document.getElementById('animal-selecionado-adocao');
    const mensagem = document.getElementById('mensagem-pedido-adocao');
    const estado = document.getElementById('estado-pedido-adocao');
    const grupoNif = document.getElementById('grupo-nif-manual');
    const nifManual = document.getElementById('nif-cliente-manual');

    if (idInput) idInput.value = animal.id_animal;
    if (mensagem) mensagem.value = '';
    if (estado) estado.innerHTML = '';

    const nifSessao = obterNifCliente(clienteSessao);
    if (grupoNif && nifManual) {
        grupoNif.hidden = Boolean(nifSessao);
        nifManual.required = !nifSessao;
        nifManual.value = '';
    }

    if (resumoAnimal) {
        const nome = obterNomeAnimal(animal);
        const imagem = obterImagemAnimal(animal.especie);

        resumoAnimal.innerHTML = `
            <img src="${imagem}" alt="${escapeHtml(nome)}">
            <div>
                <strong class="animal-selecionado-nome">${escapeHtml(nome)}</strong>
                <span class="animal-selecionado-meta">ID: ${escapeHtml(animal.id_animal)} · ${escapeHtml(animal.especie || 'Espécie não indicada')}</span>
                <span class="animal-selecionado-meta">${escapeHtml(animal.raca || 'Raça não indicada')} · ${escapeHtml(animal.idade_aprox || 'Idade não indicada')}</span>
            </div>
        `;
    }
    
    // 🔥 O TRUQUE PARA FORÇAR O CSS A MOSTRAR A JANELA 🔥
    modal.classList.add('aberto');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    document.body.classList.add('modal-aberto');
    document.body.style.overflow = 'hidden'; // Bloqueia o scroll do fundo
}

function fecharModalPedidoAdocao() {
    const modal = document.getElementById('modal-pedido-adocao');
    if (!modal) return;

    // 🔥 O TRUQUE PARA ESCONDER A JANELA NA PERFEIÇÃO 🔥
    modal.classList.remove('aberto');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    document.body.classList.remove('modal-aberto');
    document.body.style.overflow = ''; // Devolve o scroll ao fundo
    animalSelecionado = null;
}

window.abrirModalPedidoAdocao = abrirModalPedidoAdocao;
window.fecharModalPedidoAdocao = fecharModalPedidoAdocao;

document.addEventListener('DOMContentLoaded', function() {
    clienteSessao = obterClienteSessao();

    const contentor = document.getElementById('contentor-cartoes-adocao');
    const pesquisa = document.getElementById('pesquisa-adocao');
    const filtroEspecie = document.getElementById('filtro-especie-adocao');
    const formPedido = document.getElementById('form-pedido-adocao');
    const modal = document.getElementById('modal-pedido-adocao');
    const nifManual = document.getElementById('nif-cliente-manual');

    if (pesquisa) pesquisa.addEventListener('input', renderizarAnimaisDisponiveis);
    if (filtroEspecie) filtroEspecie.addEventListener('change', renderizarAnimaisDisponiveis);

    if (nifManual) {
        nifManual.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 9);
        });
    }

    if (contentor) {
        contentor.addEventListener('click', function(evento) {
            const botao = evento.target.closest('[data-abrir-pedido]');
            if (!botao) return;

            abrirModalPedidoAdocao(botao.dataset.abrirPedido);
        });
    }

    if (modal) {
        modal.addEventListener('click', function(evento) {
            if (evento.target === modal) fecharModalPedidoAdocao();
        });
    }

    document.addEventListener('keydown', function(evento) {
        if (evento.key === 'Escape') fecharModalPedidoAdocao();
    });

    if (formPedido) {
        formPedido.addEventListener('submit', enviarPedidoAdocao);
    }

    carregarAnimaisDisponiveis();
});
async function carregarAnimaisDisponiveis() {
    const contentor = document.getElementById('contentor-cartoes-adocao');
    if (!contentor) return;

    contentor.innerHTML = `
        <p class="mensagem-lista-adocoes mensagem-lista-adocoes-carregamento">
            <i class="fa fa-spinner fa-spin"></i> A carregar animais disponíveis...
        </p>
    `;

    try {
        const resposta = await fetch(`${API_BASE}/resgates-painel`);
        const resultado = await resposta.json();

        if (resultado.status === 200 && Array.isArray(resultado.data)) {
            animaisDisponiveis = resultado.data.filter(animalEstaDisponivel);
            renderizarAnimaisDisponiveis();
            return;
        }

        throw new Error(resultado.message || 'Não foi possível carregar os animais.');
    } catch (erro) {
        console.error('Erro ao carregar animais para adoção:', erro);
        contentor.innerHTML = `
             <p class="mensagem-lista-adocoes mensagem-lista-adocoes-erro">
                Erro ao comunicar com a base de dados.
            </p>
        `;
    }
}
function renderizarAnimaisDisponiveis() {
    const contentor = document.getElementById('contentor-cartoes-adocao');
    const pesquisa = document.getElementById('pesquisa-adocao');
    const filtroEspecie = document.getElementById('filtro-especie-adocao');

    if (!contentor) return;

    const termo = normalizarTexto(pesquisa ? pesquisa.value : '');
    const especieEscolhida = filtroEspecie ? filtroEspecie.value : '';

    const animaisFiltrados = animaisDisponiveis.filter(animal => {
        const especie = obterEspecieNormalizada(animal.especie);
        const textoAnimal = normalizarTexto([
            obterNomeAnimal(animal),
            animal.raca,
            animal.idade_aprox,
            animal.estado,
            animal.id_animal
        ].join(' '));

        const passaPesquisa = !termo || textoAnimal.includes(termo);
        const passaEspecie = !especieEscolhida || especie === especieEscolhida;

        return passaPesquisa && passaEspecie;
    });

    if (animaisFiltrados.length === 0) {
        contentor.innerHTML = `
            <p class="mensagem-lista-adocoes mensagem-lista-adocoes-vazia">
                Não existem animais disponíveis com estes filtros.
            </p>
        `;
        return;
    }
    contentor.innerHTML = animaisFiltrados.map(animal => {
        const nome = obterNomeAnimal(animal);
        const imagem = obterImagemAnimal(animal.especie);
        const dataResgate = formatarData(animal.data_resgate);

        return `
            <article class="cartao-adocao">
                <img src="${imagem}" alt="${escapeHtml(nome)}">
                <div class="conteudo">
                    <h3>${escapeHtml(nome)}</h3>
                    <p class="meta-adocao">
                        ID: ${escapeHtml(animal.id_animal)} · ${escapeHtml(animal.especie || 'Espécie não indicada')}
                    </p>
                    <p class="meta-adocao">
                        ${escapeHtml(animal.raca || 'Raça não indicada')} · ${escapeHtml(animal.idade_aprox || 'Idade não indicada')}
                    </p>
                    <p class="meta-adocao">Resgatado a: ${escapeHtml(dataResgate)}</p>
                    <span class="estado-adocao">
                        <i class="fa fa-heart"></i> ${escapeHtml(animal.estado || 'Disponível')}
                    </span>
                    <button type="button" class="btn-pedido-adocao" data-abrir-pedido="${escapeHtml(animal.id_animal)}">
                        Tenho Interesse <i class="fa fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

async function enviarPedidoAdocao(evento) {
    evento.preventDefault();

    if (!animalSelecionado) return;

    const estado = document.getElementById('estado-pedido-adocao');
    const mensagemInput = document.getElementById('mensagem-pedido-adocao');
    const nifManual = document.getElementById('nif-cliente-manual');

    const nifCliente = obterNifCliente(clienteSessao) || (nifManual ? nifManual.value.trim() : '');

    if (!/^\d{9}$/.test(nifCliente)) {
        if (estado) {
            estado.innerHTML =
                '<p class="mensagem-formulario mensagem-formulario-erro">Indica um NIF válido com 9 dígitos.</p>';
        }
        return;
    }

    console.log("Interesse em adoção registado:", {
        animal: animalSelecionado.id_animal,
        nif: nifCliente,
        mensagem: mensagemInput ? mensagemInput.value.trim() : ''
    });

    if (estado) {
        estado.innerHTML = `
            <p class="mensagem-formulario mensagem-formulario-sucesso">
                <i class="fa fa-check-circle"></i>
                Obrigado pelo interesse! Dirija-se à clínica para obter mais informações sobre a adoção.
            </p>
        `;
    }

    setTimeout(() => {
        fecharModalPedidoAdocao();
    }, 2000);
}

function obterClienteSessao() {
    const guardado = localStorage.getItem('utilizadorLogado');
    if (!guardado) return null;

    try {
        return JSON.parse(guardado);
    } catch (erro) {
        console.error('Erro ao ler sessão do cliente:', erro);
        return null;
    }
}

function obterNifCliente(cliente) {
    if (!cliente) return '';

    const nif = cliente.nif || cliente.nif_cliente || cliente.NIF || cliente.Nif;
    return nif ? String(nif).replace(/\D/g, '').slice(0, 9) : '';
}

function obterIdCliente(cliente) {
    if (!cliente) return null;
    return cliente.id_cliente || cliente.id || cliente.id_utilizador || null;
}

function animalEstaDisponivel(animal) {
    const estado = normalizarTexto(animal.estado);
    return !estado.includes('adotado') && !estado.includes('adoptado');
}

function obterNomeAnimal(animal) {
    return animal.nome || animal.nome_animal || 'Sem Nome';
}

function obterImagemAnimal(especie) {
    return obterEspecieNormalizada(especie) === 'cao'
        ? '../../img/icone_cao.jpg'
        : '../../img/icone_gato.jpg';
}
function obterEspecieNormalizada(especie) {
    const texto = normalizarTexto(especie);
    if (texto.includes('cao')) return 'cao';
    if (texto.includes('gato')) return 'gato';
    return '';
}

function formatarData(data) {
    if (!data) return 'Data não indicada';

    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return String(data);

    return dataObj.toLocaleDateString('pt-PT');
}

async function lerRespostaJson(resposta) {
    try {
        return await resposta.json();
    } catch (erro) {
        return {
            status: resposta.status,
            message: resposta.status === 404
                ? 'O endpoint /pedidos-adocao ainda não existe no backend.'
                : 'Resposta inválida do servidor.'
        };
    }
}
function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
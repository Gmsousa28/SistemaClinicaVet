// ==========================================
// CONFIGURAÇÃO DA API E DADOS
// ==========================================
const API_URL = 'http://localhost:8008/api/animais'; 
const NIF_CLINICA = "999999999"; // NIF provisório da Clínica Miacaomigo

let animalEmEdicaoId = null;
let idAnimalParaEliminar = null; 

// A nossa nova base de dados global que vem do Backend!
let animaisGlobais = [];

// ==========================================
// ELEMENTOS DO DOM E INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const tabelaAnimais = document.getElementById('tabelaAnimais');
    const inputPesquisa = document.getElementById('pesquisa_animal');

    const modalAnimal = document.getElementById('modalAnimal');
    const modalEdicao = document.getElementById('modalEdicao');
    const modalConfirmacao = document.getElementById('modalConfirmacao');

    const btnNovoAnimal = document.getElementById('btn-novo-animal');
    const formEdicaoAnimal = document.getElementById('form-edicao-animal');
    const tituloEdicao = document.getElementById('tituloEdicao');
    const selectEstado = document.getElementById('editEstado');
    
    // Agora apontamos para o NIF!
    const inputNifCliente = document.getElementById('editNifCliente'); 

    const btnFecharModalX = document.getElementById('btn-fechar-modal-x');
    const btnFecharModalBaixo = document.getElementById('btn-fechar-modal-baixo');
    const btnFecharEdicaoX = document.getElementById('btn-fechar-edicao-x');
    const btnFecharEdicaoBaixo = document.getElementById('btn-fechar-edicao-baixo');

    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');

    // 1. Carrega os dados reais mal a página abre
    carregarAnimais();

    // ==========================================
    // LÓGICA DE NEGÓCIO: ANIMAL RESGATADO
    // ==========================================
    if (selectEstado && inputNifCliente) {
        selectEstado.addEventListener('change', (e) => {
            if (e.target.value === 'Resgatado') {
                inputNifCliente.value = NIF_CLINICA;
                inputNifCliente.readOnly = true;
                inputNifCliente.style.backgroundColor = '#f8f9fa';
                inputNifCliente.style.cursor = 'not-allowed';
            } else {
                inputNifCliente.readOnly = false;
                inputNifCliente.style.backgroundColor = ''; 
                inputNifCliente.style.cursor = 'text';
                
                if (inputNifCliente.value === NIF_CLINICA) {
                    inputNifCliente.value = '';
                }
            }
        });
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    if(inputPesquisa) inputPesquisa.addEventListener('input', (e) => filtrarTabela(e.target.value.toLowerCase()));

    if(btnNovoAnimal) btnNovoAnimal.addEventListener('click', () => {
        animalEmEdicaoId = null;
        tituloEdicao.textContent = 'Registar Novo Animal';
        formEdicaoAnimal.reset();
        
        if(inputNifCliente) {
            inputNifCliente.readOnly = false;
            inputNifCliente.style.backgroundColor = ''; 
            inputNifCliente.style.cursor = 'text';
        }
        
        abrirModal(modalEdicao);
    });

    if(btnFecharModalX) btnFecharModalX.addEventListener('click', () => fecharModal(modalAnimal));
    if(btnFecharModalBaixo) btnFecharModalBaixo.addEventListener('click', () => fecharModal(modalAnimal));
    if(btnFecharEdicaoX) btnFecharEdicaoX.addEventListener('click', () => fecharModal(modalEdicao));
    if(btnFecharEdicaoBaixo) btnFecharEdicaoBaixo.addEventListener('click', () => fecharModal(modalEdicao));

    if(btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', () => {
        idAnimalParaEliminar = null;
        fecharModal(modalConfirmacao);
    });

    if(formEdicaoAnimal) formEdicaoAnimal.addEventListener('submit', salvarAnimal);

    // ELIMINAR ANIMAL NA BASE DE DADOS
    if(btnConfirmarEliminar) btnConfirmarEliminar.addEventListener('click', async () => {
        if (!idAnimalParaEliminar) return;

        try {
            const response = await fetch(`${API_URL}/${idAnimalParaEliminar}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if(result.status === 200) {
                alert(`Registo do animal apagado definitivamente.`);
                fecharModal(modalConfirmacao);
                carregarAnimais(); // Recarrega a tabela
            } else {
                // Apanha o nosso erro das consultas marcadas e avisa a rececionista!
                alert("Aviso: " + result.message);
            }
        } catch (error) {
            console.error('Erro ao eliminar:', error);
            alert("Falha na comunicação com o servidor.");
        } finally {
            idAnimalParaEliminar = null; 
        }
    });

    // ==========================================
    // FUNÇÕES CRUD PRINCIPAIS
    // ==========================================

    async function carregarAnimais() {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.status === 200) {
                animaisGlobais = result.data;
                renderizarTabela(animaisGlobais);
            }
        } catch (error) {
            console.error("Erro ao carregar animais do backend:", error);
        }
    }

    async function salvarAnimal(e) {
        e.preventDefault();
        
        // Limpa espaços em branco caso a pessoa digite NIFs mal
        const nifLimpo = document.getElementById('editNifCliente').value.replace(/\s/g, '');

        const dadosAnimal = {
            nome: document.getElementById('editNomeAnimal').value,
            nif_cliente: nifLimpo, 
            especie: document.getElementById('editEspecie').value,
            raca: document.getElementById('editRaca').value,
            sexo: document.getElementById('editSexo').value,
            data_nascimento: document.getElementById('editDataNascimento').value,
            estado: selectEstado.value
        };

        try {
            let url = API_URL;
            let metodo = 'POST';

            if (animalEmEdicaoId) {
                url = `${API_URL}/${animalEmEdicaoId}`;
                metodo = 'PUT';
            }

            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAnimal)
            });

            const result = await response.json();

            if (result.status === 201 || result.status === 200) {
                alert(`Registo do animal guardado com sucesso!`);
                fecharModal(modalEdicao);
                carregarAnimais();
            } else {
                alert("Erro: " + result.message);
            }
        } catch (error) {
            console.error('Erro ao guardar animal:', error);
            alert("Erro na comunicação com o servidor.");
        }
    }

    window.apagarAnimal = function(id) {
        idAnimalParaEliminar = id;
        abrirModal(document.getElementById('modalConfirmacao'));
    };

    window.visualizarAnimal = function(id) {
        const animal = animaisGlobais.find(a => a.id_animal === id);
        if(!animal) return alert('Animal não encontrado!');

        document.getElementById('ver_id_animal').value = animal.id_animal;
        document.getElementById('ver_nome_animal').value = animal.nome;
        document.getElementById('ver_especie').value = animal.especie;
        document.getElementById('ver_raca').value = animal.raca;
        document.getElementById('ver_sexo').value = animal.sexo === 'M' ? 'Macho' : (animal.sexo === 'F' ? 'Fêmea' : animal.sexo);
        document.getElementById('ver_data_nascimento').value = formatarData(animal.data_nascimento);
        document.getElementById('ver_estado').value = animal.estado;
        
        // Verifica se o HTML já foi alterado para ver_nif_cliente, senão tenta o antigo para não crashar
        const verNif = document.getElementById('ver_nif_cliente') || document.getElementById('ver_id_cliente');
        if (verNif) verNif.value = animal.nome_cliente ? `${animal.nome_cliente} (NIF: ${animal.nif_cliente || 'Sem registo'})` : `NIF: ${animal.nif_cliente || 'Sem registo'}`;

        abrirModal(document.getElementById('modalAnimal'));
    };

    window.editarAnimal = function(id) {
        const animal = animaisGlobais.find(a => a.id_animal === id);
        if(!animal) return alert('Animal não encontrado!');

        animalEmEdicaoId = animal.id_animal;
        document.getElementById('tituloEdicao').textContent = `Editar Animal #${animal.id_animal}`;

        document.getElementById('editNomeAnimal').value = animal.nome;
        
        const inputNif = document.getElementById('editNifCliente');
        if(inputNif) inputNif.value = animal.nif_cliente || '';

        document.getElementById('editEspecie').value = animal.especie;
        document.getElementById('editRaca').value = animal.raca;
        document.getElementById('editSexo').value = animal.sexo;
        
        if(animal.data_nascimento) {
            document.getElementById('editDataNascimento').value = new Date(animal.data_nascimento).toISOString().split('T')[0];
        } else {
            document.getElementById('editDataNascimento').value = '';
        }
        
        if(selectEstado) {
            selectEstado.value = animal.estado;
            selectEstado.dispatchEvent(new Event('change')); 
        }

        abrirModal(document.getElementById('modalEdicao'));
    };

    // ==========================================
    // RENDERIZAÇÃO DA TABELA E UTILITÁRIOS
    // ==========================================

    function renderizarTabela(animais) {
        if(!tabelaAnimais) return;
        tabelaAnimais.innerHTML = '';

        if(animais.length === 0) {
            tabelaAnimais.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum animal encontrado.</td></tr>`;
            return;
        }

        animais.forEach(animal => {
            let corEstado;
            switch(animal.estado) {
                case 'Domestico': 
                case 'Doméstico': corEstado = '#2ecc71'; break;
                case 'Adotado': corEstado = '#3498db'; break;
                case 'Resgatado': corEstado = '#f39c12'; break;
                case 'Morto': corEstado = '#e74c3c'; break;
                default: corEstado = '#95a5a6';
            }

            // Exibe o Nome (via JOIN) ou o NIF
            const donoExibicao = animal.nome_cliente ? animal.nome_cliente : (animal.nif_cliente ? `NIF: ${animal.nif_cliente}` : 'Sem Dono');

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #f1f2f6";
            
            tr.innerHTML = `
                <td style="padding: 15px 10px; font-weight: bold;">#${animal.id_animal}</td>
                <td style="padding: 15px 10px;">${animal.nome}</td>
                <td style="padding: 15px 10px;">${animal.especie} / ${animal.raca}</td>
                <td style="padding: 15px 10px;">${animal.sexo === 'M' ? 'Macho' : (animal.sexo === 'F' ? 'Fêmea' : animal.sexo)}</td>
                <td style="padding: 15px 10px;">${donoExibicao}</td>
                <td style="padding: 15px 10px;">
                    <span style="background-color: ${corEstado}20; color: ${corEstado}; padding: 5px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: bold;">
                        ${animal.estado}
                    </span>
                </td>
                <td style="padding: 15px 10px; text-align: right; white-space: nowrap;">
                    <a href="#" onclick="visualizarAnimal(${animal.id_animal}); return false;" style="color: #7f8c8d; margin-right: 15px; font-size: 1.1rem; text-decoration: none;" title="Ver Ficha"><i class="fa fa-eye"></i></a>
                    <a href="#" onclick="editarAnimal(${animal.id_animal}); return false;" style="color: #3498db; margin-right: 15px; font-size: 1.1rem; text-decoration: none;" title="Editar"><i class="fa fa-edit"></i></a>
                    <a href="#" onclick="apagarAnimal(${animal.id_animal}); return false;" style="color: #e74c3c; font-size: 1.1rem; text-decoration: none;" title="Eliminar"><i class="fa fa-trash"></i></a>
                </td>
            `;
            tabelaAnimais.appendChild(tr);
        });
    }

    function abrirModal(modal) { if (modal) modal.style.display = 'flex'; }
    function fecharModal(modal) { if (modal) modal.style.display = 'none'; }
    function formatarData(dataString) {
        if (!dataString) return '-';
        return new Date(dataString).toLocaleDateString('pt-PT');
    }
    function filtrarTabela(termo) {
        if(!tabelaAnimais) return;
        const linhas = tabelaAnimais.getElementsByTagName('tr');
        for (let i = 0; i < linhas.length; i++) {
            const textoLinha = linhas[i].textContent.toLowerCase();
            linhas[i].style.display = textoLinha.includes(termo) ? '' : 'none';
        }
    }
});
// ==========================================
// CONFIGURAÇÃO DA API E DADOS TEMPORÁRIOS
// ==========================================
const API_URL = 'http://localhost:3000/api/animais'; 
const ID_CLINICA = 1; 

let animalEmEdicaoId = null;
let idAnimalParaEliminar = null; 

// Base de Dados Simulada (Remover quando ligares à API real)
let animaisMock = [
    { id_animal: 1, nome: "Bobby", especie: "Cão", raca: "Labrador", sexo: "M", id_cliente: 104, estado: "Domestico", data_nascimento: "2020-05-12" },
    { id_animal: 2, nome: "Mia", especie: "Gato", raca: "Siamês", sexo: "F", id_cliente: 1, estado: "Resgatado", data_nascimento: "2023-08-20" },
    { id_animal: 3, nome: "Rex", especie: "Cão", raca: "Pastor Alemão", sexo: "M", id_cliente: 301, estado: "Adotado", data_nascimento: "2019-11-05" },
    { id_animal: 4, nome: "Bolinha", especie: "Hamster", raca: "Sírio", sexo: "M", id_cliente: 104, estado: "Morto", data_nascimento: "2021-02-10" }
];

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
    const inputIdCliente = document.getElementById('editIdCliente');

    const btnFecharModalX = document.getElementById('btn-fechar-modal-x');
    const btnFecharModalBaixo = document.getElementById('btn-fechar-modal-baixo');
    const btnFecharEdicaoX = document.getElementById('btn-fechar-edicao-x');
    const btnFecharEdicaoBaixo = document.getElementById('btn-fechar-edicao-baixo');

    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');

    carregarAnimais();

    // ==========================================
    // LÓGICA DE NEGÓCIO: ANIMAL RESGATADO
    // ==========================================
    selectEstado.addEventListener('change', (e) => {
        if (e.target.value === 'Resgatado') {
            inputIdCliente.value = ID_CLINICA;
            inputIdCliente.readOnly = true;
            inputIdCliente.style.backgroundColor = '#f8f9fa';
            inputIdCliente.style.cursor = 'not-allowed';
        } else {
            inputIdCliente.readOnly = false;
            inputIdCliente.style.backgroundColor = ''; 
            inputIdCliente.style.cursor = 'text';
            
            if (parseInt(inputIdCliente.value) === ID_CLINICA) {
                inputIdCliente.value = '';
            }
        }
    });

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    inputPesquisa.addEventListener('input', (e) => filtrarTabela(e.target.value.toLowerCase()));

    btnNovoAnimal.addEventListener('click', () => {
        animalEmEdicaoId = null;
        tituloEdicao.textContent = 'Registar Novo Animal';
        formEdicaoAnimal.reset();
        
        inputIdCliente.readOnly = false;
        inputIdCliente.style.backgroundColor = ''; 
        inputIdCliente.style.cursor = 'text';
        
        abrirModal(modalEdicao);
    });

    btnFecharModalX.addEventListener('click', () => fecharModal(modalAnimal));
    btnFecharModalBaixo.addEventListener('click', () => fecharModal(modalAnimal));
    btnFecharEdicaoX.addEventListener('click', () => fecharModal(modalEdicao));
    btnFecharEdicaoBaixo.addEventListener('click', () => fecharModal(modalEdicao));

    btnCancelarEliminar.addEventListener('click', () => {
        idAnimalParaEliminar = null;
        fecharModal(modalConfirmacao);
    });

    formEdicaoAnimal.addEventListener('submit', salvarAnimal);

    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!idAnimalParaEliminar) return;

        try {
            // SIMULAÇÃO DE ELIMINAR NA BASE DE DADOS
            animaisMock = animaisMock.filter(a => a.id_animal !== idAnimalParaEliminar);
            
            alert(`Registo do animal #${idAnimalParaEliminar} apagado definitivamente.`);
            fecharModal(modalConfirmacao);
            carregarAnimais(); 
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            idAnimalParaEliminar = null; 
        }
    });

    // ==========================================
    // FUNÇÕES CRUD PRINCIPAIS
    // ==========================================

    function carregarAnimais() {
        // Como agora usamos o array global, ele carrega a lista atualizada com as edições/criações
        renderizarTabela(animaisMock);
    }

    async function salvarAnimal(e) {
        e.preventDefault();
        
        const dadosAnimal = {
            nome: document.getElementById('editNomeAnimal').value,
            id_cliente: parseInt(inputIdCliente.value),
            especie: document.getElementById('editEspecie').value,
            raca: document.getElementById('editRaca').value,
            sexo: document.getElementById('editSexo').value,
            data_nascimento: document.getElementById('editDataNascimento').value,
            estado: selectEstado.value
        };

        try {
            if (animalEmEdicaoId) {
                // ATUALIZAR SIMULADO
                const index = animaisMock.findIndex(a => a.id_animal === animalEmEdicaoId);
                if(index !== -1) {
                    animaisMock[index] = { ...animaisMock[index], ...dadosAnimal };
                }
            } else {
                // CRIAR SIMULADO
                const novoId = animaisMock.length > 0 ? Math.max(...animaisMock.map(a => a.id_animal)) + 1 : 1;
                animaisMock.push({ id_animal: novoId, ...dadosAnimal });
            }

            alert(`Registo do animal guardado com sucesso!`);
            fecharModal(modalEdicao);
            carregarAnimais();
        } catch (error) {
            console.error('Erro ao guardar animal:', error);
        }
    }

    window.apagarAnimal = function(id) {
        idAnimalParaEliminar = id;
        abrirModal(document.getElementById('modalConfirmacao'));
    };

    window.visualizarAnimal = function(id) {
        // Agora vai procurar o animal correto ao array em vez de mostrar sempre o "Bobby"
        const animal = animaisMock.find(a => a.id_animal === id);
        
        if(!animal) return alert('Animal não encontrado!');

        document.getElementById('ver_id_animal').value = animal.id_animal;
        document.getElementById('ver_nome_animal').value = animal.nome;
        document.getElementById('ver_especie').value = animal.especie;
        document.getElementById('ver_raca').value = animal.raca;
        document.getElementById('ver_sexo').value = animal.sexo === 'M' ? 'Macho' : 'Fêmea';
        document.getElementById('ver_data_nascimento').value = formatarData(animal.data_nascimento);
        document.getElementById('ver_estado').value = animal.estado;
        document.getElementById('ver_id_cliente').value = animal.id_cliente;

        abrirModal(document.getElementById('modalAnimal'));
    };

    window.editarAnimal = function(id) {
        // Vai procurar o animal correto
        const animal = animaisMock.find(a => a.id_animal === id);
        if(!animal) return alert('Animal não encontrado!');

        animalEmEdicaoId = animal.id_animal;
        document.getElementById('tituloEdicao').textContent = `Editar Animal #${animal.id_animal}`;

        document.getElementById('editNomeAnimal').value = animal.nome;
        inputIdCliente.value = animal.id_cliente;
        document.getElementById('editEspecie').value = animal.especie;
        document.getElementById('editRaca').value = animal.raca;
        document.getElementById('editSexo').value = animal.sexo;
        document.getElementById('editDataNascimento').value = new Date(animal.data_nascimento).toISOString().split('T')[0];
        
        selectEstado.value = animal.estado;
        
        // Força o evento 'change' para aplicar logo o bloqueio do ID se o estado for "Resgatado"
        selectEstado.dispatchEvent(new Event('change')); 

        abrirModal(document.getElementById('modalEdicao'));
    };

    // ==========================================
    // RENDERIZAÇÃO DA TABELA E UTILITÁRIOS
    // ==========================================

    function renderizarTabela(animais) {
        tabelaAnimais.innerHTML = '';

        if(animais.length === 0) {
            tabelaAnimais.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum animal encontrado.</td></tr>`;
            return;
        }

        animais.forEach(animal => {
            let corEstado;
            switch(animal.estado) {
                case 'Domestico': corEstado = '#2ecc71'; break;
                case 'Adotado': corEstado = '#3498db'; break;
                case 'Resgatado': corEstado = '#f39c12'; break;
                case 'Morto': corEstado = '#e74c3c'; break;
                default: corEstado = '#95a5a6';
            }

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #f1f2f6";
            
            tr.innerHTML = `
                <td style="padding: 15px 10px; font-weight: bold;">#${animal.id_animal}</td>
                <td style="padding: 15px 10px;">${animal.nome}</td>
                <td style="padding: 15px 10px;">${animal.especie} / ${animal.raca}</td>
                <td style="padding: 15px 10px;">${animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</td>
                <td style="padding: 15px 10px;">Cliente #${animal.id_cliente}</td>
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
        const linhas = tabelaAnimais.getElementsByTagName('tr');
        for (let i = 0; i < linhas.length; i++) {
            const textoLinha = linhas[i].textContent.toLowerCase();
            linhas[i].style.display = textoLinha.includes(termo) ? '' : 'none';
        }
    }
});
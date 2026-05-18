const API_BASE = "http://localhost:8008/api";

// =======================================================
// 1. FUNÇÕES GLOBAIS DE MODAIS E INTERFACE
// =======================================================
function abrirModalResgates() {
    const modal = document.getElementById('modal-resgate');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalResgates() {
    const modal = document.getElementById('modal-resgate');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function mudarImagemResgates() {
    const elEspecie = document.getElementById('especie');
    const imagem = document.getElementById('foto-preview');
    
    // Só avança se os dois elementos existirem na página!
    if (elEspecie && imagem) {
        imagem.src = elEspecie.value === 'cao' ? "../../img/icone_cao.jpg" : "../../img/icone_gato.jpg";
    }
}

function abrirModalAdocao() {
    const modal = document.getElementById('modal-adocao');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const form = document.getElementById('form-formalizar-adocao');
        if (form) form.reset();
        
        const resAnimal = document.getElementById('resultado_animal_resgate');
        if (resAnimal) resAnimal.innerHTML = '';
        
        const resDono = document.getElementById('resultado_nif_dono');
        if (resDono) resDono.innerHTML = '';
        
        if (window.validarBotaoAdocao) window.validarBotaoAdocao(false, false);
    }
}

function fecharModalAdocao() {
    const modal = document.getElementById('modal-adocao');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function abrirModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Sempre que o modal abre, chama a função para carregar a tabela fresca!
        if (typeof carregarArquivoAdocoes === 'function') {
            carregarArquivoAdocoes();
        }
    }
}

function fecharModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// =======================================================
// 2. LÓGICA PRINCIPAL (ARRANCA AO CARREGAR A PÁGINA)
// =======================================================
document.addEventListener('DOMContentLoaded', function() {
    
    // -------------------------------------------------------
    // A. CARREGAR CARTÕES DE RESGATE DO BACKEND
    // -------------------------------------------------------
    const contentorResgates = document.getElementById('contentor-cartoes-resgate');

    async function carregarCartoesResgate() {
        if (!contentorResgates) return; // Se não estiver na página de resgates, ignora!

        contentorResgates.innerHTML = '<p style="text-align:center; width:100%; padding:20px; color:#2ea89c;"><i class="fa fa-spinner fa-spin fa-2x"></i><br>A procurar animais resgatados...</p>';

        try {
            const resposta = await fetch(`${API_BASE}/resgates-painel`);
            const resultado = await resposta.json();

            contentorResgates.innerHTML = ''; 

            if (resultado.status === 200 && resultado.data && resultado.data.length > 0) {
                
                // GUARDAR NA MEMÓRIA PARA O MODAL DE ADOÇÃO USAR DEPOIS!
                window.resgatesGlobais = resultado.data;

                contentorResgates.style.display = 'flex';
                contentorResgates.style.flexWrap = 'wrap';
                contentorResgates.style.gap = '20px';
                contentorResgates.style.justifyContent = 'center'; 

                resultado.data.forEach(resgate => {
                    const especie = resgate.especie ? resgate.especie.toLowerCase() : '';
                    const imagemSrc = (especie.includes('cão') || especie.includes('cao')) 
                                        ? '../../img/icone_cao.jpg' 
                                        : '../../img/icone_gato.jpg';
                    
                    const dataObj = new Date(resgate.data_resgate);
                    const dataFormatada = dataObj.toLocaleDateString('pt-PT');

                    const nomeAnimal = resgate.nome || 'Sem Nome';
                    const raca = resgate.raca || 'Desconhecida';
                    const idade = resgate.idade_aprox || 'Idade N/A';
                    
                    // O ID DO ANIMAL VEM DIRETAMENTE DA BASE DE DADOS
                    const idAnimal = resgate.id_animal; 

                    const cartaoHTML = `
                        <div class="cartao-resgate" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; text-align: center; width: 300px;">
                            <img src="${imagemSrc}" alt="${nomeAnimal}" style="width: 100%; height: 200px; object-fit: cover;">
                            
                            <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column;">
                                <h3 style="color: #2c3e50; margin-bottom: 2px; font-size: 1.5rem;">${nomeAnimal}</h3>
                                
                                <p style="color: #e67e22; font-weight: bold; font-size: 0.95rem; margin-bottom: 8px;">ID: ${idAnimal}</p>
                                
                                <p style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 5px;">${resgate.especie} • ${raca} • ${idade}</p>
                                <p style="color: #95a5a6; font-size: 0.8rem; margin-bottom: 15px;">Resgatado a: ${dataFormatada}</p>
                                
                                <div style="margin-bottom: auto;">
                                    <span style="background-color: #8e44ad; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; margin-bottom: 20px;">
                                        <i class="fa fa-home"></i> ${resgate.estado || 'Resgatado'}
                                    </span>
                                </div>
                                
                                
                            </div>
                        </div>
                    `;
                    contentorResgates.innerHTML += cartaoHTML;
                });

            } else {
                contentorResgates.innerHTML = '<p style="text-align:center; width:100%; color:#7f8c8d; font-size: 1.1rem; margin-top: 20px;">Ainda não existem animais resgatados no sistema.</p>';
            }
        } catch (erro) {
            console.error("Erro a puxar resgates:", erro);
            contentorResgates.innerHTML = '<p style="text-align:center; width:100%; color:red; margin-top: 20px;">Erro ao comunicar com a base de dados.</p>';
        }

        // =======================================================
    // CARREGAR TABELA DO LIVRO DE ARQUIVOS (ADOÇÕES)
    // =======================================================
    window.carregarArquivoAdocoes = async function() {
        const tbody = document.querySelector('#modal-historico-adocoes tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fa fa-spinner fa-spin"></i> A carregar arquivos...</td></tr>';

        try {
            const resposta = await fetch(`${API_BASE}/adocoes-arquivo`);
            const resultado = await resposta.json();

            tbody.innerHTML = '';

            if (resultado.status === 200 && resultado.data && resultado.data.length > 0) {
                resultado.data.forEach(adocao => {
                    const dataObj = new Date(adocao.data_resgate);
                    const dataFormatada = dataObj.toLocaleDateString('pt-PT');
                    
                    // Constrói a linha da tabela igual ao teu design HTML
                    tbody.innerHTML += `
                        <tr>
                            <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">${dataFormatada}</td>
                            <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;"><strong>${adocao.nome_animal}</strong> <span style="color: #95a5a6; font-size: 0.85rem;">(ID: ${adocao.id_animal})</span></td>
                            <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">${adocao.nome_dono}</td>
                            <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">${adocao.nif}</td>
                            <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; text-align: center;">
                                <i class="fa fa-file-pdf" style="color: #e74c3c; cursor: pointer; font-size: 1.2rem;" title="Ver Documento"></i>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Ainda não existem adoções registadas.</td></tr>';
            }
        } catch (erro) {
            console.error(erro);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red; padding: 20px;">Erro ao carregar os dados.</td></tr>';
        }
    };
    }

    // Arranque inicial dos cartões
    carregarCartoesResgate();

    // -------------------------------------------------------
    // B. CRIAR NOVO RESGATE (SUBMISSÃO DO FORMULÁRIO)
    // -------------------------------------------------------
    const formNovoResgate = document.querySelector('#modal-resgate form');

    if (formNovoResgate) {
        formNovoResgate.addEventListener('submit', async function(evento) {
            evento.preventDefault(); 

            // Puxa os dados das caixas do formulário
            const especie = document.getElementById('especie').value;
            const nome_animal = document.getElementById('nome_animal').value;
            const raca = document.getElementById('raca').value;
            const idade_aprox = document.getElementById('idade_aprox').value;
            const data_resgate = document.getElementById('data_resgate').value;

            // ==========================================
            // LER O FUNCIONÁRIO LOGADO PELO AUTH.JS
            // ==========================================
            const utilizadorStorage = localStorage.getItem('utilizadorLogado');
            let idFuncionarioAtual = 1; // Salva-vidas caso a sessão expire

            if (utilizadorStorage) {
                try {
                    // Desempacota o JSON guardado pelo auth.js
                    const utilizador = JSON.parse(utilizadorStorage);
                    // AGORA PUXA O ID DO FUNCIONÁRIO
                    idFuncionarioAtual = utilizador.id_funcionario || 1;
                } catch (e) {
                    console.error("Erro a ler a sessão do colaborador:", e);
                }
            }

            // Constrói o pacote de dados a enviar
            const dadosResgate = {
                especie: especie,
                nome_animal: nome_animal,
                raca: raca,
                idade_aprox: idade_aprox,
                data_resgate: data_resgate,
                id_funcionario: idFuncionarioAtual // Envia quem está a registar
            };

            const btnSalvar = formNovoResgate.querySelector('.btn-salvar');
            let textoOriginal = "Guardar Registo";
            
            if (btnSalvar) {
                textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="fa fa-spinner fa-spin"></i> A Guardar...';
                btnSalvar.disabled = true;
            }

            try {
                const resposta = await fetch(`${API_BASE}/resgates-painel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosResgate)
                });

                const resultado = await resposta.json();

                if (resultado.status === 201 || resultado.status === 200) {
                    alert("✅ Resgate registado com sucesso!");
                    
                    formNovoResgate.reset();
                    fecharModalResgates();
                    mudarImagemResgates(); 
                    
                    carregarCartoesResgate(); 
                    
                } else {
                    alert("❌ Ocorreu um erro: " + (resultado.message || "Verifique os dados."));
                }
            } catch (erro) {
                console.error("Erro na submissão:", erro);
                alert("❌ Erro de comunicação com o servidor. Verifica se o Backend está ligado.");
            } finally {
                if (btnSalvar) {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
                }
            }
        });
    }
// -------------------------------------------------------
    // C. LÓGICA DO MODAL DE ADOÇÃO (AGORA COM DADOS REAIS DA BD!)
    // -------------------------------------------------------
    const inputIdAnimal = document.getElementById('id_animal_resgate');
    const inputNifDono = document.getElementById('nif_novo_dono');
    const btnConfirmarAdocao = document.getElementById('btn-confirmar-adocao');

    if (inputIdAnimal && inputNifDono && btnConfirmarAdocao) {
        
        let animalValido = false;
        let clienteValido = false;

        // 1. Validar o ID do Animal (Procura nos resgates que já carregámos)
        inputIdAnimal.addEventListener('input', function() {
            const id = this.value.trim();
            const zonaResultado = document.getElementById('resultado_animal_resgate');
            
            if (id.length > 0 && window.resgatesGlobais) {
                // Procura o ID na lista real que veio do PostgreSQL
                const animal = window.resgatesGlobais.find(r => String(r.id_animal) === id);

                if (animal) {
                    const especieLow = animal.especie ? animal.especie.toLowerCase() : '';
                    const imagemSrc = (especieLow.includes('cão') || especieLow.includes('cao')) ? '../../img/icone_cao.jpg' : '../../img/icone_gato.jpg';

                    this.style.borderColor = "#2ea89c";
                    zonaResultado.innerHTML = `
                        <div style="background-color: #e0f2f1; padding: 10px; border-radius: 6px; display: flex; align-items: center; gap: 15px; border-left: 4px solid #2ea89c;">
                            <img src="${imagemSrc}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong style="color: #2c3e50; display: block;">${animal.nome || 'Sem Nome'}</strong>
                                <span style="font-size: 0.8rem; color: #7f8c8d;">${animal.especie}</span>
                            </div>
                            <span style="margin-left: auto; color: #2ea89c;"><i class="fa fa-check-circle"></i> Encontrado</span>
                        </div>
                    `;
                    animalValido = true;
                } else {
                    this.style.borderColor = "#e74c3c";
                    zonaResultado.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px;"><i class="fa fa-exclamation-triangle"></i> ID de animal não encontrado nos resgates.</p>';
                    animalValido = false;
                }
            } else {
                this.style.borderColor = "#dcdde1";
                zonaResultado.innerHTML = '';
                animalValido = false;
            }
            if(window.validarBotaoAdocao) window.validarBotaoAdocao(animalValido, clienteValido);
        });

        // 2. Validar o NIF do Cliente (Vai à base de dados procurar os clientes)
        inputNifDono.addEventListener('input', async function() {
            const nif = this.value.trim();
            const zonaResultado = document.getElementById('resultado_nif_dono');

            if (nif.length === 9) {
                zonaResultado.innerHTML = '<p style="color:#f39c12; font-size:0.85rem; margin-top:5px;"><i class="fa fa-spinner fa-spin"></i> A verificar NIF na base de dados...</p>';
                
                try {
                    // Vai buscar todos os clientes à tua rota (já sabemos que funciona!)
                    const resposta = await fetch(`${API_BASE}/clientes`);
                    const resultado = await resposta.json();

                    if (resultado.status === 200 && resultado.data) {
                        // Procura o cliente com este NIF
                        const cliente = resultado.data.find(c => String(c.nif) === nif);

                        if (cliente) {
                            this.style.borderColor = "#2ea89c";
                            zonaResultado.innerHTML = `
                                <div style="background-color: #e0f2f1; padding: 10px; border-radius: 6px; border-left: 4px solid #2ea89c;">
                                    <strong style="color: #2c3e50;"><i class="fa fa-user"></i> ${cliente.nome}</strong>
                                    <p style="font-size: 0.8rem; color: #7f8c8d; margin-top: 3px;">Ficha de cliente associada com sucesso.</p>
                                </div>
                            `;
                            clienteValido = true;
                        } else {
                            this.style.borderColor = "#e74c3c";
                            zonaResultado.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px;"><i class="fa fa-times-circle"></i> NIF não registado. O cliente deve ter ficha criada na clínica primeiro.</p>';
                            clienteValido = false;
                        }
                    }
                } catch (erro) {
                    zonaResultado.innerHTML = '<p style="color: red; font-size: 0.85rem; margin-top: 5px;">Erro ao ligar à base de dados.</p>';
                }
            } else {
                this.style.borderColor = (nif.length > 0) ? "#f39c12" : "#dcdde1";
                zonaResultado.innerHTML = (nif.length > 0 && nif.length < 9) ? '<p style="color: #f39c12; font-size: 0.85rem; margin-top: 5px;">A aguardar 9 dígitos...</p>' : '';
                clienteValido = false;
            }
            if(window.validarBotaoAdocao) window.validarBotaoAdocao(animalValido, clienteValido);
        });

        window.validarBotaoAdocao = function(animalOk, clienteOk) {
            if (animalOk && clienteOk) {
                btnConfirmarAdocao.disabled = false;
                btnConfirmarAdocao.style.opacity = "1";
                btnConfirmarAdocao.style.cursor = "pointer";
            } else {
                btnConfirmarAdocao.disabled = true;
                btnConfirmarAdocao.style.opacity = "0.5";
                btnConfirmarAdocao.style.cursor = "not-allowed";
            }
        };
        
        btnConfirmarAdocao.addEventListener('click', async function() {
            
            // Vai buscar os valores finais das caixas
            const idAnimal = inputIdAnimal.value.trim();
            const nifDono = inputNifDono.value.trim();

            const textoOriginal = this.innerHTML;
            this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> A processar...';
            this.disabled = true;

            try {
                // Manda para o nosso novo Backend!
                const resposta = await fetch(`${API_BASE}/adocao`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id_animal: idAnimal, 
                        nif_cliente: nifDono 
                    })
                });

                const resultado = await resposta.json();

                if (resultado.status === 200) {
                    alert("🎉 Parabéns! O animal foi adotado e a ficha foi atualizada para o novo dono!");
                    fecharModalAdocao();
                    carregarCartoesResgate(); // Recarrega os cartões (podes até ocultar os que já foram adotados depois)
                } else {
                    alert("❌ Ocorreu um erro: " + resultado.message);
                }
            } catch (erro) {
                console.error("Erro na adoção:", erro);
                alert("❌ Erro de comunicação com o servidor.");
            } finally {
                this.innerHTML = textoOriginal;
                this.disabled = false;
            }
        });
    }
});
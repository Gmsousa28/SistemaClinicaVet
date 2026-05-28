const API_BASE = "http://localhost:8008/api";

// Funcoes usadas pelos botoes para abrir e fechar modais
function abrirModalCliente() { 
    document.getElementById('modal-cliente').style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
}

function fecharModalCliente() { 
    document.getElementById('modal-cliente').style.display = 'none'; 
    document.body.style.overflow = ''; 
}

function abrirModalResgates() { 
    document.getElementById('modal-resgate').style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
}

function fecharModalResgates() { 
    document.getElementById('modal-resgate').style.display = 'none'; 
    document.body.style.overflow = ''; 
}

function abrirModalAdocao() { 
    const m = document.getElementById('modal-adocao'); 
    if(m) { 
        // Sempre que abre, limpa a validacao anterior da adocao
        m.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
        const form = document.getElementById('form-formalizar-adocao');
        if (form) form.reset();
        const resAnimal = document.getElementById('resultado_animal_resgate');
        if (resAnimal) resAnimal.innerHTML = '';
        const resDono = document.getElementById('resultado_nif_dono');
        if (resDono) resDono.innerHTML = '';
        if(window.validarBotaoAdocao) window.validarBotaoAdocao(false, false);
    } 
}

function fecharModalAdocao() { 
    const m = document.getElementById('modal-adocao'); 
    if(m) { 
        m.style.display = 'none'; 
        document.body.style.overflow = ''; 
    } 
}

function abrirModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalHistoricoAdocoes() {
    const modal = document.getElementById('modal-historico-adocoes');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function mudarImagemResgates() {
    // Atualiza a imagem de exemplo conforme a especie escolhida
    const selecao = document.getElementById('especie').value;
    const imagem = document.getElementById('foto-preview');
    if (imagem) {
        imagem.src = selecao === 'cao' ? "../../img/icone_cao.jpg" : "../../img/icone_gato.jpg";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Carrega as consultas do dia no dashboard
    const tbodyConsultasHoje = document.querySelector('table tbody');

    if (tbodyConsultasHoje) {
        carregarConsultasDeHoje();
    }

    async function carregarConsultasDeHoje() {
        // Mostra apenas as consultas cuja data corresponde ao dia atual
        tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fa fa-spinner fa-spin"></i> A carregar...</td></tr>';
        try {
            const resposta = await fetch(`${API_BASE}/consultas`);
            const resultado = await resposta.json();

            if (resultado.status === 200) {
                const dataHojeLocal = new Date();
                const ano = dataHojeLocal.getFullYear();
                const mes = String(dataHojeLocal.getMonth() + 1).padStart(2, '0');
                const dia = String(dataHojeLocal.getDate()).padStart(2, '0');
                const dataDeHojeTexto = `${ano}-${mes}-${dia}`; 

                // Compara a data em formato local para evitar falhas de timezone
                const consultasHoje = resultado.data.filter(c => c.data_consulta && c.data_consulta.startsWith(dataDeHojeTexto));

                tbodyConsultasHoje.innerHTML = ''; 

                if (consultasHoje.length === 0) {
                    tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#7f8c8d;">Sem consultas marcadas para hoje.</td></tr>';
                    return;
                }

                consultasHoje.forEach(c => {
                    const horaConsulta = new Date(c.data_consulta).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'});
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${horaConsulta}</td>
                        <td><i class="fa fa-paw" style="color:#7f8c8d;"></i> ID Animal: ${c.id_animal}</td>
                        <td>ID Vet: ${c.id_veterinario}</td> 
                        <td>${c.motivo || 'Consulta'}</td>
                        <td><span style="color:#2ea89c; font-weight:bold;">${c.estado || 'Agendado'}</span></td>
                        <td>
                            <button class="btn-alternar-validar" style="background-color:#2ea89c; color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; font-weight:bold; transition: 0.3s;">
                                <i class="fa fa-check"></i> Validar
                            </button>
                        </td>
                    `;
                    tbodyConsultasHoje.appendChild(tr);
                });

                // Alterna o estado visual do botao de validacao
                document.querySelectorAll('.btn-alternar-validar').forEach(botao => {
                    botao.addEventListener('click', function() {
                        if (this.innerText.includes('Validado')) {
                            this.innerHTML = '<i class="fa fa-check"></i> Validar';
                            this.style.backgroundColor = '#2ea89c'; 
                            this.style.opacity = '1';
                        } else {
                            this.innerHTML = '<i class="fa fa-check-double"></i> Validado';
                            this.style.backgroundColor = '#7f8c8d'; 
                            this.style.opacity = '0.7';
                        }
                    });
                });
            }
        } catch (erro) {
            tbodyConsultasHoje.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro a carregar.</td></tr>';
        }
    }

// Pesquisa a ficha de cliente pelo NIF
    const btnPesquisar = document.getElementById('btn-pesquisar-cliente') || document.querySelector('.btn-pesquisar');
    const inputPesquisaNif = document.getElementById('pesquisa-nif') || document.querySelector('.input-pesquisa-nif');
    const btnFecharFicha = document.getElementById('btn-fechar-ficha');
    const btnAgendar = document.getElementById('btn-agendar-consulta');

    if (btnFecharFicha) btnFecharFicha.addEventListener('click', fecharModalCliente);
    if (btnAgendar) btnAgendar.addEventListener('click', () => { window.location.href = 'marcacoes_recep.html'; });

    if (btnPesquisar && inputPesquisaNif) {
        btnPesquisar.addEventListener('click', async function(e) {
            e.preventDefault(); 
            const nifDigitado = inputPesquisaNif.value.trim();

            if (nifDigitado.length !== 9 || isNaN(nifDigitado)) {
                alert("Por favor, introduza um NIF válido contendo exatamente 9 números.");
                return;
            }

            const textoOriginal = btnPesquisar.innerHTML;
            btnPesquisar.innerHTML = '<i class="fa fa-spinner fa-spin"></i> A procurar...';

            try {
                // Procura o NIF na lista de clientes devolvida pelo backend
                const respostaTodosClientes = await fetch(`${API_BASE}/clientes`);
                const resultadoTodos = await respostaTodosClientes.json();

                if (resultadoTodos.status === 200 && resultadoTodos.data) {
                    
                    const clienteEncontrado = resultadoTodos.data.find(c => String(c.nif) === nifDigitado);

                    if (clienteEncontrado) {
                        
                        // 👇 O NOSSO RAIO-X PARA A CONSOLA (F12) 👇
                        console.log("O QUE VEM DA BASE DE DADOS:", clienteEncontrado);
                        // 👆 -------------------------------------- 👆

                        document.getElementById('cliente_nome').value = clienteEncontrado.nome || '';
                        document.getElementById('cliente_nif').value = clienteEncontrado.nif || '';
                        
                        // Lógica de conversão de data à prova de bala
                        let dataFinal = '';
                        if (clienteEncontrado.data_nascimento) {
                            const dataObj = new Date(clienteEncontrado.data_nascimento);
                            
                            // Verifica se a data é válida antes de a formatar
                            if (!isNaN(dataObj.getTime())) {
                                const ano = dataObj.getFullYear();
                                const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                                const dia = String(dataObj.getDate()).padStart(2, '0');
                                dataFinal = `${ano}-${mes}-${dia}`;
                            } else {
                                console.log("Atenção: A data recebida não é válida para o JS:", clienteEncontrado.data_nascimento);
                            }
                        }
                        document.getElementById('cliente_nascimento').value = dataFinal;

                        document.getElementById('cliente_email').value = clienteEncontrado.email || '';
                        document.getElementById('cliente_tlm').value = clienteEncontrado.contacto || '';
                        document.getElementById('cliente_morada').value = clienteEncontrado.morada || '';

                        await carregarAnimaisDoCliente(nifDigitado);
                        abrirModalCliente();
                    } else {
                        alert(`O cliente com o NIF ${nifDigitado} não foi encontrado no sistema.\nPor favor, proceda à criação de uma nova ficha.`);
                    }
                } else {
                    alert("Erro ao ler a base de dados de clientes.");
                }
            } catch (erro) {
                console.error(erro);
                alert("Erro ao ligar ao servidor.");
            } finally {
                btnPesquisar.innerHTML = textoOriginal;
            }
        });
    }
    async function carregarAnimaisDoCliente(nif) {
        // Carrega os animais associados ao NIF pesquisado
        const listaAnimais = document.getElementById('lista_animais_cliente');
        if(!listaAnimais) return;
        
        listaAnimais.innerHTML = '<p style="text-align:center;"><i class="fa fa-spinner fa-spin"></i> A procurar animais...</p>';

        try {
            const resposta = await fetch(`${API_BASE}/animais/nif/${nif}`);
            const resultado = await resposta.json();
            listaAnimais.innerHTML = ''; 

            if (resultado.status === 200 && resultado.data && resultado.data.length > 0) {
                resultado.data.forEach(animal => {
                    let especie = animal.especie.toLowerCase();
                    let icone = especie.includes('cão') || especie.includes('cao') ? '../../img/icone_cao.jpg' : '../../img/icone_gato.jpg';
                    let dataNasc = animal.data_nascimento ? animal.data_nascimento.split('T')[0] : 'Desconhecida';

                    listaAnimais.innerHTML += `
                        <div class="mini-cartao-animal">
                            <img src="${icone}" alt="${animal.nome}">
                            <div class="mini-info">
                                <strong>${animal.nome}</strong>
                                <span>${animal.especie} • ${animal.raca} • Nasc: ${dataNasc}</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                listaAnimais.innerHTML = '<p style="color:#7f8c8d; padding:10px;">Este cliente não tem animais registados.</p>';
            }
        } catch (erro) {
            listaAnimais.innerHTML = '<p style="color:red; padding:10px;">Erro ao carregar lista de animais.</p>';
        }
    }

    // Valida os campos do modal de adocao
    const inputIdAnimal = document.getElementById('id_animal_resgate');
    const inputNifDono = document.getElementById('nif_novo_dono');
    const btnConfirmarAdocao = document.getElementById('btn-confirmar-adocao');

    if (inputIdAnimal && inputNifDono) {
        
        // Dados temporarios usados para validar a adocao neste ecra
        const animaisResgatadosDB = {
            "405": { nome: "Sem Nome", especie: "Cão • Sénior", img: "../../img/icone_cao.jpg" },
            "102": { nome: "Bolinha", especie: "Cão • Adulto", img: "../../img/icone_cao.jpg" },
            "55":  { nome: "Simba", especie: "Gato • Jovem", img: "../../img/icone_gato.jpg" }
        };

        const clientesDB = {
            "123456789": { nome: "João Silva", email: "joao.silva@email.com" },
            "987654321": { nome: "Ana Costa", email: "ana.costa@email.com" }
        };

        let animalValido = false;
        let clienteValido = false;

        inputIdAnimal.addEventListener('input', function() {
            // Valida se o animal existe na lista temporaria de resgates
            const id = this.value.trim();
            const zonaResultado = document.getElementById('resultado_animal_resgate');
            
            if (id.length > 0) {
                if (animaisResgatadosDB[id]) {
                    const animal = animaisResgatadosDB[id];
                    this.style.borderColor = "#2ea89c";
                    zonaResultado.innerHTML = `
                        <div style="background-color: #e0f2f1; padding: 10px; border-radius: 6px; display: flex; align-items: center; gap: 15px; border-left: 4px solid #2ea89c;">
                            <img src="${animal.img}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong style="color: #2c3e50; display: block;">${animal.nome}</strong>
                                <span style="font-size: 0.8rem; color: #7f8c8d;">${animal.especie}</span>
                            </div>
                            <span style="margin-left: auto; color: #2ea89c;"><i class="fa fa-check-circle"></i> Encontrado</span>
                        </div>
                    `;
                    animalValido = true;
                } else {
                    this.style.borderColor = "#e74c3c";
                    zonaResultado.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px;"><i class="fa fa-exclamation-triangle"></i> ID de animal não encontrado nos resgates ativos.</p>';
                    animalValido = false;
                }
            } else {
                this.style.borderColor = "#dcdde1";
                zonaResultado.innerHTML = '';
                animalValido = false;
            }
            validarBotaoAdocao(animalValido, clienteValido);
        });

        inputNifDono.addEventListener('input', function() {
            // Valida se o NIF existe na lista temporaria de clientes
            const nif = this.value.trim();
            const zonaResultado = document.getElementById('resultado_nif_dono');

            if (nif.length === 9) {
                if (clientesDB[nif]) {
                    const cliente = clientesDB[nif];
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
            } else {
                this.style.borderColor = (nif.length > 0) ? "#f39c12" : "#dcdde1";
                zonaResultado.innerHTML = (nif.length > 0 && nif.length < 9) ? '<p style="color: #f39c12; font-size: 0.85rem; margin-top: 5px;">A aguardar 9 dígitos...</p>' : '';
                clienteValido = false;
            }
            validarBotaoAdocao(animalValido, clienteValido);
        });

        window.validarBotaoAdocao = function(animalOk, clienteOk) {
            // O botao so fica ativo quando animal e cliente sao validos
            if (animalOk && clienteOk) {
                btnConfirmarAdocao.disabled = false;
                btnConfirmarAdocao.style.opacity = "1";
                btnConfirmarAdocao.style.cursor = "pointer";
            } else {
                btnConfirmarAdocao.disabled = true;
                btnConfirmarAdocao.style.opacity = "0.5";
                btnConfirmarAdocao.style.cursor = "not-allowed";
            }
        }
        
        btnConfirmarAdocao.addEventListener('click', function() {
            alert("Sucesso! O animal foi associado ao NIF do novo dono. O processo será arquivado.");
            fecharModalAdocao();
        });
    }
});

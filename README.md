# Clínica Miacãomigo (SistemaClinicaVet)

## Resumo do Projeto
Este projeto consistiu no desenvolvimento de um sistema web full-stack para a gestão de uma clínica veterinária, a Clínica Miacãomigo. O objetivo foi criar uma plataforma para centralizar o atendimento na receção, a gestão de pacientes e o registo de consultas. 

O sistema foi construído assente numa arquitetura cliente-servidor. No lado do servidor (backend), foi desenvolvida uma API RESTful utilizando Node.js e Express para gerir as regras de negócio e a comunicação com a base de dados. A persistência de dados foi garantida através de uma base de dados relacional em PostgreSQL, com recurso intensivo a PL/pgSQL para a criação de stored procedures e triggers que asseguram a integridade e automação de certas operações. No lado do cliente (frontend), a interface foi construída utilizando HTML, CSS e JavaScript puro para consumir a API e apresentar os dados de forma dinâmica aos utilizadores.

## Tecnologias Utilizadas

*   Frontend: HTML5 (25.7%), CSS3 (11%) e JavaScript (52.1%)
*   Backend: Node.js (com Express)
*   Base de Dados: PostgreSQL e PL/pgSQL (11.2%)

## Estrutura do Projeto

A arquitetura do repositório está dividida da seguinte forma:

*   /frontend e /JS: Contém os ficheiros estáticos e a lógica de interface do utilizador.
*   /backend e server.js: Contém a configuração do servidor Node.js, as rotas da API e a lógica de ligação à base de dados.
*   /SQL: Contém os scripts finais de criação da base de dados, tabelas, comentários e as consultas/procedures utilizadas.

## Pré-requisitos

Antes de iniciar, certifique-se de que tem as seguintes ferramentas instaladas:
*   Node.js
*   PostgreSQL
*   Git

## Instalação e Configuração

1. Clonar o repositório
\`\`\`bash
git clone https://github.com/Gmsousa28/SistemaClinicaVet.git
cd SistemaClinicaVet
\`\`\`

2. Instalar as dependências
\`\`\`bash
npm install
\`\`\`

3. Configurar as variáveis de ambiente
Copie o ficheiro .env.example para um novo ficheiro chamado .env e preencha as credenciais e ligações da sua base de dados PostgreSQL.
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configurar a Base de Dados
Execute os scripts SQL disponíveis na pasta /SQL no seu servidor PostgreSQL para criar a estrutura da base de dados, as funções em PL/pgSQL e inserir quaisquer dados iniciais.

5. Iniciar o servidor
\`\`\`bash
node server.js
\`\`\`
O sistema estará disponível no seu browser através do endereço configurado (ex: http://localhost:PORT).

## Contribuidores

Este projeto foi desenvolvido no âmbito académico pelos seguintes alunos:

*   Gonçalo Sousa (@Gmsousa28)
*   Alexandre Gonçalves (@Alexandre-11)
*   Daniel Vilela (@Danielvilela10)
*   Francisco Oliveira (@machadinha)

const express = require('express');
const path = require("path");
const cors = require('cors'); //npm install cors e serve para dar permissoes ao chrome e etc para aceder
const pool = require('./backend/config/db.js');
const server = express();
const port = 8008;

// Serve ficheiros estáticos (HTML, CSS, JS)
server.use(express.static(path.join(__dirname, 'frontend')));

// 1. Importa o router (ajusta o caminho se necessário)
const animaisRouter = require('./backend/routes/animais_rotas.js'); 
const clientesRouter = require('./backend/routes/clientes_rotas.js');
const funcionariosRouter = require('./backend/routes/funcionarios_rotas.js');
const veterinariosRouter = require('./backend/routes/veterinarios_rotas.js');
const examesRouter = require('./backend/routes/exame_rotas.js');
const consultasRouter = require('./backend/routes/consultas_rotas.js');
const horariosClinicaRouter = require('./backend/routes/horario_clinica_rotas.js');
const adocoesRouter = require('./backend/routes/adocoes_rotas.js');
const faturasRouter = require('./backend/routes/faturas_rotas.js');
const servicosRouter = require('./backend/routes/servicos_rotas.js');
const loginsClienteRouter = require('./backend/routes/logins_cliente_rotas.js');
const loginsColaboradorRouter = require('./backend/routes/logins_colaborador_rotas.js');
const ocorrenciasLaboraisRouter = require('./backend/routes/ocorrencias_laborais_rotas.js');

// 2. Middleware para o servidor entender JSON (Obrigatório para POST/PUT)
server.use(express.json());

// 3. Diz ao servidor para usar as rotas de animais com o prefixo /api
server.use("/api", animaisRouter);
server.use("/api", clientesRouter);
server.use("/api", funcionariosRouter);
server.use("/api", veterinariosRouter);
server.use("/api", examesRouter);
server.use("/api", consultasRouter);
server.use("/api", horariosClinicaRouter);
server.use("/api", adocoesRouter);
server.use("/api", faturasRouter);
server.use("/api", servicosRouter);
server.use("/api", loginsClienteRouter);
server.use("/api", loginsColaboradorRouter);
server.use("/api", ocorrenciasLaboraisRouter);

//Importar router de customers
//const customersRouter = require('./backend/routes/customersRoutes.js');
//const errorHandlinºg = require('./backend/middlewares/errorHandler.js');

//Middlewares
// Middleware para processar JSON
//server.use(express.json());
//server.use(cors());

//Routes
// Todas as rotas que começam por /api são tratadas em routes/customersRoutes.js
//server.use("/api", customersRouter);

//Error handling
//server.use(errorHandling);


//Testing postgres connection
server.get("/", async(req,res)=>
{
  const result = await pool.query("SELECT current_database()");
  res.send("The database name is: " + result.rows[0].current_database);
});

server.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});
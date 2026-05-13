const express = require('express');
const path = require('path');
const cors = require('cors');

const pool = require('./backend/config/db.js');
const errorHandling = require('./backend/middlewares/errorHandler.js');

const server = express();
const port = 8008;

/* ======================================================
   MIDDLEWARES
====================================================== */

// Permitir pedidos do frontend
server.use(cors());

// Permitir JSON no body das requisições
server.use(express.json());

// Permitir formulários
server.use(express.urlencoded({ extended: true }));

// Servir ficheiros estáticos
server.use(express.static(path.join(__dirname, 'frontend')));
server.use(cors()); // Habilita CORS para todas as rotas




/* ======================================================
   IMPORTAÇÃO DAS ROTAS
====================================================== */

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

/* ======================================================
   ROTAS API
====================================================== */

server.use('/api', animaisRouter);
server.use('/api', clientesRouter);
server.use('/api', funcionariosRouter);
server.use('/api', veterinariosRouter);
server.use('/api', examesRouter);
server.use('/api', consultasRouter);
server.use('/api', horariosClinicaRouter);
server.use('/api', adocoesRouter);
server.use('/api', faturasRouter);
server.use('/api', servicosRouter);
server.use('/api', loginsClienteRouter);
server.use('/api', loginsColaboradorRouter);
server.use('/api', ocorrenciasLaboraisRouter);

/* ======================================================
   TESTE DA BASE DE DADOS
====================================================== */

server.get('/', async (req, res) => {
    try {

        const result = await pool.query(
            'SELECT current_database()'
        );

        res.send(
            `Base de dados ligada: ${result.rows[0].current_database}`
        );

    } catch (err) {

        console.error('Erro na ligação à BD:', err);

        res.status(500).send('Erro na ligação à base de dados.');
    }
});

/* ======================================================
   TRATAMENTO DE ERROS
====================================================== */

server.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
        status: 500,
        message: 'Erro interno do servidor.'
    });
});

/* ======================================================
   INICIAR SERVIDOR
====================================================== */

server.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});

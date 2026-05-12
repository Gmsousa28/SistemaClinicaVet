const pool = require('../config/db.js');

const listarConsultasBD = async () => {
    const result = await pool.query('SELECT * FROM consulta ORDER BY id_consulta DESC');
    return result.rows;
};

const criarConsultaBD = async (id_animal, id_veterinario, data_consulta, motivo) => {
    
    // Tratamento de segurança: se o motivo tiver uma plica (ex: "banho d'água"), 
    // substituímos por duas plicas para não partir a query SQL.
    const motivoSeguro = motivo.replace(/'/g, "''");

    // A tua lógica toda colocada dentro de um Bloco Anónimo DO $$
    const query = `
    DO $$
    DECLARE
        v_id_colaborador INT;
        v_dia_semana public.dia_semana;
        horario_valido BOOLEAN;
        veterinario_indisponivel BOOLEAN;
        consulta_existente BOOLEAN;
    BEGIN
        -- REGRA 1: Viagem no Tempo
        IF '${data_consulta}'::TIMESTAMP < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Operação bloqueada: Não é possível marcar consultas no passado (%).', '${data_consulta}';
        END IF;

        -- Obter o id_colaborador correspondente ao id_veterinario
        SELECT id_colaborador 
        INTO v_id_colaborador
        FROM public.colaborador
        WHERE id_veterinario = ${id_veterinario};

        IF v_id_colaborador IS NULL THEN
            RAISE EXCEPTION 'Operação bloqueada: O veterinário (ID %) não está registado como colaborador.', ${id_veterinario};
        END IF;

        -- REGRA 2: Horário de Trabalho
        v_dia_semana := CASE EXTRACT(DOW FROM '${data_consulta}'::TIMESTAMP)
            WHEN 0 THEN CAST('Domingo' AS public.dia_semana)
            WHEN 1 THEN CAST('Segunda' AS public.dia_semana)
            WHEN 2 THEN CAST('Terça' AS public.dia_semana)
            WHEN 3 THEN CAST('Quarta' AS public.dia_semana)
            WHEN 4 THEN CAST('Quinta' AS public.dia_semana)
            WHEN 5 THEN CAST('Sexta' AS public.dia_semana)
            WHEN 6 THEN CAST('Sábado' AS public.dia_semana)
        END;

        horario_valido := EXISTS (
            SELECT 1 FROM public.horario
            WHERE id_colaborador = v_id_colaborador 
              AND dia_semana = v_dia_semana
              AND CAST('${data_consulta}'::TIMESTAMP AS TIME) >= hora_entrada
              AND CAST(('${data_consulta}'::TIMESTAMP + INTERVAL '30 minutes') AS TIME) <= hora_saida
        );

        IF NOT horario_valido THEN
            RAISE EXCEPTION 'Operação bloqueada: A consulta está fora do horário de trabalho do veterinário ou é dia de folga.';
        END IF;

        -- REGRA 3: Férias ou Falta
        veterinario_indisponivel := EXISTS(
            SELECT 1 FROM public.ocorrencia_laboral
            WHERE id_colaborador = v_id_colaborador 
              AND CAST('${data_consulta}'::TIMESTAMP AS DATE) >= data_inicio
              AND CAST('${data_consulta}'::TIMESTAMP AS DATE) <= data_fim
        );

        IF veterinario_indisponivel THEN
            RAISE EXCEPTION 'Operação bloqueada: O veterinário encontra-se indisponível (Férias/Faltas/Folga) na data solicitada.';
        END IF;
        
        -- REGRA 4: Sobreposição de Consultas (30 minutos)
        consulta_existente := EXISTS (
            SELECT 1 FROM public.consulta
            WHERE id_veterinario = ${id_veterinario}
              AND ('${data_consulta}'::TIMESTAMP, '${data_consulta}'::TIMESTAMP + INTERVAL '30 minutes')
                  OVERLAPS(data_consulta, data_consulta + INTERVAL '30 minutes')
        );

        IF consulta_existente THEN
            RAISE EXCEPTION 'Operação bloqueada: O veterinário já tem uma consulta a decorrer nesse horário. As consultas requerem intervalos de 30 minutos.';
        END IF;

        -- SE TUDO ESTIVER CORRETO, FAZ O INSERT FINAL
        INSERT INTO public.consulta (id_animal, id_veterinario, data_consulta, motivo)
        VALUES (${id_animal}, ${id_veterinario}, '${data_consulta}'::TIMESTAMP, '${motivoSeguro}');
        
    END $$;
    `;

    // 1. Executa o bloco de código com as validações da professora
    await pool.query(query);

    // 2. Como o bloco anónimo (DO $$) não suporta a cláusula RETURNING *, 
    // fazemos um pequeno SELECT rápido a seguir para devolver a consulta recém-criada ao teu Controller
    const result = await pool.query(
        'SELECT * FROM public.consulta WHERE id_animal = $1 AND id_veterinario = $2 AND data_consulta = $3 ORDER BY id_consulta DESC LIMIT 1', 
        [id_animal, id_veterinario, data_consulta]
    );
    
    return result.rows[0]; 
};


const obterConsultaByIdBD = async (id_consulta) => {
    const result = await pool.query('SELECT * FROM consulta WHERE id_consulta = $1', [id_consulta]);
    return result.rows[0];
};

const atualizarConsultaBD = async (id_consulta, id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco) => {
    const query = `
        UPDATE consulta 
        SET id_animal = $1, id_veterinario = $2, data_consulta = $3, motivo = $4, diagnostico = $5, estado = $6, preco = $7 
        WHERE id_consulta = $8 
        RETURNING *;
    `;
    const values = [id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco, id_consulta];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const eliminarConsultaBD = async (id_consulta) => {
    const result = await pool.query('DELETE FROM consulta WHERE id_consulta = $1 RETURNING *', [id_consulta]);
    return result.rows[0];
};

module.exports = {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD
};
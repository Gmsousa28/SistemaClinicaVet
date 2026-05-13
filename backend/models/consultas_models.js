const pool = require('../config/db.js');

const listarConsultasBD = async () => {
    const result = await pool.query('SELECT * FROM consulta ORDER BY id_consulta DESC');
    return result.rows;
};

const criarConsultaBD = async (id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco) => {
    
    // A query SQL limpa e normal
    const query = `
        INSERT INTO consulta 
        (id_animal, id_veterinario, data_consulta, motivo, diagnostico, estado, preco) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
    `;
    
    // É AQUI QUE A MAGIA ACONTECE:
    const values = [
        id_animal, 
        id_veterinario, 
        data_consulta, 
        motivo, 
        diagnostico || null,   // Se vier vazio, manda NULL (como querias)
        estado || 'Agendado',  // Se vier vazio, manda automaticamente a palavra 'Agendado'
        preco || 35.00         // Se vier vazio, manda automaticamente 35.00
    ];
    
    const result = await pool.query(query, values);
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

const listarConsultasDoVeterinarioBD = async (id_veterinario) => {
    // Usa crases (`) para permitir as quebras de linha
    const result = await pool.query(`
        SELECT c.data_consulta, c.motivo, cl.nome, a.animal, a.especie, a.raca
        FROM public.veterinario v 
        INNER JOIN public.consulta c ON v.id_veterinario = c.id_veterinario
        INNER JOIN public.animal a ON c.id_animal = a.id_animal
        INNER JOIN public.cliente cl ON a.id_cliente = cl.id_cliente
        WHERE v.id_veterinario = $1 
        ORDER BY c.data_consulta DESC;
    `, [id_veterinario]); // O $1 ali em cima vai ser substituído por este id_veterinario
    
    return result.rows;
};

module.exports = {
    listarConsultasBD,
    criarConsultaBD,
    obterConsultaByIdBD,
    atualizarConsultaBD,
    eliminarConsultaBD,
    listarConsultasDoVeterinarioBD
};
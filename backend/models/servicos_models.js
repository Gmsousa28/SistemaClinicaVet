const pool = require('../config/db.js');

const listarServicosBD = async () => {
    const result = await pool.query('SELECT * FROM servicos ORDER BY id_servicos DESC');
    return result.rows;
};
// ==========================================
// FUNÇÃO NOVA: Comando SQL para apagar na BD
// ==========================================
const apagarServicoBD = async (idServico) => {
    try {
        // Apaga onde o id bater certo (id_servicos é o nome da tua coluna)
        const query = 'DELETE FROM public.servicos WHERE id_servicos = $1 RETURNING *';
        const valores = [idServico];
        
        const resultado = await pool.query(query, valores);
        
        // Se rowCount for maior que 0, significa que encontrou e apagou
        return resultado.rowCount > 0; 
    } catch (error) {
        console.error("Erro no modelo ao apagar serviço:", error);
        throw error;
    }
};
module.exports = {
    listarServicosBD,
    apagarServicoBD
};
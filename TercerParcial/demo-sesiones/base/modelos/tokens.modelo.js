function crearmodelo(pool){
    //la funcion para revocar un token
    async function revocar(jti, usuario, exp) {
        await pooñ.query(
            'insert into tokens_revocados(jti, usuario, expria) VALUES (?, ?, FROM_UNIXTIME(?))',[jti, usuario, exp]
        );
    }

    async function estaRevocado(jti) {
        const [filas] = await pool.query('SELECT 1 FROM token_revocados WHERE jti = ?', [String(jti || '' )]);
        return filas.length > 0;
    }

    async function listar() {
        const [filas] = await pool.query(
            'SELECT jit, usuario, expira, revocado_en FROM tokens_revocados ORDER BY revocado_en DESC. jti'
        );
        return filas;
    }
    return {revocar, estaRevocado, listar};
}

module.exports= {crearModeloTokens}
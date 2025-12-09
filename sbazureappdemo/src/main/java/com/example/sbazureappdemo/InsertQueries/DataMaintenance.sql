INSERT INTO m_metaposteadorasistente (
    codposteador, 
    fecinicioperiodometa, 
    fecfinperiodometa, 
    numpostemeta, 
    flvigente, 
    codusuarioauditoria, 
    fecreacionregistro, 
    horacreacionregistro,
    fecactualizacionregistro,
    horaactualizacionregistro
) VALUES 
    (
        'MM', 
        '2025-02-01',
        '2025-02-25',
        20,
        'S',
        'UserPrueba',
        CURRENT_DATE,  -- Fecha actual
        CURRENT_TIME AT TIME ZONE 'America/Lima' ,
        CURRENT_DATE,  -- Fecha actual
        CURRENT_TIME AT TIME ZONE 'America/Lima' -- Hora actual con zona horaria convertida a `time`
    )
ON CONFLICT (codposteador, fecinicioperiodometa, fecfinperiodometa) 
DO UPDATE SET 
    codposteador = EXCLUDED.codposteador,
	fecinicioperiodometa = EXCLUDED.fecinicioperiodometa, 
	fecfinperiodometa = EXCLUDED.fecfinperiodometa, 
	numpostemeta = EXCLUDED.numpostemeta, 
	flvigente = EXCLUDED.flvigente, 
	codusuarioauditoria = EXCLUDED.codusuarioauditoria, 
	fecactualizacionregistro=CURRENT_DATE,
    horaactualizacionregistro=CURRENT_TIME AT TIME ZONE 'America/Lima';

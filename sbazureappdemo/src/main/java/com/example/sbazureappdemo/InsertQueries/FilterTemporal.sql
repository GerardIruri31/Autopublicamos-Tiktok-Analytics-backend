SELECT 
    mp.codpublicacion,
    mp.codautora,
    COALESCE(a.nbautora, 'Not found: N/A') || ' ' || COALESCE(a.apeautora, '') AS Autora,
    mp.codescena,
    COALESCE(esc.desscena, 'Not found: N/A') AS desscena,
    mp.codlibro,
    COALESCE(lb.deslibro, 'Not found: N/A') AS deslibro,
    mp.numescena,
    mp.tippublicacion,
    COALESCE(tp.despost, 'Not found: N/A') AS TipoPost,
    mp.codposteador,
    COALESCE(po.nbposteador, 'Not found: N/A') || ' ' || COALESCE(po.apepatposteador, '') || ' ' || COALESCE(po.apematposteador, '') AS Posteador,
    mp.fecpublicacion,
    mp.horapublicacion,
    mp.nbrcuentatiktok,
    mp.urlpublicacion,
    mp.numviews,
    mp.numlikes,
    mp.numsaves,
    mp.numreposts,
    mp.numcomments,
    mp.numengagement,
    mp.deshashtags,
    mp.nrohashtag,
    mp.urlsounds,
    mp.codregionposteo,
    mp.fecreacionregistro,
    mp.horacreacionregistro
FROM h_metricapublicacion mp
INNER JOIN (
    SELECT 
        codpublicacion, 
        MAX(mpint.fecreacionregistro+mpint.horacreacionregistro) AS max_fecreacionregistro
    FROM h_metricapublicacion mpint
    WHERE 
        mpint.fecpublicacion BETWEEN '2025-01-02' AND '2025-03-06'
        --AND mpint.fecreacionregistro BETWEEN '2025-02-01' AND '2025-02-26'
        --AND mpint.codautora IN ('LM')
        --AND mpint.codlibro IN ('CH', 'CL')
        --AND mpint.codposteador IN ('BM', 'AL')
        --AND mpint.codescena IN ('CHS05v1a', 'CL18b')
        --AND mpint.tippublicacion IN ('a', 'c')
        --AND mpint.nbrcuentatiktok IN ('bethanysweetchapters', 'loreleilovechapters')
        --AND mpint.codpublicacion IN ('7470977021099740446', '7470225104446737695')
        --AND mpint.codregionposteo IN ('US')
    GROUP BY mpint.codpublicacion
) base
ON mp.codpublicacion = base.codpublicacion 
AND (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro
LEFT JOIN m_autora a ON mp.codautora = a.codautora
LEFT JOIN m_escenalibro esc ON mp.codescena = esc.codescena
LEFT JOIN m_libro lb ON mp.codlibro = lb.codlibro
LEFT JOIN m_tipopost tp ON mp.tippublicacion = tp.tippublicacion
LEFT JOIN m_posteadorasistente po ON mp.codposteador = po.codposteador
WHERE 
    --mp.numlikes BETWEEN 0 AND 1000
    --AND mp.numinteractions BETWEEN 0 AND 1000
    --AND mp.numreposts BETWEEN 0 AND 1000
    --AND mp.numsaves BETWEEN 0 AND 1000
    mp.numviews BETWEEN 0 AND 10000
    --AND mp.numengagement BETWEEN 0 AND 1000;

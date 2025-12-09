SELECT 
    mp.codpublicacion,
    mp.codautora,
    COALESCE(a.nbautora, '') || ' ' || COALESCE(a.apeautora, '') AS Autora,
    mp.codescena,
    esc.desscena,
    mp.codlibro,
    lb.deslibro,
    mp.numescena,
    mp.tippublicacion,
    tp.despost,
    mp.codposteador,
    COALESCE(po.nbposteador, '') || ' ' || COALESCE(po.apepatposteador, '') || ' ' || COALESCE(po.apematposteador, '') AS Posteador,
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
        MAX(fecreacionregistro) AS max_fecreacionregistro
    FROM h_metricapublicacion
    WHERE 
        fecpublicacion BETWEEN '2025-01-01' AND '2025-02-26'
        -- AND fecreacionregistro BETWEEN '2025-02-01' AND '2025-02-26'
        --AND codautora IN ('LM', 'MM')
        --AND codlibro IN ('CH', 'CL')
        --AND codposteador IN ('BM', 'AL')
        -- AND codescena IN ('CHS05v1a', 'CL18b')
        AND tippublicacion IN ('a', 'c')
        AND nbrcuentatiktok IN ('bethanysweetchapters', 'loreleilovechapters')
        -- AND codpublicacion IN ('7470977021099740446', '7470225104446737695')
        -- AND codregionposteo IN ('US')
    GROUP BY codpublicacion
) base
ON mp.codpublicacion = base.codpublicacion 
AND mp.fecreacionregistro = base.max_fecreacionregistro
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
    mp.numviews BETWEEN 0 AND 1000
    --AND mp.numengagement BETWEEN 0 AND 1000;

select 
                mp.codpublicacion AS "Post Code",
                mp.codautora AS "Author Code",
                COALESCE(a.nbautora, 'Not found: N/A') || ' ' || COALESCE(a.apeautora, '') AS "Author name",
                mp.codlibro AS "Book Code",
                COALESCE(lb.deslibro, 'Not found: N/A') AS "Book name",
                mp.numescena AS "Number of Scene",
                mp.codescena AS "Scene Code",
                COALESCE(esc.desscena, 'Not found: N/A') AS "Scene name",
                mp.tippublicacion AS "Code Post Type",
                COALESCE(tp.despost, 'Not found: N/A') AS "Post Type",
                mp.codposteador AS "PA Code",
                COALESCE(po.nbposteador, 'Not found: N/A') || ' ' || COALESCE(po.apepatposteador, '') || ' ' || COALESCE(po.apematposteador, '') AS "PA name",
                mp.fecpublicacion AS "Date posted",
                mp.horapublicacion AS "Time posted",
                mp.nbrcuentatiktok AS "TikTok Username",
                mp.urlpublicacion AS "Post URL",
                mp.numviews AS "Views",
                mp.numlikes AS "Likes",
                mp.numcomments AS "Comments",
                mp.numreposts AS "Reposted",
                mp.numsaves AS "Saves",
                mp.numengagement AS "Engagement rate",
                mp.numinteractions AS "Interactions",
                mp.deshashtags AS "Hashtags",
                mp.nrohashtag AS "Number of Hashtags",
                mp.urlsounds AS "Sound URL",
                mp.codregionposteo AS "Region Code",
                mp.fecreacionregistro AS "Tracking date",
                mp.horacreacionregistro AS "Tracking time"
from
h_metricapublicacion mp inner join ( 
    SELECT mpint.codpublicacion, max(mpint.fecreacionregistro+mpint.horacreacionregistro) as max_fecreacionregistro
    from h_metricapublicacion mpint
    WHERE
        mpint.fecpublicacion BETWEEN '2025-03-16' and '2025-03-22' AND 
        mpint.nbrcuentatiktok in ('bethanysweetchapters','loreleilovechapters')
    GROUP BY
        mpint.codpublicacion ) base
on mp.codpublicacion = base.codpublicacion and (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro
left join m_autora a on mp.codautora = a.codautora
left join m_escenalibro esc on mp.codescena = esc.codescena
left join m_libro lb on mp.codlibro = lb.codlibro
left join m_tipopost tp on mp.tippublicacion = tp.tippublicacion
left join m_posteadorasistente po on mp.codposteador = po.codposteador
select 
mp.codpublicacion,
mp.codautora,
COALESCE(a.nbautora, '') || ' ' || COALESCE(a.apeautora, '') as Autora,
mp.codescena,
esc.desscena,
mp.codlibro,
lb.deslibro,
mp.numescena,
mp.tippublicacion,
tp.despost,
mp.codposteador,
COALESCE(po.nbposteador, '') || ' ' || COALESCE(po.apepatposteador, '') || ' ' || COALESCE(po.apematposteador, '') as Posteador,
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
from
h_metricapublicacion mp inner join
( SELECT
mpint.codpublicacion, max(mpint.fecreacionregistro+mpint.horacreacionregistro) as max_fecreacionregistro
from
h_metricapublicacion mpint
WHERE
mpint .fecpublicacion BETWEEN '2025-01-01' and '2025-03-01' AND
mpint.fecreacionregistro BETWEEN '2025-02-01' and '2025-03-01' AND
mpint.codautora in ('LM','MM') AND
mpint .codlibro in ('CH','CL') AND
mpint.codposteador in ('BM','AL') AND
mpint.codescena in ('CHS05v1a','CL18b') AND
mpint.tippublicacion in('a','c') AND
mpint.nbrcuentatiktok in ('bethanysweetchapters','loreleilovechapters') AND
mpint.codpublicacion in ('7470977021099740446','7470225104446737695') AND
mpint .codregionposteo in ('US')
GROUP BY
mpint .codpublicacion ) base
on mp.codpublicacion = base.codpublicacion and (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro
left join m_autora a on mp.codautora = a.codautora
left join m_escenalibro esc on mp.codescena = esc.codescena
left join m_libro lb on mp.codlibro = lb.codlibro
left join m_tipopost tp on mp.tippublicacion = tp.tippublicacion
left join m_posteadorasistente po on mp.codposteador = po.codposteador
where
mp.numlikes BETWEEN 0 and 1000 AND
mp.numinteractions BETWEEN 0 and 1000 AND
mp.numreposts BETWEEN 0 and 1000 AND
mp.numsaves BETWEEN 0 and 1000 AND
mp.numviews BETWEEN 0 and 1000 AND
mp.numengagement BETWEEN 0 and 1000

SELECT
T.codautora, T.nbrAutora,
R.SumNumviews,R.fecpublicacion
FROM
(
	SELECT au.codautora,
	COALESCE(au.nbautora, '') || ' ' || COALESCE(au.apeautora, '') as nbrAutora
	FROM m_autora au 
	WHERE
	au.codautora in ('LM','MK')
) T
LEFT JOIN
(
	select A.codautora, count(A.codpublicacion) ctdPublicaciones,
			SUM(A.numviews) as SumNumviews, A.fecpublicacion
	FROM
		(
		select 
		mp.codpublicacion, mp.codautora, mp.fecpublicacion, mp.horapublicacion,
		mp.numviews
		from
		h_metricapublicacion mp inner join
		( 	SELECT
				mpint.codpublicacion, max(mpint.fecreacionregistro+mpint.horacreacionregistro) as max_fecreacionregistro
			from
				h_metricapublicacion mpint
			WHERE
				mpint.fecpublicacion BETWEEN '2025-03-01' and '2025-03-15' AND
				mpint.codautora in ('LM','MK')
			GROUP BY
				mpint.codpublicacion ) base
		on mp.codpublicacion = base.codpublicacion and (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro
		where mp.numviews >= 100
		) A
	GROUP BY 
	A.fecpublicacion, A.codautora
) R
ON T.codautora = R.codautora



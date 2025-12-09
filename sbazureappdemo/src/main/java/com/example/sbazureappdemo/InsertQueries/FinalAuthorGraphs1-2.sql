
SELECT
T.codautora, T.nbrAutora,
R.promNumviews, R.promNumlikes, R.promNumsaves, 
R.promNumreposts, R.promNumcomments, R.promNumengagement, R.promInteraction
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
			ROUND(avg(A.numviews),2) as promNumviews, ROUND(avg(A.numlikes),2) as promNumlikes, ROUND(avg(A.numsaves),2) as promNumsaves, 
			ROUND(avg(A.numreposts),2) as promNumreposts, ROUND(avg(A.numcomments),2) as promNumcomments,
			ROUND(avg(A.numengagement),2) as promNumengagement, ROUND(avg(a.numinteractions),2) as promInteraction
	FROM
		(
		select 
		mp.codpublicacion, mp.codautora, mp.fecpublicacion, mp.horapublicacion,
		mp.numviews, mp.numlikes, mp.numsaves, mp.numreposts, mp.numcomments, mp.numengagement, mp.numinteractions
		from
		h_metricapublicacion mp inner join
		( 	SELECT
				mpint.codpublicacion, max(mpint.fecreacionregistro+mpint.horacreacionregistro) as max_fecreacionregistro
			from
				h_metricapublicacion mpint
			WHERE
				mpint.fecpublicacion BETWEEN '2025-01-01' and '2025-03-12' AND
				mpint.codautora in ('LM','MK')
			GROUP BY
				mpint.codpublicacion ) base
		on mp.codpublicacion = base.codpublicacion and (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro
		where mp.numviews >= 100
		) A
	GROUP BY 
	A.codautora
) R
ON T.codautora = R.codautora



SELECT
T.codautora, T.nbrAutora,T.codlibro,T.deslibro,
R.promNumviews, R.promNumlikes, R.promNumsaves, 
R.promNumreposts, R.promNumcomments, R.promNumengagement, R.promInteraction
FROM
(   
    SELECT met.codautora, met.codlibro, COALESCE(au.nbautora, 'Not Found: N/A') || ' ' || COALESCE(au.apeautora, '') as nbrAutora, lib.deslibro
    FROM h_metricapublicacion met
    INNER JOIN public.m_libro lib ON met.codlibro = lib.codlibro
    INNER JOIN public.m_autora au ON met.codautora = au.codautora
    WHERE au.codautora in ('LM','KK')
) T

LEFT JOIN
(
	select A.codautora, 
            count(A.codpublicacion) AS ctdPublicaciones, 
			ROUND(avg(a.numviews),2) as promNumviews, ROUND(avg(a.numlikes),2) as promNumlikes, ROUND(avg(a.numsaves),2) as promNumsaves, 
			ROUND(avg(a.numreposts),2) as promNumreposts, ROUND(avg(a.numcomments),2) as promNumcomments,
			ROUND(avg(a.numengagement),2) as promNumengagement,
            ROUND(avg(a.numinteractions),2) as promInteraction
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
				mpint.codautora in ('LM','SS')
            
			GROUP BY
				mpint.codpublicacion ) base
		on mp.codpublicacion = base.codpublicacion and (mp.fecreacionregistro+mp.horacreacionregistro) = base.max_fecreacionregistro		
		) A
	GROUP BY 
	A.codautora
) R
ON T.codautora = R.codautora
package com.example.sbazureappdemo.AUTHORGRAPHS.dto;

import lombok.Data;

@Data
public class EfectividadAutorMetaDTO {
    private String codautora;     // Código de la autora (ej. "JE", "NJ")
    private String nbautora;      // Nombre de la autora (ej. "Jade R.", "N.J.")
    private String codmes;        // Mes en formato 'Mon-YY' (ej. "Apr-25")
    private Integer numposteometa;  // Meta de publicaciones (ej. 100)
    private Integer numposteoreal;  // Número real de publicaciones alcanzadas
    private Double eficacia;        // Porcentaje de eficacia (ej. 18.00, 252.00)
}
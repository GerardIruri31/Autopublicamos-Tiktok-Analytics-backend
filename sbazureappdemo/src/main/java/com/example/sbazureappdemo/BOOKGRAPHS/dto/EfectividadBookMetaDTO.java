package com.example.sbazureappdemo.BOOKGRAPHS.dto;

import lombok.Data;

@Data
public class EfectividadBookMetaDTO {
    private String codlibro;     // Código de la autora (ej. "JE", "NJ")
    private String deslibro;      // Nombre de la autora (ej. "Jade R.", "N.J.")
    private String codmes;        // Mes en formato 'Mon-YY' (ej. "Apr-25")
    private Integer numposteometa;  // Meta de publicaciones (ej. 100)
    private Integer numposteoreal;  // Número real de publicaciones alcanzadas
    private Double eficacia;        // Porcentaje de eficacia (ej. 18.00, 252.00)
}
package com.example.sbazureappdemo.BOOKGRAPHS.dto;

import lombok.Data;

@Data
public class RegistroMesLibroDTO {
    private String mes;
    private String codlibro;
    private String deslibro;
    private Double promNumviews;
    private Double promInteraction;
    private Double promNumengagement;
}

package com.example.sbazureappdemo.AUTHORGRAPHS.dto;

import lombok.Data;

@Data
public class RegistroMesAutoraDTO {
    private String mes;
    private String codautora;
    private String nbrAutora;
    private Double promNumviews;
    private Double promInteraction;
    private Double promNumengagement;
}

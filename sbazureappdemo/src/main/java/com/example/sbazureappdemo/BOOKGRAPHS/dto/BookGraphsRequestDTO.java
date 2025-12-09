package com.example.sbazureappdemo.BOOKGRAPHS.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookGraphsRequestDTO {
    @JsonProperty("dateFrom")
    private String startDate;
    @JsonProperty("dateTo")
    private String finishDate;
    @JsonProperty("Author")
    private List<String> BookList;

}

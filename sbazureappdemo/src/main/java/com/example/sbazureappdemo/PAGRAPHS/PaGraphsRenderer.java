package com.example.sbazureappdemo.PAGRAPHS;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PaGraphsRenderer {
    @JsonProperty("dateFrom")
    private String startDate;
    @JsonProperty("dateTo")
    private String finishDate;
    @JsonProperty("Publisher")
    private List<String> PAList;    

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getFinishDate() {
        return finishDate;
    }

    public void setFinishDate(String finishDate) {
        this.finishDate = finishDate;
    }

    public List<String> getPAList() {
        return PAList;
    }

    public void setPAList(List<String> PAList) {
        this.PAList = PAList;
    }
}

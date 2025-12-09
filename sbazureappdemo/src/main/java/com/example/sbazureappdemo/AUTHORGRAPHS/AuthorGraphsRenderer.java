package com.example.sbazureappdemo.AUTHORGRAPHS;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthorGraphsRenderer {
    @JsonProperty("dateFrom")
    private String startDate;
    @JsonProperty("dateTo")
    private String finishDate;
    @JsonProperty("Author")
    private List<String> AuthorList;    
     

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

    public List<String> getAuthorList() {
        return AuthorList;
    }

    public void setAuthorList(List<String> AuthorList) {
        this.AuthorList = AuthorList;
    }
    
   

}

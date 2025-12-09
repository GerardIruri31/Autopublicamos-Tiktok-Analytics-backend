package com.example.sbazureappdemo.APICALL;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ExcelFiltrosRequest {
    @JsonProperty("StartDate")
    private String startDate;
    @JsonProperty("FinishDate")
    private String finishDate;
    @JsonProperty("AccountList")
    private List<String> accountList;
    @JsonProperty("NotFoundAccountList")
    private List<String> NotFoundUsername;
    

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

    public List<String> getAccountList() {
        return accountList;
    }

    public void setAccountList(List<String> accountList) {
        this.accountList = accountList;
    }

    public List<String> getNotFoundUsername() {
        return NotFoundUsername;
    }

    public void setNotFoundUsername(List<String> NotFoundUsername) {
        this.NotFoundUsername = NotFoundUsername;
    }


    
}

package com.example.sbazureappdemo.APICALL;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class FiltrosRequest {
    @JsonProperty("StartDate")
    private String startDate;
    @JsonProperty("FinishDate")
    private String finishDate;
    @JsonProperty("AccountList")
    private List<String> accountList;
    //@JsonProperty("UserRol")
    //private String UserRol;
    @JsonProperty("UserId")
    private String UserId;


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

    {/*public String getUserRol() {
        return UserRol;
    }

    public void setUserRol(string UserRol) {
        this.UserRol = UserRol;
    }
    */}



    public String getUserId() {
        return UserId;
    }

    public void setUserId(String UserId) {
        this.UserId = UserId;
    }

    
}  

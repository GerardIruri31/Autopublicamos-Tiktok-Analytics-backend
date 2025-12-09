package com.example.sbazureappdemo.DBQUERY;
import java.util.Collections;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
public class FiltrosRequestDB {

    @JsonProperty("PubStartDate")
    private String PubStartDate;
    @JsonProperty("PubFinishtDate")
    private String PubFinishtDate;
    @JsonProperty("TrackStartDate")
    private String TrackStartDate;
    @JsonProperty("TrackFinishtDate")
    private String TrackFinishtDate;
    @JsonProperty("AuthorList")
    private List<String> AuthorList;
    @JsonProperty("BookList")
    private List<String> BookList;
    @JsonProperty("PAList")
    private List<String> PAList;
    @JsonProperty("SceneList")
    private List<String> SceneList;
    @JsonProperty("typePostList")
    private List<String> typePostList;
    @JsonProperty("AccountList")
    private List<String> accountList;
    @JsonProperty("PostIDList")
    private List<String> PostIDList;
    @JsonProperty("RegionList")
    private List<String> RegionList;
    @JsonProperty("viewsMin")
    private String viewsMin;
    @JsonProperty("viewsMax")
    private String viewsMax;
    @JsonProperty("likesMin")
    private String likesMin;
    @JsonProperty("likesMax")
    private String likesMax;
    @JsonProperty("savesMin")
    private String savesMin;
    @JsonProperty("savesMax")
    private String savesMax;
    @JsonProperty("EngagementMin")
    private String EngagementMin;
    @JsonProperty("EngagementMax")
    private String EngagementMax;
    @JsonProperty("InteractionMin")
    private String InteractionMin;
    @JsonProperty("InteractionMax")
    private String InteractionMax;


    public String getPubStartDate() {
        return PubStartDate;
    }

    public void setPubStartDate(String pubStartDate) {
        this.PubStartDate = pubStartDate;
    }

    public String getPubFinishtDate() {
        return PubFinishtDate;
    }

    public void setPubFinishtDate(String pubFinishtDate) {
        this.PubFinishtDate = pubFinishtDate;
    }

    public String getTrackStartDate() {
        return TrackStartDate;
    }

    public void setTrackStartDate(String trackStartDate) {
        this.TrackStartDate = trackStartDate;
    }

    public String getTrackFinishtDate() {
        return TrackFinishtDate;
    }

    public void setTrackFinishtDate(String trackFinishtDate) {
        this.TrackFinishtDate = trackFinishtDate;
    }

    public List<String> getAuthorList() {
        return AuthorList != null ? AuthorList : Collections.emptyList();
    }

    public void setAuthorList(List<String> authorList) {
        this.AuthorList = authorList;
    }

    public List<String> getBookList() {
        return BookList != null ? BookList : Collections.emptyList();
    }

    public void setBookList(List<String> bookList) {
        this.BookList = bookList;
    }

    public List<String> getPAList() {
        return PAList != null ? PAList : Collections.emptyList();
    }

    public void setPAList(List<String> PAList) {
        this.PAList = PAList;
    }

    public List<String> getSceneList() {
        return SceneList != null ? SceneList : Collections.emptyList();
    }

    public void setSceneList(List<String> sceneList) {
        this.SceneList = sceneList;
    }

    public List<String> getTypePostList() {
        return typePostList != null ? typePostList : Collections.emptyList();
    }

    public void setTypePostList(List<String> typePostList) {
        this.typePostList = typePostList;
    }

    public List<String> getAccountList() {
        return accountList != null ? accountList : Collections.emptyList();
    }

    public void setAccountList(List<String> accountList) {
        this.accountList = accountList;
    }

    public List<String> getPostIDList() {
        return PostIDList != null ? PostIDList : Collections.emptyList();
    }

    public void setPostIDList(List<String> postIDList) {
        this.PostIDList = postIDList;
    }

    public List<String> getRegionList() {
        return RegionList != null ? RegionList : Collections.emptyList();
    }

    public void setRegionList(List<String> regionList) {
        this.RegionList = regionList;
    }

    public String getViewsMin() {
        return viewsMin;
    }

    public void setViewsMin(String viewsMin) {
        this.viewsMin = viewsMin;
    }

    public String getViewsMax() {
        return viewsMax;
    }

    public void setViewsMax(String viewsMax) {
        this.viewsMax = viewsMax;
    }

    public String getLikesMin() {
        return likesMin;
    }

    public void setLikesMin(String likesMin) {
        this.likesMin = likesMin;
    }

    public String getLikesMax() {
        return likesMax;
    }

    public void setLikesMax(String likesMax) {
        this.likesMax = likesMax;
    }

    public String getSavesMin() {
        return savesMin;
    }

    public void setSavesMin(String savesMin) {
        this.savesMin = savesMin;
    }

    public String getSavesMax() {
        return savesMax;
    }

    public void setSavesMax(String savesMax) {
        this.savesMax = savesMax;
    }

    public String getEngagementMin() {
        return EngagementMin;
    }

    public void setEngagementMin(String EngagementMin) {
        this.EngagementMin = EngagementMin;
    }

    public String getEngagementMax() {
        return EngagementMax;
    }

    public void setEngagementMax(String EngagementMax) {
        this.EngagementMax = EngagementMax;
    }

    public String getInteractionMin() {
        return InteractionMin;
    }

    public void setInteractionMin(String InteractionMin) {
        this.InteractionMin = InteractionMin;
    }

    public String getInteractionMax() {
        return InteractionMax;
    }

    public void setInteractionMax(String InteractionMax) {
        this.InteractionMax = InteractionMax;
    }
}

package com.example.sbazureappdemo.model;
import org.springframework.stereotype.Component;
import java.text.SimpleDateFormat;
import org.springframework.context.annotation.Scope;
import java.text.ParseException;
import java.sql.Date;
import java.sql.Time;

// Esta clase es un componente de Spring con un alcance de prototipo, lo que significa que cada vez que se inyecta, se crea una nueva instancia.
@Component
@Scope("prototype")
public class TiktokMetricas {
    private String codpublicacion;
    private String codautora;
    private String codescena;
    private String codlibro;
    private String numescena;
    private String tippublicacion;
    private String codposteador;
    private String fecpublicacion;
    private String horapublicacion;
    private String nbrcuentatiktok;
    private String urlpublicacion;
    private int numviews;
    private int numlikes;
    private int numsaves;
    private int numreposts;
    private int numcomments;
    private double numengagement;
    private int numinteractions;
    private String deshashtags;
    private int nrohashtag;
    private String urlsounds;
    private String codregionposteo;
    private String fecreacionregistro;
    private String horacreacionregistro;
    private String UserIdentification;


    // Getters y Setters
    public String getCodpublicacion() { return codpublicacion; }
    public void setCodpublicacion(String codpublicacion) { this.codpublicacion = codpublicacion; }

    public String getCodautora() { return codautora; }
    public void setCodautora(String codautora) { this.codautora = codautora; }

    public String getCodescena() { return codescena; }
    public void setCodescena(String codescena) { this.codescena = codescena; }

    public String getCodlibro() { return codlibro; }
    public void setCodlibro(String codlibro) { this.codlibro = codlibro; }

    public String getNumescena() { return numescena; }
    public void setNumescena(String numescena) { this.numescena = numescena; }

    public String getTippublicacion() { return tippublicacion; }
    public void setTippublicacion(String tippublicacion) { this.tippublicacion = tippublicacion; }

    public String getCodposteador() { return codposteador; }
    public void setCodposteador(String codposteador) { this.codposteador = codposteador; }

    public Date getFecpublicacionAsDate() {
    try {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        java.util.Date utilDate = formatter.parse(this.fecpublicacion);
        return new Date(utilDate.getTime());  // Convertimos a java.sql.Date
    } catch (ParseException e) {
        e.printStackTrace();
        return null;  // Retorna null si hay un error en la conversión
    }}
    public void setFecpublicacion(String fecpublicacion) { this.fecpublicacion = fecpublicacion; }

    public Time getHorapublicacionAsTime() {
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("HH:mm:ss");
            java.util.Date utilDate = formatter.parse(this.horapublicacion);
            return new Time(utilDate.getTime());  // Convertimos a java.sql.Time
        } catch (ParseException e) {
            e.printStackTrace();
            return null;  // Retorna null si hay un error en la conversión
        }
    }
    public void setHorapublicacion(String horapublicacion) { this.horapublicacion = horapublicacion; }

    public String getNbrcuentatiktok() { return nbrcuentatiktok; }
    public void setNbrcuentatiktok(String nbrcuentatiktok) { this.nbrcuentatiktok = nbrcuentatiktok; }

    public String getUrlpublicacion() { return urlpublicacion; }
    public void setUrlpublicacion(String urlpublicacion) { this.urlpublicacion = urlpublicacion; }

    public int getNumviews() { return numviews; }
    public void setNumviews(int numviews) { this.numviews = numviews; }

    public int getNumlikes() { return numlikes; }
    public void setNumlikes(int numlikes) { this.numlikes = numlikes; }

    public int getNumsaves() { return numsaves; }
    public void setNumsaves(int numsaves) { this.numsaves = numsaves; }

    public int getNumreposts() { return numreposts; }
    public void setNumreposts(int numreposts) { this.numreposts = numreposts; }

    public int getNumcomments() { return numcomments; }
    public void setNumcomments(int numcomments) { this.numcomments = numcomments; }

    public double getNumengagement() { return numengagement; }
    public void setNumengagement(double numengagement) { this.numengagement = numengagement; }

    public int getNuminteractions() { return numinteractions; }
    public void setNuminteractions(int numinteractions) { this.numinteractions = numinteractions; }

    public String getDeshashtags() { return deshashtags; }
    public void setDeshashtags(String deshashtags) { this.deshashtags = deshashtags; }

    public int getNrohashtag() { return nrohashtag; }
    public void setNrohashtag(int nrohashtag) { this.nrohashtag = nrohashtag; }

    public String getUrlsounds() { return urlsounds; }
    public void setUrlsounds(String urlsounds) { this.urlsounds = urlsounds; }

    public String getCodregionposteo() { return codregionposteo; }
    public void setCodregionposteo(String codregionposteo) { this.codregionposteo = codregionposteo; }

    public Date getFecreacionregistroAsDate() {
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date utilDate = formatter.parse(this.fecreacionregistro);
            return new Date(utilDate.getTime());  // Convertimos a java.sql.Date
        } catch (ParseException e) {
            e.printStackTrace();
            return null;  // Retorna null si hay un error en la conversión
        }
    }
    public void setFecreacionregistro(String fecreacionregistro) { this.fecreacionregistro = fecreacionregistro; }


    public Time getHoracreacionregistroAsTime() {
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("HH:mm:ss");
            java.util.Date utilDate = formatter.parse(this.horacreacionregistro);
            return new Time(utilDate.getTime());  // Convertimos a java.sql.Time
        } catch (ParseException e) {
            e.printStackTrace();
            return null;  // Retorna null si hay un error en la conversión
        }
    }
    public void setHoracreacionregistro(String horacreacionregistro) { this.horacreacionregistro = horacreacionregistro; }


    public String getUserIdentification() { return UserIdentification; }
    public void setUserIdentification(String UserIdentification) { this.UserIdentification = UserIdentification; }
}

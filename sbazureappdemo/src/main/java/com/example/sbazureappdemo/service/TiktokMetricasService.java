package com.example.sbazureappdemo.service;
import com.example.sbazureappdemo.AUTHORGRAPHS.AuthorGraphsRenderer;
import com.example.sbazureappdemo.AUTHORGRAPHS.dto.EfectividadAutorMetaDTO;
import com.example.sbazureappdemo.AUTHORGRAPHS.dto.RegistroMesAutoraDTO;
import com.example.sbazureappdemo.BOOKGRAPHS.dto.BookGraphsRequestDTO;
import com.example.sbazureappdemo.BOOKGRAPHS.dto.EfectividadBookMetaDTO;
import com.example.sbazureappdemo.BOOKGRAPHS.dto.RegistroMesLibroDTO;
import com.example.sbazureappdemo.DBQUERY.FiltrosRequestDB;
import com.example.sbazureappdemo.PAGRAPHS.PaGraphsRenderer;
import com.example.sbazureappdemo.model.TiktokMetricas;
import com.example.sbazureappdemo.repo.TiktokMetricasRepo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.*;

// Contiene reglas de procesamiento de datos
@Service
public class TiktokMetricasService {
    Logger logger = LoggerFactory.getLogger(TiktokMetricasService.class);

    // Repositorio que gestiona la interacción con la base de datos
    private TiktokMetricasRepo repo;
    // Constructor que inyecta el repositorio de métricas de TikTok. Se usa la anotación `@Autowired` para permitir la inyección de dependencias por constructor. Automáticamente por Spring
    @Autowired
    public TiktokMetricasService(TiktokMetricasRepo repo) {
        this.repo = repo;
    }
    public TiktokMetricasRepo getRepo() {
        return repo;
    }
    
    // Guarda una lista de registros de métricas de TikTok en la base de datos.
    // Utiliza el metodo `saveAll` del "repo" para insertar múltiples registros de manera eficiente.
    public void saveRegistries(List<TiktokMetricas> registros) {
        repo.saveAll(registros);
    }

    public List<Map<String,Object>> filterRegistries(FiltrosRequestDB request) {
        logger.info("Iniciando obtención de datos filtrados de la base de datos.");
        List<Map<String,Object>> output = repo.FilterConnection(request);
        //logger.info("Datos obtenidos de la BD (DBQuery, filters): " + output);
        logger.info("Datos obtenidos de la BD correctamente.");

        return output;
    }

    public List<Map<String,Object>> showDBRecords(Object tableName) {
        logger.info("Iniciando obtención de datos para la base de datos.");
        List<Map<String,Object>> output = repo.showDBRecordsConnection(tableName);
        //logger.info("Datos obtenidos de la BD (DataMaintenance, showTableRecord): " + output);
        logger.info("Datos obtenidos de la BD correctamente.");
        return output;
    }

    public Map<String,Object> uploadRecordsExcelFile(Map<String,Object> response,String userId) {
        return repo.uploadRecordsExcelFileConnection(response,userId);
    }


    public List<Map<String,Object>> GetDatosPaGraphs(PaGraphsRenderer filtros) {
        logger.info("Inicio del proceso de recolección de datos de PA's a la BD");
        return repo.GetDatosPaGraphConnectionDB(filtros);
    }

    /*public List<List<Map<String,Object>>> GetDatosAuthorGraphs(AuthorGraphsRenderer filtros) {
        List<List<Map<String,Object>>> matchRequest = new ArrayList<>();
        List<Map<String,Object>> query1 = repo.GetDatosAuthorGraphsConnectionDBQuery1(filtros);
        List<Map<String,Object>> query2 = repo.GetDatosAuthorGraphsConnectionDBQuery2(filtros);
        matchRequest.add(query1);
        matchRequest.add(query2);
        return matchRequest;
    }*/



    public CompletableFuture<List<List<Map<String, Object>>>> GetDatosAuthorGraphs(AuthorGraphsRenderer filtros) {
        logger.info("Inicio del proceso de recolección de datos de autoras a la BD");
    CompletableFuture<List<Map<String, Object>>> futureQuery1 = CompletableFuture.supplyAsync(() -> 
        repo.GetDatosAuthorGraphsConnectionDBQuery1(filtros)).exceptionally(ex -> {
            logger.error("Error en query1: " + ex.getMessage());
            return new ArrayList<>(); // Retorna lista vacía si falla query1
        });

    CompletableFuture<List<Map<String, Object>>> futureQuery2 = CompletableFuture.supplyAsync(() -> 
        repo.GetDatosAuthorGraphsConnectionDBQuery2(filtros)).exceptionally(ex -> {
            logger.error("Error en query2: " + ex.getMessage());
            return new ArrayList<>(); // Retorna lista vacía si falla query2
        });
    
    logger.info("Datos obtenidos de las 2 queries completadas con éxito");
    return CompletableFuture.allOf(futureQuery1, futureQuery2)
        .thenApply(ignored -> Arrays.asList(futureQuery1.join(), futureQuery2.join()));
}

    public List<Map<String,Object>> getLastProcessedDataFromApify(String startDate, String finishDate, List<String> accountList) {
        logger.info("Inicio del proceso de recolección de datos para descargar excel backup");
        return repo.getLastProcessedDataFromApifyConnection(startDate,finishDate, accountList);
    }



    public List<Map<String,Object>> getDbSceneScore(FiltrosRequestDB request) {
        logger.info("Inicio del proceso DB Query Score Scene");
        return repo.scoreSceneConnectionV2(request);
    }


    public List<Map<String,Object>> getDbReporteConciso(FiltrosRequestDB request) {
        logger.info("Inicio del proceso DB Query Reporte Conciso");
        return repo.reporteConcisoConnectionV2(request);
    }


    public List<RegistroMesAutoraDTO> authorsPerMonth(AuthorGraphsRenderer filtros) {
        logger.info("Inicio del proceso data authors per month");
        return repo.dataAuthorsPerMonth(filtros);
    }

    // SERVICIO PARA ENDPOINT EFECTIVIDAD POR AUTHOR POR MES
    public List<EfectividadAutorMetaDTO> effectAuthorsPerMonth(AuthorGraphsRenderer filtros) {
        logger.info("Inicio del proceso efectividad authors per month");
        return repo.effectDataAuthorsPerMonth(filtros);
    }

    public List<RegistroMesLibroDTO> booksPerMonth(BookGraphsRequestDTO filtros) {
        logger.info("Inicio del proceso data books per month");
        return repo.dataBooksPerMonth(filtros);
    }

    public List<EfectividadBookMetaDTO> effectBooksPerMonth(BookGraphsRequestDTO filtros) {
        logger.info("Inicio del proceso efectividad books per month");
        return repo.effectivenessBooksPerMonth(filtros);
    }




}

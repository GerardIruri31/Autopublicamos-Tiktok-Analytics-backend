package com.example.sbazureappdemo.DBQUERY;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;


import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

//Indica que esta clase maneja solicitudes HTTP y devuelve datos en formato JSON.
@RestController
// Define la ruta base "/api" para todos los endpoints dentro de este controlador.
@RequestMapping("/databasequery")
// Permite que cualquier dominio (puertos) acceda a este controlador (útil para evitar problemas de CORS)
@CrossOrigin(origins = "*")
//@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})


public class DatabaseQueryController {
    // @Autowired permite que Spring inyecte automáticamente una instancia de DinamicFilterRenderer en JsonProcessorController
    // Constructor con inyección de dependencia de DinamicFilterRenderer.
    Logger logger = LoggerFactory.getLogger(DatabaseQueryController.class);
    private final DbQueryRenderer dbQueryRenderer;
    @Autowired
    public DatabaseQueryController(DbQueryRenderer dbQueryRenderer) {
        this.dbQueryRenderer = dbQueryRenderer;
    }

    // Define endpoint para recibir filtros desde el frontend y devolver datos procesados.    
    @PostMapping("/filter")

    //  Recibe un objeto JSON del body de la solicitud POST HTTP (filtros de fecha y lista de cuentas)
    // Lo establece en la clase FiltrosRequest con instancia "request"
    public List<Map<String, Object>> filtrarDatos(@RequestBody Map<String,Object> filtros) {
        try {
            FiltrosRequestDB request = mapToFiltrosRequest(filtros);
            logger.info("📥 Datos recibidos en el backend DB QUERY: " + filtros);
            return dbQueryRenderer.filtrarDatos(request);
        } catch (Exception e) {
            logger.error("Error al filtrar datos",e);
            return List.of();
        }
    }

    @PostMapping("/scorescene")
    public ResponseEntity<?> getScoreScene(@RequestBody Map<String,Object> filtros) {
        try {
            FiltrosRequestDB request = mapToFiltrosRequest(filtros);
            logger.info("📥 Datos recibidos en el backend SCORE SCENES: " + filtros);
            // Devuelve List<Map<String, Object>>
            return ResponseEntity.ok(dbQueryRenderer.scoreScenesService(request));
        } catch (SQLException e) {
            logger.error("Error SQL Exception: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error Interno Score Scenes: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error al filtrar datos SCORE SCENES: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error Interno Score Scenes: " + e.getMessage());
        }
    }


    @PostMapping("/conciso")
    public ResponseEntity<?> getReporteConciso(@RequestBody Map<String,Object> filtros) {
        try {
            FiltrosRequestDB request = mapToFiltrosRequest(filtros);
            logger.info("📥 Datos recibidos en el backend SHORT CONCISO: " + filtros);
            // Devuelve List<Map<String, Object>>
            return ResponseEntity.ok(dbQueryRenderer.reporteConcisoService(request));
        } catch (SQLException e) {
            logger.error("Error SQL Exception: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error Interno Reporte Conciso: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error al filtrar datos Reporte Conciso: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error Interno Reporte Conciso: " + e.getMessage());
        }
    }







    private FiltrosRequestDB mapToFiltrosRequest(Map<String, Object> filtros) {
        FiltrosRequestDB request = new FiltrosRequestDB();
        request.setPubStartDate((String) filtros.getOrDefault("PubStartDate", ""));
        request.setPubFinishtDate((String) filtros.getOrDefault("PubFinishtDate", ""));
        request.setTrackStartDate((String) filtros.getOrDefault("TrackStartDate", ""));
        request.setTrackFinishtDate((String) filtros.getOrDefault("TrackFinishtDate", ""));
        request.setAuthorList(getListFromMap(filtros, "AuthorList"));;
        request.setBookList(getListFromMap(filtros, "BookList"));
        request.setPAList(getListFromMap(filtros, "PAList"));
        request.setSceneList(getListFromMap(filtros, "SceneList"));
        request.setTypePostList(getListFromMap(filtros, "typePostList"));
        request.setAccountList(getListFromMap(filtros, "AccountList"));
        request.setPostIDList(getListFromMap(filtros, "PostIDList"));
        request.setRegionList(getListFromMap(filtros, "RegionList"));
        request.setViewsMin((String) filtros.getOrDefault("viewsMin", ""));
        request.setViewsMax((String) filtros.getOrDefault("viewsMax", ""));
        request.setLikesMin((String) filtros.getOrDefault("likesMin", ""));
        request.setLikesMax((String) filtros.getOrDefault("likesMax", ""));
        request.setSavesMin((String) filtros.getOrDefault("savesMin", ""));
        request.setSavesMax((String) filtros.getOrDefault("savesMax", ""));
        request.setEngagementMin((String) filtros.getOrDefault("EngagementMin", ""));
        request.setEngagementMax((String) filtros.getOrDefault("EngagementMax", ""));
        request.setInteractionMin((String) filtros.getOrDefault("InteractionMin", ""));
        request.setInteractionMax((String) filtros.getOrDefault("InteractionMax", ""));
        return request;
    }

    private List<String> getListFromMap(Map<String, Object> filtros, String key) {
        return (filtros.get(key) instanceof List<?> list) 
        ? list.stream().filter(String.class::isInstance).map(String.class::cast).toList()
        : List.of();
    }

}
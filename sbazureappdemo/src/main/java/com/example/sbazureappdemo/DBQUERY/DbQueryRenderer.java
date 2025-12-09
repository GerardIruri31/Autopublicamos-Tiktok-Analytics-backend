package com.example.sbazureappdemo.DBQUERY;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.example.sbazureappdemo.service.TiktokMetricasService;
import java.sql.SQLException;


@Component
public class DbQueryRenderer {
    Logger logger = LoggerFactory.getLogger(DbQueryRenderer.class);

    private final TiktokMetricasService tiktokMetricasService; 
    private List<Map<String, Object>> lastProcessedData = new ArrayList<>();
    @Autowired
    public DbQueryRenderer(TiktokMetricasService tiktokMetricasService) {
        this.tiktokMetricasService = tiktokMetricasService;
    }
    public List<Map<String,Object>> filtrarDatos (FiltrosRequestDB request) {  
        lastProcessedData.clear(); // Evita acumulación de datos de ejecuciones anteriores 
        List<Map<String, Object>> resultado = tiktokMetricasService.filterRegistries(request);
        lastProcessedData.addAll(resultado); 
        return lastProcessedData;
    }

    // para usarlo en procesar excel
    public List<Map<String, Object>> getLastProcessedData() {
        if (lastProcessedData.isEmpty()) {
            logger.info("No hay datos procesados aún.");
        }
        return lastProcessedData;
    }


    public List<Map<String, Object>> scoreScenesService(FiltrosRequestDB request) throws SQLException {
        lastProcessedData.clear(); // Evita acumulación de datos de ejecuciones anteriores  
        List<Map<String, Object>> resultado = tiktokMetricasService.getDbSceneScore(request);
        lastProcessedData.addAll(resultado);
        if (lastProcessedData.isEmpty()) {
            logger.info("No hay datos que hagan match con filtros.");
        } 
        return lastProcessedData;
    }




    public List<Map<String, Object>> reporteConcisoService(FiltrosRequestDB request) throws SQLException {
        lastProcessedData.clear();
        List<Map<String, Object>> resultado = tiktokMetricasService.getDbReporteConciso(request);
        lastProcessedData.addAll(resultado);
        if (lastProcessedData.isEmpty()) {
            logger.info("No hay datos que hagan match con filtros.");
        }
        return lastProcessedData;
    }
}

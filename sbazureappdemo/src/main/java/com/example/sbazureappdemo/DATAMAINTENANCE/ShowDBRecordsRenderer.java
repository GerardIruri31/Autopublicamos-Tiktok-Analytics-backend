package com.example.sbazureappdemo.DATAMAINTENANCE;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.example.sbazureappdemo.service.TiktokMetricasService;


@Component
public class ShowDBRecordsRenderer {
    Logger logger = LoggerFactory.getLogger(ShowDBRecordsController.class);
    private final TiktokMetricasService tiktokMetricasService; 
    private List<Map<String, Object>> lastProcessedData = new ArrayList<>();

    @Autowired
    public ShowDBRecordsRenderer(TiktokMetricasService tiktokMetricasService) {
        this.tiktokMetricasService = tiktokMetricasService;
    }
    public List<Map<String,Object>> initializeShowDBRecords (Object tableName) {  
        lastProcessedData.clear(); // Evita acumulación de datos de ejecuciones anteriores       
        lastProcessedData = tiktokMetricasService.showDBRecords(tableName);  
        return lastProcessedData;
        
    }

    // para usarlo en procesar excel
    public List<Map<String, Object>> getLastProcessedData() {
        if (lastProcessedData.isEmpty()) {
            logger.info("No hay datos procesados aún.");
        }
        return lastProcessedData;
    }
}
package com.example.sbazureappdemo.DATAMAINTENANCE;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/datamaintenance")
@CrossOrigin(origins = "*")
public class ShowDBRecordsController {
    Logger logger = LoggerFactory.getLogger(ShowDBRecordsController.class);
    private final ShowDBRecordsRenderer showDBRecordsRenderer;
    @Autowired
    public ShowDBRecordsController(ShowDBRecordsRenderer showDBRecordsRenderer) {
        this.showDBRecordsRenderer = showDBRecordsRenderer;
    }

    @PostMapping("/tablerecords")
    public List<Map<String, Object>> RenderizeDBRecords(@RequestBody Map<String,Object> TableName) {
        try {
            logger.info("📥 Filtros recibidos en el backend: " + TableName);
            return showDBRecordsRenderer.initializeShowDBRecords(TableName.get("TableName"));
        }
        catch (Exception e) {
            logger.error("Error: (DataMaintenance, showTableRecords)", e);
            return List.of();
        }
    }
}

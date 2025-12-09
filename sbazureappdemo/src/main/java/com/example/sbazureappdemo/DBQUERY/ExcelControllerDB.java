package com.example.sbazureappdemo.DBQUERY;
import com.example.sbazureappdemo.service.ExcelService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;


// Controlador REST que maneja solicitudes relacionadas con la generación y descarga de archivos Excel
@RestController
@CrossOrigin(origins = "*")
//@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})

// Define la ruta base "/api/excel" para todos los endpoints de este controlador
@RequestMapping("/databasequery")
public class ExcelControllerDB {
    @Autowired
    private final DbQueryRenderer dbQueryRenderer;
    private final ExcelService excelService;
    Logger logger = LoggerFactory.getLogger(ExcelControllerDB.class);


    public ExcelControllerDB(DbQueryRenderer dbQueryRenderer, ExcelService excelService) {
        this.dbQueryRenderer = dbQueryRenderer;
        this.excelService = excelService;
    }   

    // Endpoint que permite descargar un archivo Excel con las métricas de TikTok
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadExcel() {
        
        List<Map<String, Object>> data = dbQueryRenderer.getLastProcessedData();
        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ No hay datos para exportar a Excel.".getBytes());
        }
        try {
            logger.info("Inicio de la generación del archivo Excel");
            byte[] excelFile = excelService.downloadExcel(data);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "tiktok_metrics.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelFile);
        } catch (IOException e) {
            logger.error("Error al generar el archivo Excel.", e);
            return ResponseEntity.internalServerError().body("❌ Error al generar el archivo Excel.".getBytes());
        }
    }

}

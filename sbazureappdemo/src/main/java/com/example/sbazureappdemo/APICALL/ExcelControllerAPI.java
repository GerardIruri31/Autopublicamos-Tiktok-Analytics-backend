package com.example.sbazureappdemo.APICALL;
//import com.example.sbazureappdemo.model.TiktokMetricas;
import com.example.sbazureappdemo.service.ExcelService;
import com.example.sbazureappdemo.service.TiktokMetricasService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


// Controlador REST que maneja solicitudes relacionadas con la generación y descarga de archivos Excel
@RestController
@CrossOrigin(origins = "*")
//@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})

// Define la ruta base "/api/excel" para todos los endpoints de este controlador
@RequestMapping("/api/excel")
public class ExcelControllerAPI {
    Logger logger = LoggerFactory.getLogger(ExcelControllerAPI.class);

    @Autowired
    private final ExcelService excelService;
    private final TiktokMetricasService tiktokMetricasService;

    public ExcelControllerAPI(TiktokMetricasService tiktokMetricasService, ExcelService excelService) {
        this.tiktokMetricasService = tiktokMetricasService;
        this.excelService = excelService;
    }   

    // Endpoint que permite descargar un archivo Excel con las métricas de TikTok
    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadExcel(@RequestBody ExcelFiltrosRequest request) {
        logger.info("📥 Datos recibidos en el backend:");
        logger.info("StartDate: " + request.getStartDate());
        logger.info("FinishDate: " + request.getFinishDate());
        logger.info("AccountList: " + request.getAccountList());
        logger.info("NotFoundAccountList: " + request.getNotFoundUsername());

        List<Map<String, Object>> data = tiktokMetricasService.getLastProcessedDataFromApify(request.getStartDate(), request.getFinishDate(), request.getAccountList());
        Set<String> campos = new HashSet<>();
        if (!data.isEmpty()) {
            campos.addAll(data.get(0).keySet());
        }

        for (String username : request.getNotFoundUsername()) {
            Map<String, Object> registro = new HashMap<>();
            for (String campo : campos) {
                if (campo.equals("TikTok Username")) {
                    registro.put(campo, username); // ✅ cuenta real
                } else if (campo.equals("Views") || campo.equals("Likes") || campo.equals("Comments") ||
                        campo.equals("Reposted") || campo.equals("Saves") || campo.equals("Engagement rate") ||
                        campo.equals("Interactions") || campo.equals("Number of Hashtags")) {
                    registro.put(campo, 0); // campos numéricos
                } else {
                    registro.put(campo, "Not found: N/A"); // texto por defecto
                }
            }
            data.add(registro);
        }

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ No hay datos para exportar a Excel.".getBytes());
        }
        try {
            logger.info("Inicio de la generación del archivo Excel");
            //System.out.println("Data a exportar: " + data);

            byte[] excelFile = excelService.downloadExcel(data);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "tiktok_metrics.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelFile);
        } catch (IOException e) {
            logger.error("Error al generar el archivo Excel", e);
            return ResponseEntity.internalServerError().body("❌ Error al generar el archivo Excel.".getBytes());
        }
    }

}

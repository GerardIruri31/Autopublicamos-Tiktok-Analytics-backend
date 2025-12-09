package com.example.sbazureappdemo.DATAMAINTENANCE;
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


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/datamaintenance")
public class ExcelControllerDataMaintenance {
    Logger logger = LoggerFactory.getLogger(ExcelControllerDataMaintenance.class);

    @Autowired
    private final ShowDBRecordsRenderer showDBRecordsRenderer;
    private final ExcelService excelService;

    public ExcelControllerDataMaintenance(ShowDBRecordsRenderer showDBRecordsRenderer, ExcelService excelService) {
        this.showDBRecordsRenderer = showDBRecordsRenderer;
        this.excelService = excelService;
    }   
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadExcel() {
        List<Map<String, Object>> data = showDBRecordsRenderer.getLastProcessedData();
        //logger.info("Datos obtenidos para exportar a Excel: " + data);

        if (data == null || data.isEmpty()) {
            logger.info("⚠️ No hay datos para exportar.");
            return ResponseEntity.badRequest().body("⚠️ No hay datos para exportar a Excel.".getBytes());
        }
        try {
            logger.info("Inicio de la generación del archivo Excel");
            byte[] excelFile = excelService.downloadExcel(data);
            //logger.info("📂 Archivo Excel generado correctamente.");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "tiktok_metrics.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelFile);
        } catch (IOException e) {
            logger.error("❌ Error al generar el archivo Excel", e.getMessage());
            return ResponseEntity.internalServerError().body("❌ Error al generar el archivo Excel.".getBytes());
        }
    }
}

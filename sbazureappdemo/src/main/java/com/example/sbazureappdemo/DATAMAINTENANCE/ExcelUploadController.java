package com.example.sbazureappdemo.DATAMAINTENANCE;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@CrossOrigin(origins = "*") // Permite solicitudes desde cualquier origen
@RestController
@RequestMapping("/datamaintenance")
public class ExcelUploadController {
    Logger logger = LoggerFactory.getLogger(ExcelUploadController.class);

    @Autowired
    private ExcelUploadRenderer excelUploadRenderer;
    public ExcelUploadController(ExcelUploadRenderer excelUploadRenderer) {
        this.excelUploadRenderer = excelUploadRenderer;
    }

    @PostMapping("/uploadexcel")
    public Map<String, Object> uploadExcelFile(@RequestParam("file") MultipartFile file, @RequestParam("userId") String userId) {
        try {
            if (userId == null || userId.isBlank()) {
                userId = "sistema";
            }
            logger.info("📥 Excel recibido correctamente en el backend");
            return excelUploadRenderer.processExcelFile(file,userId);
        }
        catch (Exception e) {
            logger.error("Error: (DataMaintenance, UploadExcel)",e);
            return Map.of();
        }
    }





}


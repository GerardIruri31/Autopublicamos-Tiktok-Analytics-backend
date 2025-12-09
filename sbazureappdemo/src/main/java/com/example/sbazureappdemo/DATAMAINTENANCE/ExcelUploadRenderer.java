package com.example.sbazureappdemo.DATAMAINTENANCE;

import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.example.sbazureappdemo.service.TiktokMetricasService;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Component
public class ExcelUploadRenderer {
    Logger logger = LoggerFactory.getLogger(ExcelUploadRenderer.class);
    @Autowired 
    private final TiktokMetricasService tiktokMetricasService;
    public ExcelUploadRenderer(TiktokMetricasService tiktokMetricasService) {
        this.tiktokMetricasService = tiktokMetricasService;
    }
    public Map<String, Object> processExcelFile(MultipartFile file, String userId) {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> records = new ArrayList<>();

        try {
            Workbook workbook = WorkbookFactory.create(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0); // Solo se procesa la primera pestaña

            if (sheet == null) {
                Map<String, Object> errorResponse = new LinkedHashMap<>();
                errorResponse.put("error", "No se encontraron hojas en el archivo Excel");
                return errorResponse;
            }

            Iterator<Row> rowIterator = sheet.iterator();
            List<String> headers = new ArrayList<>();

            // Leer encabezados (primera fila)
            if (rowIterator.hasNext()) {
                Row headerRow = rowIterator.next();
                for (Cell cell : headerRow) {
                    headers.add(cell.getStringCellValue().trim());
                }
            }
            String tableName ="";
            List<String> conflicts = new ArrayList<>();

            // PERMITE UPLOAD DE PLANTILLA EXCEL DE MAESTRA DE MANTENIMIENTO POSTMETA AUTHOR
            if (headers.contains("codmes") && headers.contains("codautora")) {
                tableName = "m_metapostautora";
                conflicts.add("codautora");
                conflicts.add("codmes");
            }

            else if (headers.contains("codmes") && headers.contains("codlibro")) {
                tableName = "m_metapostlibro";
                conflicts.add("codlibro");
                conflicts.add("codmes");
            }

            else if (headers.contains("codautora")) {
                tableName = "m_autora";
                conflicts.add("codautora");
            }
            else if (headers.contains("codlibro")) {
                tableName = "m_libro";
                conflicts.add("codlibro");
            }
            else if (headers.contains("codescena")) {
                tableName = "m_escenalibro";
                conflicts.add("codescena");
            }
            else if (headers.contains("fecinicioperiodometa") && headers.contains("fecfinperiodometa")) {
                tableName = "m_metaposteadorasistente";
                conflicts.add("codposteador");
                conflicts.add("fecinicioperiodometa");
                conflicts.add("fecfinperiodometa");
            }
            else if (headers.contains("codposteador")) {
                tableName = "m_posteadorasistente";
                conflicts.add("codposteador");

            }
            else if (headers.contains("tippublicacion")) {
                tableName = "m_tipopost";
                conflicts.add("tippublicacion");
            }

            else {
                response.put("error", "No valid headers found in the Excel file.");
                return response;
            }
            
            if (headers.contains("fecreacionregistro")) {
                headers.remove("fecreacionregistro");
            }
            if (headers.contains("horacreacionregistro")) {
                headers.remove("horacreacionregistro");
            }

            if (headers.contains("fecatualizacionregistro")) {
                headers.remove("fecatualizacionregistro");
            }
            if (headers.contains("horaactualizacionregistro")) {
                headers.remove("horaactualizacionregistro");
            }

            // Leer registros (desde la segunda fila)
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Map<String, Object> record = new LinkedHashMap<>();

                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    String header = headers.get(i);
                    if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                        Date fecha = cell.getDateCellValue(); // Obtiene la fecha en formato java.util.Date
                        LocalDate fechaParseada = fecha.toInstant().atZone(ZoneId.systemDefault()).toLocalDate(); // Convierte a LocalDate
                        record.put(header, fechaParseada); // Guarda la fecha en formato LocalDate
                    } 
                    
                    else if ("numpostemeta".equalsIgnoreCase(header) || "numposteometa".equalsIgnoreCase(header)) {
                        if (cell.getCellType() == CellType.NUMERIC) {
                            // Si la celda es numérica, obtener el valor directamente
                            record.put(header, (int) cell.getNumericCellValue());
                        } else if (cell.getCellType() == CellType.STRING) {
                            // Si la celda es STRING, intentar convertirla a número
                            try {
                                record.put(header, Integer.parseInt(cell.getStringCellValue().trim()));
                            } catch (NumberFormatException e) {
                                logger.error("❌ Error al convertir a número: " + cell.getStringCellValue(),e);
                                record.put(header, 0); // Asignar un valor por defecto si falla
                            }
                        } else {
                            record.put(header, 0); // Si es otro tipo de celda, asignar 0
                        }
                    }
                    else {
                        // Obtiene la celda como String
                        String cellValue = getCellValueAsString(cell).trim();
                        record.put(header, cellValue);
                    }
                }
                boolean tieneNulos = record.values().stream()
                        .anyMatch(v -> v == null || (v instanceof String && ((String) v).trim().isEmpty()));

                if (!tieneNulos) {
                    records.add(record);  // ✅ solo agrega si todas las claves tienen valor
                }
            }

            response.put("table", tableName);
            response.put("headers", headers);
            response.put("conflict",conflicts);
            response.put("records", records);
            response.put("processedRecords", records.size());

            workbook.close();
            if (tableName.isEmpty()) {
                response.put("error", "Error: No se detectó una tabla válida.");
                return response;
            }
            //logger.info("Registros procesados: " + response);
            return tiktokMetricasService.uploadRecordsExcelFile(response,userId);

        } catch (IOException e) {
            response.put("error", "Error procesando el archivo Excel: " + e.getMessage());
            logger.error("Error procesando el archivo Excel",e);
            return response;
        }
    }

    // Método auxiliar para obtener valores de celdas en formato String
    private String getCellValueAsString(Cell cell) {
        switch (cell.getCellType()) {
        case STRING:
            return cell.getStringCellValue().trim();
        case NUMERIC:
            if (DateUtil.isCellDateFormatted(cell)) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                return sdf.format(cell.getDateCellValue()); // Devuelve la fecha en formato "yyyy-MM-dd"
            }
            return String.valueOf((int) cell.getNumericCellValue()); // Convierte a entero si es número
        case BOOLEAN:
            return String.valueOf(cell.getBooleanCellValue());
        case FORMULA:
            return cell.getCellFormula();
        default:
            return "";
    }
    }
}

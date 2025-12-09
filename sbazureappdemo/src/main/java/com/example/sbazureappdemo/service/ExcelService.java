package com.example.sbazureappdemo.service;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExcelService {
    Logger logger = LoggerFactory.getLogger(TiktokMetricasService.class);

    public byte[] downloadExcel(List<Map<String, Object>> olddata) throws IOException {
        // Obtiene los datos procesados 
        try {
        if (olddata == null || olddata.isEmpty()) {
            throw new IllegalArgumentException("⚠️ No hay datos para exportar a Excel.");
        }
        List<Map<String, Object>> data = new ArrayList<>();
        for (Map<String, Object> fila : olddata) {
            Map<String, Object> nuevaFila = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : fila.entrySet()) {
                String clave = entry.getKey();
                Object valor = entry.getValue();
                switch (clave.toLowerCase()) {
                    case "author_name":
                        nuevaFila.put("Author Name", valor);
                        break;
                    case "book":
                        nuevaFila.put("Book Name", valor);
                        break;
                    case "scene_code":
                        nuevaFila.put("Scene Code", valor);
                        break;
                    case "scene":
                        nuevaFila.put("Scene Name", valor);
                        break;
                    case "score_scene":
                        nuevaFila.put("Scene Score", valor);
                        break;
                    case "promviews":
                        nuevaFila.put("Average Views", valor);
                        break;
                    case "prominteracciones":
                        nuevaFila.put("Average Interactions", valor);
                        break;
                    default:
                        nuevaFila.put(clave, valor);
                }
            }
            data.add(nuevaFila); // Aquí está el cambio
        }
        //logger.info("📊 Datos recibidos en ExcelService: " + data);
        // Usa Apache POI para crear y llenar un archivo Excel
        try (XSSFWorkbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Crear una hoja llamada "Tiktok Métricas"
            XSSFSheet sheet = workbook.createSheet("Tiktok Métricas");
            // Obtiene los nombres de las columnas a partir del primer elemento
            List<String> columns = new ArrayList<>(data.get(0).keySet());

                // === Estilo de cabecera ===
            CellStyle cabeceraStyle = workbook.createCellStyle();
            cabeceraStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
            cabeceraStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Font cabeceraFont = workbook.createFont();
            cabeceraFont.setBold(true);
            cabeceraStyle.setFont(cabeceraFont);

            cabeceraStyle.setAlignment(HorizontalAlignment.CENTER);
            cabeceraStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            cabeceraStyle.setWrapText(true);

            // Borde grueso en cabeceras
            cabeceraStyle.setBorderTop(BorderStyle.THICK);
            cabeceraStyle.setBorderBottom(BorderStyle.THICK);
            cabeceraStyle.setBorderLeft(BorderStyle.THICK);
            cabeceraStyle.setBorderRight(BorderStyle.THICK);

            // === Estilo para celdas de contenido ===
            CellStyle contenidoStyle = workbook.createCellStyle();
            contenidoStyle.setAlignment(HorizontalAlignment.CENTER);
            contenidoStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            contenidoStyle.setWrapText(true);

            // === Estilo para celdas de fecha ===
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setAlignment(HorizontalAlignment.CENTER);
            dateStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Formato de fecha "dd/MM/yyyy"
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));

            // Agregar cabeceras
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.size(); col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns.get(col)); //Establece el nombre de la columna
                cell.setCellStyle(cabeceraStyle);  // Aplica estilo a la cabecera
            }

            // === Estilo NUMERIC
            CellStyle numericStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            numericStyle.setDataFormat(format.getFormat("0")); // o "0" si no quieres decimales
            numericStyle.setAlignment(HorizontalAlignment.CENTER);
            numericStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Añadir los datos al Excel
            int rowIndex = 1; // La fila 0 es para cabeceras
            for (Map<String, Object> rowData : data) {
                Row row = sheet.createRow(rowIndex++);
                for (int col = 0; col < columns.size(); col++) {
                    Cell cell = row.createCell(col);
                    String columnName = columns.get(col);
                    Object value = rowData.get(columns.get(col));
                    if (value != null) {

                        if ("Views".equalsIgnoreCase(columnName) || "Likes".equalsIgnoreCase(columnName) || "Comments".equalsIgnoreCase(columnName) || "Reposted".equalsIgnoreCase(columnName) || "Saves".equalsIgnoreCase(columnName) || "Engagement rate".equalsIgnoreCase(columnName) || "Interactions".equalsIgnoreCase(columnName) || "Number of Hashtags".equalsIgnoreCase(columnName)) {
                            if (value instanceof Number) {
                                cell.setCellValue(((Number) value).doubleValue());
                                cell.setCellStyle(numericStyle);
                            }
                        }
                        // Si la columna es "Date posted" o "Tracking date"
                        else if ("Date posted".equalsIgnoreCase(columnName) || "Tracking date".equalsIgnoreCase(columnName) || "fecreacionregistro".equalsIgnoreCase(columnName) || "fecactualizacionregistro".equalsIgnoreCase(columnName) || "fecinicioperiodometa".equalsIgnoreCase(columnName) || "fecfinperiodometa".equalsIgnoreCase(columnName)) {
                            // Intentar parsear la fecha (dd/MM/yyyy)
                            if (value instanceof Date) {
                                cell.setCellValue((Date) value);
                            }
                            else if (value instanceof String) {
                                try {
                                    LocalDate parsedDate = LocalDate.parse(value.toString());
                                    cell.setCellValue(java.sql.Date.valueOf(parsedDate));
                                } catch (Exception e) {
                                    // Si falla el parseo, lo guardamos como texto
                                    cell.setCellValue(value.toString());
                                }
                            }
                            else {
                                // Si el tipo de dato no es compatible, lo guardamos como texto
                                cell.setCellValue(value.toString());
                            }
                            cell.setCellStyle(dateStyle); // Aplicar formato de fecha
                        }  else {
                            // Otras columnas (texto)
                            cell.setCellValue(value.toString());
                            cell.setCellStyle(contenidoStyle);
                        }
                            
                    } else {
                        // Valor nulo
                        cell.setCellValue("");
                        cell.setCellStyle(contenidoStyle);
                    }
                }
            }
            
            // Ajustar automáticamente el ancho de las columnas
            final int MAX_COLUMN_WIDTH = 65280; 
            for (int col = 0; col < columns.size(); col++) {
                sheet.autoSizeColumn(col);

                // Obtenemos el ancho calculado
                int currentWidth = sheet.getColumnWidth(col);
                // Sumamos un poco para que se vea más espacioso
                int extraWidth = 2000;  // Ajusta según tu preferencia
                int newWidth = currentWidth + extraWidth;
                // Evitamos superar el límite máximo
                if (newWidth > MAX_COLUMN_WIDTH) {
                    newWidth = MAX_COLUMN_WIDTH;
                }
                // Establecemos el nuevo ancho
                sheet.setColumnWidth(col, newWidth);
            }

            // Ajustar el alto de las filas (por defecto, desde la 1 hasta la última)
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    // Ajusta la altura a 50 puntos (puedes cambiarlo)
                    row.setHeightInPoints(45);
                }
            }

            // Obtener timestamp para generar nombre único del archivo
            String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
            String fileName = "tiktok_videos_" + timestamp + ".xlsx";

            // Configurar los encabezados HTTP para la descarga
            workbook.write(outputStream);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", fileName);
            logger.info("Excel generado: " + fileName);
            return outputStream.toByteArray();
        } 
    } catch (Exception e) {
        logger.error("Error al generar el archivo Excel", e);
        throw new RuntimeException("⚠️ Error al generar el archivo Excel: " + e.getMessage());
    }
    }
    
}

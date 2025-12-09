package com.example.sbazureappdemo.APICALL;
import com.fasterxml.jackson.core.type.TypeReference;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
//import javax.net.ssl.HttpsURLConnection; // Importar para HTTPS

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class ApifyCaller {
    @Value("${ApifyToken}")
    private String ApifyToken;
    @Value("${AzureURLpy}")
    private String AzureURLpy;


    public Map<String,Object> fetchDataFromApi(String StartDate, String FinishDate, List<String> AccountList) {
        Logger logger = LoggerFactory.getLogger(ApifyCaller.class);
        try {
            // Crear el diccionario (mapa) con los datos correctamente nombrados
            Map<String, Object> jsonInput = new HashMap<>();
            //logger.info("Apifytoken: " + ApifyToken);
            jsonInput.put("ApiToken", ApifyToken);
            jsonInput.put("StartDate", StartDate);
            jsonInput.put("FinishDate", FinishDate);
            jsonInput.put("AccountList", AccountList); 


            // Convertir el diccionario a un JSON usando Jackson
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonBody = objectMapper.writeValueAsString(jsonInput);

            // DEBUG: Mostrar el JSON que se enviará
            //logger.info("JSON enviado: " + jsonBody);
            
            //String AzureURLpy = "http://localhost:8000";
            // Crear conexión HTTP
            
            //String AzureURLpy = "https://capp-pythonv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
            String ApiURL = AzureURLpy + "/APICall";
            URL url = new URL(ApiURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json"); 
            conn.setRequestProperty("Accept", "application/json");  // Importante para FastAPI
            // habilita el envío de datos en el body de la solicitud
            conn.setDoOutput(true);


            // Verificar si la URL es una redirección
            conn.setInstanceFollowRedirects(true);

            // Enviar el JSON en la solicitud
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Leer la respuesta del servidor
            int responseCode = conn.getResponseCode();
            InputStream inputStream = (responseCode == HttpURLConnection.HTTP_OK) ? conn.getInputStream() : conn.getErrorStream();

            // Leer respuesta y mostrarla
            try (BufferedReader in = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                Map<String, Object> responseMap = objectMapper.readValue(response.toString(), new TypeReference<Map<String, Object>>() {});
                // Retorna el JSON recibido
                // Manejo de respuestas
                if (responseMap.containsKey("onError")) {
                    logger.error("Error en la API: " + responseMap.get("onError"));
                    return Map.of("error", responseMap.get("onError"));
                } else if (responseMap.containsKey("onSuccess")) {
                    logger.info("Datos obtenidos correctamente de APIFY.");
                    return Map.of("data", responseMap.get("onSuccess"));
                } else {
                    logger.error("Respuesta inesperada de la API.");
                    return Map.of("error", "Respuesta inesperada de la API");
                }
            }
        } catch (Exception e) {
            logger.error("Excepción al conectar con la API", e);
            return Map.of("error", "Error en la conexión con la API: " + e.getMessage());
        }
        
    }
    
}


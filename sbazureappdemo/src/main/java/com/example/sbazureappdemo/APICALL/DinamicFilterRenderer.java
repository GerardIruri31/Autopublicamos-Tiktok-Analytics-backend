package com.example.sbazureappdemo.APICALL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

// Indica que esta clase es un componente de Spring y puede ser inyectada en otros servicios o controladores
@Component
public class DinamicFilterRenderer {
    Logger logger = LoggerFactory.getLogger(DinamicFilterRenderer.class);

    // @Autowired permite que Spring inyecte automáticamente una instancia de JsonProcessor en DinamicFilterRenderer
    // Constructor con inyección de dependencia de JsonProcessor.

    private final JsonProcessor jsonProcessor;
    private final ApifyCaller apifyCaller; // Se declara la dependencia

    @Autowired
    public DinamicFilterRenderer(JsonProcessor jsonProcessor, ApifyCaller apifyCaller) {
        this.jsonProcessor = jsonProcessor;
        this.apifyCaller =  apifyCaller;
    }
    
    // Retorna Lista de mapas con los datos filtrados o un mensaje de error en caso de falla en la API
    public List<Map<String, Object>> filtrarDatos(String startDate, String finishDate, List<String> accountList, String UserId) {
        // Llamar a la clase que se conecta a la API externa (python APIFY) con los filtros recibidos
        Map<String,Object> jsonResponse = apifyCaller.fetchDataFromApi(startDate, finishDate, accountList);

        // Si hay error en la API, devolver mensaje de error en formato JSON
        if (jsonResponse.containsKey("error")) {
            return List.of(Map.of("error", jsonResponse));
        }
        // Procesar los datos obtenidos desde la API con JsonProcessor
        // logger.info("Datos obtenidos de Apify: " + jsonResponse);
        return jsonProcessor.procesarJson(jsonResponse, UserId);
    }
}

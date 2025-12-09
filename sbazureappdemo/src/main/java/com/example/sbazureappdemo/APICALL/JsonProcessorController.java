package com.example.sbazureappdemo.APICALL;
import org.springframework.web.bind.annotation.*;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

//Indica que esta clase maneja solicitudes HTTP y devuelve datos en formato JSON.
@RestController
// Define la ruta base "/api" para todos los endpoints dentro de este controlador.
@RequestMapping("/api")
// Permite que cualquier dominio (puertos) acceda a este controlador (útil para evitar problemas de CORS)
@CrossOrigin(origins = "*")
//@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})


public class JsonProcessorController {
    // @Autowired permite que Spring inyecte automáticamente una instancia de DinamicFilterRenderer en JsonProcessorController
    // Constructor con inyección de dependencia de DinamicFilterRenderer.
    Logger logger = LoggerFactory.getLogger(JsonProcessorController.class);

    private final DinamicFilterRenderer dinamicFilterRenderer;
    @Autowired
    public JsonProcessorController(DinamicFilterRenderer dinamicFilterRenderer) {
        this.dinamicFilterRenderer = dinamicFilterRenderer;
    }

    // Define endpoint para recibir filtros desde el frontend y devolver datos procesados.    
    @PostMapping("/filtrar")

    //  Recibe un objeto JSON del body de la solicitud POST HTTP (filtros de fecha y lista de cuentas)
    // Lo establece en la clase FiltrosRequest con instancia "request"
    public List<Map<String, Object>> filtrarDatos(@RequestBody FiltrosRequest request) {
        logger.info("📥 Datos recibidos en el backend:");
        logger.info("StartDate: " + request.getStartDate());
        logger.info("FinishDate: " + request.getFinishDate());
        logger.info("AccountList: " + request.getAccountList());
        //logger.info("UserRol: " + request.getUserRol());
        logger.info("UserId: " + request.getUserId());

        // Llama al método filtrarDatos de la clase DinamicFilterRender instanciado en la variable "dinamicFilterRenderer" que llama al otro y al otro (BD, Excel). Y recibe los diccionarios procesados.
        try {
            return dinamicFilterRenderer.filtrarDatos(request.getStartDate(), request.getFinishDate(), request.getAccountList(),request.getUserId());}
        catch (Exception e) {
            logger.error("Error al procesar los datos", e);
            return List.of();
        }
        }
    }


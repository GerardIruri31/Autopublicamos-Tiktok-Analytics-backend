package com.example.sbazureappdemo.APICALL;
import com.example.sbazureappdemo.model.TiktokMetricas;
import com.example.sbazureappdemo.service.TiktokMetricasService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class JsonProcessor {
    // Lista para almacenar los últimos datos procesados
    private List<Map<String, Object>> lastProcessedData = new ArrayList<>();

    // Inyección de dependencia de la clase del servicio para interactuar con la base de datos (TiktokMetricasService)
    private final TiktokMetricasService tiktokMetricasService; 
    @Autowired
    public JsonProcessor(TiktokMetricasService tiktokMetricasService) {
        this.tiktokMetricasService = tiktokMetricasService;
    }

    Logger logger = LoggerFactory.getLogger(JsonProcessor.class);
    
    public List<Map<String, Object>> procesarJson(Map<String,Object> jsonResponse, String UserID) {
        // Lista de instancias TikTokMetricas. Cada uno es una publicación.
        List<TiktokMetricas> metricasList = new ArrayList<>();
        lastProcessedData.clear(); // Evita acumulación de datos de ejecuciones anteriores
        try {
            //Fecha y hora de Perú
            TimeZone timeZone = TimeZone.getTimeZone("America/Lima");

            // Leer el JSON y navegar hasta la parte relevante
            @SuppressWarnings("unchecked")
            Map<String, Object> rootData = (Map<String, Object>) jsonResponse.get("data");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) rootData.get("data");

            // Iterar sobre cada elemento del JSON
            for (Map<String,Object> item : items) {
                Map<String, Object> dataMap = new LinkedHashMap<>();
                TiktokMetricas metrica = new TiktokMetricas();

                // Datos de la cuenta
                String cuentaInexistente = "";
                if (!item.containsKey("authorMeta") || !(item.get("authorMeta") instanceof Map)) {
                    cuentaInexistente = item.containsKey("input") ? item.get("input").toString() : "";
                    logger.info("Procesamiento de APIFY: Cuenta " + cuentaInexistente + ": No existe");
                }

                String nombreCuenta = cuentaInexistente;
                String region = "Not found: N/A";
                if (item.containsKey("authorMeta") && item.get("authorMeta") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> authorMeta = (Map<String, Object>) item.get("authorMeta");
                    nombreCuenta = authorMeta.containsKey("name") ? authorMeta.get("name").toString() : cuentaInexistente;
                    region = authorMeta.containsKey("region") ? authorMeta.get("region").toString() : "Not found: N/A";

                }
        
                // Datos del video
                String linkVideo = item.getOrDefault("webVideoUrl","Not found: N/A").toString();
                String postcode = linkVideo != "Not found: N/A" ? linkVideo.substring(linkVideo.lastIndexOf("/") + 1) : "Not found: N/A";
                String descripcion = item.getOrDefault("text","Not found: N/A").toString();
                String fechaHoraVideo = item.getOrDefault("createTimeISO","Not found: N/A").toString();
                String fechaVideo, horaVideo;
                if (fechaHoraVideo.equals("Not found: N/A")) {
                    fechaVideo = "Not found: N/A";
                    horaVideo = "Not found: N/A";
                } else {
                    String[] fechaHora = formatearFechaHora(fechaHoraVideo);
                    fechaVideo = fechaHora[0];
                    horaVideo = fechaHora[1];
                }

                // Métricas del video
                int views = item.containsKey("playCount") && item.get("playCount") instanceof Number ? ((Number) item.get("playCount")).intValue() : 0;
                int comentarios = item.containsKey("commentCount") && item.get("commentCount") instanceof Number ? ((Number) item.get("commentCount")).intValue() : 0;
                int likes = item.containsKey("diggCount") && item.get("diggCount") instanceof Number ? ((Number) item.get("diggCount")).intValue() : 0;
                int guardados = item.containsKey("collectCount") && item.get("collectCount") instanceof Number ? ((Number) item.get("collectCount")).intValue() : 0;
                int compartidos = item.containsKey("shareCount") && item.get("shareCount") instanceof Number ? ((Number) item.get("shareCount")).intValue() : 0;

                // Procesar hashtags
                List<String> listaHashtags = new ArrayList<>();
                if (item.containsKey("hashtags") && item.get("hashtags") instanceof List) {
                    List<?> hashtags = (List<?>) item.get("hashtags");
                    for (Object ht : hashtags) {
                        if (ht instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> hashtagMap = (Map<String, Object>) ht;
                            String hashtag = hashtagMap.containsKey("name") ? hashtagMap.get("name").toString() : "";
                            if (!hashtag.isEmpty()) {
                                listaHashtags.add("#" + hashtag);
                            }
                        }
                    }
                }
                // Si la lista de hashtags está vacía, usamos "Not found: N/A"
                String final_hashtags = listaHashtags.isEmpty() ? "Not found: N/A" : String.join(", ", listaHashtags);
                int numHashtags = listaHashtags.isEmpty() ? 0 : listaHashtags.size();


                // Datos del sonido
                String idSound = "";
                String nombreSonido = "";
                if (item.containsKey("musicMeta") || (item.get("musicMeta") instanceof Map)) {
                    @SuppressWarnings("unchecked")
                    Map<String,Object> sound= ( Map<String,Object>) item.get("musicMeta");
                    idSound = sound.containsKey("musicId") ? sound.get("musicId").toString() : "";
                    nombreSonido = sound.containsKey("musicName") ? sound.get("musicName").toString() : "";
                }
                String URL_final = "Not found: N/A";
                if (!idSound.isEmpty() && !nombreSonido.isEmpty()) {
                    nombreSonido = nombreSonido.replaceAll("\\s*-\\s*", "-").replace(" ", "-");
                    URL_final = "https://tiktok.com/music/" + nombreSonido + "-" + idSound;
                }

                // Calcular engagement
                double engagement = calcularEngagement(views, comentarios, likes, guardados, compartidos);
                int totalInteracciones = likes + comentarios + compartidos + guardados;

                // Procesar información de los PALOTES
                String[] datosPalotes = matchearInfoPalotes(descripcion);
                String autorNombre = datosPalotes[0];
                String libroNombre = datosPalotes[1];
                String numeroContenido = datosPalotes[2];
                String tipoPublicacion = datosPalotes[3];
                String posteadorNombre = datosPalotes[4];
                String descripcionEscena = datosPalotes[5];

                // Fecha y hora del tracking
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                dateFormat.setTimeZone(timeZone);
                String fechaTrackeo = dateFormat.format(new Date());            
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");
                timeFormat.setTimeZone(timeZone);
                String horaTrackeo = timeFormat.format(new Date());


                // Agregar datos de una publicación al diccionario
                dataMap.put("Post code",postcode);
                dataMap.put("Author name", autorNombre);
                dataMap.put("Book name", libroNombre);
                dataMap.put("Scene name", descripcionEscena);
                dataMap.put("Number of Scene", numeroContenido);
                dataMap.put("Post type", tipoPublicacion);
                dataMap.put("PA name", posteadorNombre);
                dataMap.put("Date posted", fechaVideo);
                dataMap.put("Time posted", horaVideo);
                dataMap.put("TikTok Account Username", nombreCuenta);
                dataMap.put("Post Link", linkVideo);
                dataMap.put("Views", views);
                dataMap.put("Likes", likes);
                dataMap.put("Comments", comentarios);
                dataMap.put("Reposted", compartidos);
                dataMap.put("Saves", guardados);
                dataMap.put("Engagement rate", Math.round(engagement * 100.0) / 100.0);
                dataMap.put("Interactions", totalInteracciones);
                dataMap.put("Hashtags", final_hashtags);
                dataMap.put("# of Hashtags", numHashtags);
                dataMap.put("Sound URL", URL_final);
                dataMap.put("Region of posting", region);
                dataMap.put("Tracking date", fechaTrackeo);
                dataMap.put("Tracking time", horaTrackeo);
                dataMap.put("Logged-in User", UserID);


                // Agregar al listado publicación a la lista contenedora de todos.
                lastProcessedData.add(dataMap);

                // Setter de todos los atributos para BD 
                if (postcode != "Not found: N/A" && fechaVideo != "Not found: N/A") {
                metrica.setCodpublicacion(postcode);
                metrica.setCodautora(autorNombre);
                metrica.setCodescena(descripcionEscena);
                metrica.setCodlibro(libroNombre);
                metrica.setNumescena(numeroContenido);
                metrica.setTippublicacion(tipoPublicacion);
                metrica.setCodposteador(posteadorNombre);
                metrica.setFecpublicacion(fechaVideo);
                metrica.setHorapublicacion(horaVideo);
                metrica.setNbrcuentatiktok(nombreCuenta);
                metrica.setUrlpublicacion(linkVideo);
                metrica.setNumviews(views);
                metrica.setNumlikes(likes);
                metrica.setNumsaves(guardados);
                metrica.setNumreposts(compartidos);
                metrica.setNumcomments(comentarios);
                metrica.setNumengagement(Math.round(engagement * 100.0) / 100.0);
                metrica.setNuminteractions(totalInteracciones);
                metrica.setDeshashtags(final_hashtags);
                metrica.setNrohashtag(numHashtags);
                metrica.setUrlsounds(URL_final);
                metrica.setCodregionposteo(region);
                metrica.setFecreacionregistro(fechaTrackeo);
                metrica.setHoracreacionregistro(horaTrackeo);
                metrica.setUserIdentification(UserID);

                // Agregar a la lista de METRICASLIST general para la BD
                metricasList.add(metrica);
                }
            }
            
            // Lista de instancias Metricas llama al servicio para guardar datos en BD
            if (!metricasList.isEmpty()) {
                logger.info("Inicio del servicio de almacenamiento de datos en la BD");
                tiktokMetricasService.saveRegistries(metricasList);
            }
        } catch (Exception e) {
            logger.error("Error al procesar los datos: ", e);
        }
        // Retorna lista de diccionarios
        //logger.info("Datos procesados de Apify: " + lastProcessedData);
        logger.info("Datos de APIFY correctamente procesados.");
        return lastProcessedData;    
    }


    private static String[] formatearFechaHora(String fechaHoraISO) {
        try {
            String fecha = fechaHoraISO.substring(0, 10);  // Extrae YYYY-MM-DD
            String hora = fechaHoraISO.substring(11, 19); // Extrae HH:MM:SS
            return new String[]{fecha, hora};
        } catch (Exception e) {
            return new String[]{"Not found: N/A", "Not found: N/A"};
        }
    }




    private static double calcularEngagement(int views, int comentarios, int likes, int guardados, int compartidos) {
        if (views == 0) return 0;
        return ((double) (likes + comentarios + guardados + compartidos) / views) * 100;
    }





    private static String[] matchearInfoPalotes(String descripcion) {
        if (descripcion == null || descripcion.isEmpty()) {
            return new String[]{"Not found: N/A", "Not found: N/A", "Not found: N/A", "Not found: N/A", "Not found: N/A", "Not found: N/A"};
        }
        // Eliminar los "|" al inicio y final y dividir por "|"
        String[] valores = descripcion.replaceAll("^\\|+|\\|+$", "").split("\\|");
        if (valores.length >= 5) {
            String codigoAutor = valores[valores.length - 5].trim();
            String codigoLibro = valores[valores.length - 4].trim();
            String numeroContenido = valores[valores.length - 3].trim();
            String codigoPublicacion = valores[valores.length - 2].trim();
            String codigoPosteador = valores[valores.length - 1].trim();
            String descripcionEscena = codigoLibro + numeroContenido + codigoPublicacion;

    
            // Retornar los valores extraídos (sin hacer comparación con Excel)
            return new String[]{codigoAutor, codigoLibro, numeroContenido, codigoPublicacion, codigoPosteador, descripcionEscena};
        }
        // Si no hay suficientes valores, devolver "Not found: N/A"
        return new String[]{"Not found: N/A", "Not found: N/A", "Not found: N/A","Not found: N/A", "Not found: N/A",  "Not found: N/A"};
    }
}

            

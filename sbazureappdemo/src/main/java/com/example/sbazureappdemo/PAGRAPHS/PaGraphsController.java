package com.example.sbazureappdemo.PAGRAPHS;
import org.springframework.web.bind.annotation.*;

import com.example.sbazureappdemo.service.TiktokMetricasService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/pagraphs")
@CrossOrigin(origins = "*")
public class PaGraphsController {
    Logger logger = LoggerFactory.getLogger(PaGraphsController.class);
    private final TiktokMetricasService tiktokMetricasService;
    @Autowired
    public PaGraphsController(TiktokMetricasService tiktokMetricasService){
        this.tiktokMetricasService = tiktokMetricasService;
    }

    @PostMapping("/getdata")
    public List<Map<String,Object>> RecibirFiltros(@RequestBody PaGraphsRenderer filtros) {
        try {
            logger.info("Datos recibidos en el backend:: " + filtros.getStartDate() + ", " + filtros.getFinishDate() + ", " + filtros.getPAList());
            return tiktokMetricasService.GetDatosPaGraphs(filtros);
        } catch (Exception e) {
            logger.error("Error al filtrar datos", e);
            return List.of();
        }
    }
}

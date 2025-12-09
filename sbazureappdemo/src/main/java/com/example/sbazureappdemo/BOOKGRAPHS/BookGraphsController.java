package com.example.sbazureappdemo.BOOKGRAPHS;

import com.example.sbazureappdemo.AUTHORGRAPHS.AuthorGraphsRenderer;
import com.example.sbazureappdemo.BOOKGRAPHS.dto.BookGraphsRequestDTO;
import com.example.sbazureappdemo.service.TiktokMetricasService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/bookgraphs")
@CrossOrigin(origins = "*")
public class BookGraphsController {
    Logger logger = LoggerFactory.getLogger(BookGraphsController.class);
    private final TiktokMetricasService tiktokMetricasService;
    public BookGraphsController(TiktokMetricasService tiktokMetricasService){
        this.tiktokMetricasService = tiktokMetricasService;
    }

    @PostMapping("/dataPerMonth")
    public ResponseEntity<?> dataPerMonth(@RequestBody BookGraphsRequestDTO filtros) {
        try {
            logger.info("📥 Filtros recibidos en el backend: " + filtros.getStartDate() + ", " + filtros.getFinishDate() + ", " + filtros.getBookList());
            return ResponseEntity.ok(tiktokMetricasService.booksPerMonth(filtros));
        }
        catch (Exception e) {
            logger.error("Error al filtrar datos",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }

    // ENDPOINT PARA EFECTIVIDAD POR AUTHOR POR MES
        @PostMapping("/effectivenessBookPerMonth")
    public ResponseEntity<?> effectivenessPerMonth(@RequestBody BookGraphsRequestDTO filtros) {
        try {
            logger.info("📥 Filtros recibidos en el backend: " + filtros.getStartDate() + ", " + filtros.getFinishDate() + ", " + filtros.getBookList());
            return ResponseEntity.ok(tiktokMetricasService.effectBooksPerMonth(filtros));
        }
        catch (Exception e) {
            logger.error("Error al filtrar datos",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of(e.getMessage()));
        }
    }

}
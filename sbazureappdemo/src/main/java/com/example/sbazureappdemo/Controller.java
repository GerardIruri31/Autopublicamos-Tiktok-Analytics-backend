package com.example.sbazureappdemo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;



// Indica que esta clase es un controlador de Spring y que cada método devuelve directamente la respuesta en formato JSON o texto
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})


public class Controller {
    // Especifica que este método maneja peticiones HTTP GET en la rama principal ("/")
    @GetMapping("/")
    public String sayHello(){
        return "Welcome to the TIKTOK PROYECT in Azure Container App with Spring Boot";
    }
}

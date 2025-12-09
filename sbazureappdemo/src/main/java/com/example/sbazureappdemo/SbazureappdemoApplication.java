package com.example.sbazureappdemo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;


// Marca la clase principal de la app SpringBoot
@SpringBootApplication
// Asegura que Spring escanee todos los componentes (Controller, Service, etc) en este paquete

public class SbazureappdemoApplication {

	public static void main(String[] args) {
		Logger logger = LoggerFactory.getLogger(SbazureappdemoApplication.class);
		// Inicia la aplicación Spring Boot
		SpringApplication.run(SbazureappdemoApplication.class, args);
		logger.info("✅ Servidor iniciado en Azure Container Apps");
	}

}

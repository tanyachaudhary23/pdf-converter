package com.pdfconverter.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // Store and exchange all times in UTC. This also avoids the old "Asia/Calcutta"
        // name that newer PostgreSQL versions reject. Must run before the database connects.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        SpringApplication.run(BackendApplication.class, args);
    }
}
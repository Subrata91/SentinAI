package com.sentinai.api.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class AppConfig {

    @Value("${MONGO_URI:mongodb://localhost:27017}")
    private String mongoUri;

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public MongoClient mongoClient() {
        System.out.println("=================================================");
        System.out.println("[SENTINAI DB] Explicitly initializing MongoClient with URI:");
        System.out.println(mongoUri);
        System.out.println("=================================================");
        return MongoClients.create(mongoUri);
    }
}

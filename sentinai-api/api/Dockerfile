# Stage 1: Build JAR using Maven Wrapper & Java 21 JDK
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .

# Decode Base64 string into binary truststore.p12 file
ARG TRUSTSTORE_BASE64
RUN if [ -n "$TRUSTSTORE_BASE64" ]; then \
      mkdir -p src/main/resources && \
      echo "$TRUSTSTORE_BASE64" | base64 -d > src/main/resources/truststore.p12; \
    fi

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Run application with Java 21 JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

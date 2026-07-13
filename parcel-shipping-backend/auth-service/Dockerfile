FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml ./pom.xml

COPY config-server/pom.xml ./config-server/pom.xml
COPY discovery-server/pom.xml ./discovery-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY shipments-service/pom.xml ./shipments-service/pom.xml
COPY statistics-service/pom.xml ./statistics-service/pom.xml
COPY auth-service/pom.xml ./auth-service/pom.xml

COPY auth-service/src ./auth-service/src

RUN mvn -pl auth-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build \
    /workspace/auth-service/target/auth-service-0.0.1-SNAPSHOT.jar \
    app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]

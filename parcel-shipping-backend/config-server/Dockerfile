FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml ./pom.xml

COPY config-server/pom.xml ./config-server/pom.xml
COPY discovery-server/pom.xml ./discovery-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY shipments-service/pom.xml ./shipments-service/pom.xml
COPY statistics-service/pom.xml ./statistics-service/pom.xml
COPY auth-service/pom.xml ./auth-service/pom.xml

COPY config-server/src ./config-server/src

RUN mvn -pl config-server -am clean package -DskipTests


FROM eclipse-temurin:17-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build \
    /workspace/config-server/target/config-server-0.0.1-SNAPSHOT.jar \
    app.jar

COPY config-repository /config-repository

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]

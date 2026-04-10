# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Optimize Maven memory for low-RAM environments
ENV MAVEN_OPTS="-Xmx400m -XX:MaxMetaspaceSize=128m"

COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Limit JVM memory for Render Free Tier (512MB)
ENV JAVA_OPTS="-Xmx384m -Xms256m"

EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

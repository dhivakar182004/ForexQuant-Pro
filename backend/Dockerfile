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

# Aggressively limit JVM memory for Render Free Tier (512MB limit) to prevent OOM kills
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=80m -XX:ReservedCodeCacheSize=48m -Xss256k -XX:+UseSerialGC -noverify -XX:TieredStopAtLevel=1"

EXPOSE 10000
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]

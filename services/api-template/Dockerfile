# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cache layer)
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
RUN chown -R spring:spring /app
USER spring:spring

EXPOSE 8080

# Basic healthcheck (adjust path if actuator is present, otherwise simple socket check)
# Since actuator might not be present in template, using a simple port check or /api/v1/hello if available?
# The template has /api/v1/template/...
# Let's trust the app starts. Or use a simple wget if wget is installed (alpine has it).
# But for now, copying the gateway pattern but simpler if actuator is missing.
# Gateway uses actuator. Template might not have it.
# Let's stick to valid base image and entrypoint for now.

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

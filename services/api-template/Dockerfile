# Utilisation de l'image OpenJDK 24
FROM openjdk:24-slim

# Information sur le mainteneur
LABEL maintainer="rabia.nacim@yahoo.com"

# Définition du répertoire de travail
WORKDIR /app

# Copie du JAR de l'application
COPY target/*.jar api.jar

# Variables d'environnement par défaut
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Exposition du port
EXPOSE 8080

# Commande de démarrage de l'application
ENTRYPOINT ["java","-jar","api.jar"]

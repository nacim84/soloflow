# Services Overview

This directory contains independent microservices that are part of the SoloFlow ecosystem. Each service is designed to be self-contained and deployable separately from the rest of the application components.

## Architecture Principles

*   **Autonomy:** Each service has its own codebase, build, and deployment lifecycle.
*   **Decoupling:** Services interact via well-defined APIs, minimizing inter-dependencies at deployment time.
*   **Scalability:** Individual services can be scaled independently based on their specific load requirements.

## Available Services

*   **`api-template`**: A template Spring Boot API service.
*   **`api-pdf`**: A Spring Boot API service for PDF processing. (Port: 8082)
*   **`api-docling`**: A Spring Boot API service for Docling integration. (Port: 8083)

Further details for each service can be found in their respective `README.md` files.

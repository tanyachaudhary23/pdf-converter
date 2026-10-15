# ---------- Stage 1: build the app ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy only what Maven needs to download dependencies first.
# Docker caches each step, so this step is re-run only when pom.xml changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Windows saves line endings as CRLF, which Linux cannot run. This removes the extra character.
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw -B -q dependency:go-offline

# Now copy the source code and build the jar (tests already run in CI, so skip them here)
COPY src ./src
RUN ./mvnw -B -q package -DskipTests

# ---------- Stage 2: run the app ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# PDFBox draws pages with Java's font system, which needs these on a slim Linux image
RUN apt-get update \
    && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Run as a normal user instead of root (safer)
RUN useradd --system --uid 1001 appuser
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-Djava.awt.headless=true", "-jar", "app.jar"]

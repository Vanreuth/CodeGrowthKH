# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -B dependency:go-offline

COPY src ./src
RUN mvn -q -e -B clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Chromium system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpangocairo-1.0-0 libpango-1.0-0 libcairo2 \
    libcairo-gobject2 libgdk-pixbuf-2.0-0 libgtk-3-0 libxcursor1 \
    libx11-6 libx11-xcb1 libxcb1 libxext6 \
    fonts-noto fonts-noto-cjk fonts-khmeros fonts-khmeros-core \
    wget curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -ms /bin/bash app

# Copy jar BEFORE switching user (needed for Playwright CLI extraction)
COPY --from=build /app/target/*.jar app.jar
RUN chown app:app app.jar

# Set Playwright browser path
ENV PLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright

# Install Playwright Chromium as app user
USER app
RUN mkdir -p /home/app/.cache/ms-playwright

RUN java -cp app.jar \
    -DPLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright \
    com.microsoft.playwright.CLI install chromium

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=60", \
  "-XX:+UseSerialGC", \
  "-Xss512k", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-DPLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright", \
  "-jar", "app.jar"]

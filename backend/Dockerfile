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

# ✅ Install Chromium system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxext6 \
    fonts-noto \
    fonts-noto-cjk \
    fonts-khmeros \
    fonts-khmeros-core \
    wget \
    && rm -rf /var/lib/apt/lists/*

# ✅ Create app user
RUN useradd -ms /bin/bash app

# ✅ Copy jar
COPY --from=build /app/target/*.jar app.jar

# ✅ Install Playwright Chromium into a shared location accessible by app user
ENV PLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright

RUN mkdir -p /home/app/.cache/ms-playwright && \
    chown -R app:app /home/app

# ✅ Install browsers as the app user directly (avoids permission copy mess)
USER app
RUN java -cp app.jar \
    -DPLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright \
    -Dloader.main=com.microsoft.playwright.CLI \
    org.springframework.boot.loader.launch.PropertiesLauncher \
    install chromium || true

USER root
RUN chown -R app:app /home/app /app

USER app

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75", \
  "-XX:+UseSerialGC", \
  "-Xss512k", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-DPLAYWRIGHT_BROWSERS_PATH=/home/app/.cache/ms-playwright", \
  "-jar", "app.jar"]
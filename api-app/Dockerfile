FROM eclipse-temurin:latest AS build
WORKDIR /app
COPY ./ ./
RUN ./gradlew bootJar

FROM eclipse-temurin:latest
WORKDIR /app
COPY --from=build /app/build/libs/api-app.jar ./api-app.jar
CMD ["java", "-jar", "api-app.jar"]

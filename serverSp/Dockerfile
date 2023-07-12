FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /usr/src/app

COPY pom.xml .
COPY src ./src

RUN mvn clean package

FROM openjdk:17-jdk-slim

COPY --from=build /usr/src/app/target/*.jar /usr/app/application.jar

ENTRYPOINT ["java","-jar","/usr/app/application.jar"] 

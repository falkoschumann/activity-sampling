import org.gradle.api.tasks.testing.logging.TestExceptionFormat

plugins {
  java
  checkstyle
  jacoco
  pmd
  id("org.springframework.boot") version "3.4.4"
  id("io.spring.dependency-management") version "1.1.7"
  id("com.diffplug.spotless") version "7.0.2"
}

group = "de.muspellheim.activitysampling"
version = "0.0.1-SNAPSHOT"

configurations {
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.flywaydb:flyway-core")
  implementation("org.flywaydb:flyway-database-postgresql")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  compileOnly("org.projectlombok:lombok")
  runtimeOnly("org.postgresql:postgresql")
  developmentOnly("org.springframework.boot:spring-boot-devtools")
  annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
  annotationProcessor("org.projectlombok:lombok")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("com.tngtech.archunit:archunit-junit5:1.4.0")
  testCompileOnly("org.projectlombok:lombok")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  testRuntimeOnly("com.h2database:h2")
  testAnnotationProcessor("org.projectlombok:lombok")
}

tasks.withType<JavaCompile> {
  options.encoding = "UTF-8"
  options.release = 17
  options.compilerArgs.add("-Werror")
}

tasks.withType<Test> {
  jvmArgs("-Duser.DtimeZone=\"Europe/Berlin\"")
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
    showExceptions = true
    exceptionFormat = TestExceptionFormat.FULL
  }
  finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
  dependsOn(tasks.test)
}

/*
tasks.register<Copy>("processFrontendResources") {
  group = "Frontend"
  description = "Process frontend resources"

  from(project.layout.projectDirectory.dir("../web-app/dist"))
  into(project.layout.buildDirectory.dir("resources/main/public"))
}

tasks.named("processResources") {
  dependsOn("processFrontendResources")
}
*/

checkstyle {
  toolVersion = "10.21.2"
  maxWarnings = 0
  maxErrors = 0
  val archive = configurations.checkstyle.get().resolve().filter {
    it.name.startsWith("checkstyle")
  }
  config = resources.text.fromArchiveEntry(archive, "google_checks.xml")
  configProperties["org.checkstyle.google.suppressionfilter.config"] =
    "${projectDir}/config/checkstyle/suppressions.xml"
}

pmd {
  toolVersion = "7.10.0"
  isConsoleOutput = true
}

spotless {
  java {
    googleJavaFormat()
    licenseHeader("// Copyright (c) \$YEAR Falko Schumann. All rights reserved. MIT license.\n\n")
  }
}

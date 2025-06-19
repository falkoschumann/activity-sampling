// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import org.gradle.api.tasks.testing.logging.TestExceptionFormat

plugins {
  checkstyle
  distribution
  jacoco
  java
  pmd
  id("com.diffplug.spotless") version "7.0.4"
  id("io.spring.dependency-management") version "1.1.7"
  id("org.springframework.boot") version "3.5.1"
}

configurations {
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  mavenCentral()
}

dependencyManagement {
  imports {
    mavenBom("com.azure.spring:spring-cloud-azure-dependencies:5.22.0")
  }
}

dependencies {
  implementation("org.apache.commons:commons-csv:1.14.0")
  implementation("com.azure.spring:spring-cloud-azure-starter-active-directory")
  implementation("com.azure.spring:spring-cloud-azure-starter-actuator")
  implementation("org.mnode.ical4j:ical4j:4.1.1")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
  implementation("org.thymeleaf.extras:thymeleaf-extras-springsecurity6")
  compileOnly("org.projectlombok:lombok")
  developmentOnly("org.springframework.boot:spring-boot-devtools")
  annotationProcessor("org.projectlombok:lombok")
  annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
  testImplementation("com.tngtech.archunit:archunit-junit5:1.4.1")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testCompileOnly("org.projectlombok:lombok")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  testAnnotationProcessor("org.projectlombok:lombok")
}

tasks.withType<JavaCompile> {
  options.encoding = "UTF-8"
  options.release = 17
  options.compilerArgs.add("-Werror")
  options.compilerArgs.add("-Xlint:all,-processing,-serial")
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

tasks.register<Copy>("processFrontendResources") {
  group = "Frontend"
  description = "Process frontend resources"

  from(project.layout.projectDirectory.dir("../web-app/dist"))
  into(project.layout.buildDirectory.dir("resources/main/static"))
}

tasks.named("processResources") {
  dependsOn("processFrontendResources")
}

distributions {
  main {
    contents {
      distributionBaseName = "activity-sampling"
      from(tasks.named("bootJar"))
    }
  }
}

tasks.withType(Tar::class) {
  compression = Compression.GZIP
  archiveExtension = "tar.gz"
}

checkstyle {
  toolVersion = "10.24.0"
  maxWarnings = 0
  maxErrors = 0
  val archive =
    configurations.checkstyle.get().resolve().filter {
      it.name.startsWith("checkstyle")
    }
  config = resources.text.fromArchiveEntry(archive, "google_checks.xml")
  configProperties["org.checkstyle.google.suppressionfilter.config"] =
    "$projectDir/config/checkstyle/suppressions.xml"
}

pmd {
  toolVersion = "7.13.0"
  isConsoleOutput = true
  ruleSetFiles = files("config/pmd/custom.xml")
}

spotless {
  java {
    googleJavaFormat("1.27.0")
    licenseHeader(
      "// Copyright (c) \$YEAR Falko Schumann. All rights reserved. MIT license.\n\n",
    )
  }
  kotlinGradle {
    target("*.gradle.kts")
    ktlint()
    licenseHeader(
      "// Copyright (c) \$YEAR Falko Schumann. All rights reserved. MIT license.\n\n",
      "^(import|plugins|rootProject).*",
    )
  }
}

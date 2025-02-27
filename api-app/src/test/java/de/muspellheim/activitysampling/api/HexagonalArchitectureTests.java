// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.library.plantuml.rules.PlantUmlArchCondition.Configuration.consideringOnlyDependenciesInDiagram;
import static com.tngtech.archunit.library.plantuml.rules.PlantUmlArchCondition.adhereToPlantUmlDiagram;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import java.net.URL;
import java.util.Objects;

@AnalyzeClasses(
    packages = {
      "de.muspellheim.activitysampling.api",
    },
    importOptions = ImportOption.DoNotIncludeTests.class)
@SuppressWarnings("PMD.TestClassWithoutTestCases")
class HexagonalArchitectureTests {

  private static final URL diagramUrl =
      Objects.requireNonNull(HexagonalArchitectureTests.class.getResource("/architecture.puml"));

  @ArchTest
  static final ArchRule packageRules =
      classes().should(adhereToPlantUmlDiagram(diagramUrl, consideringOnlyDependenciesInDiagram()));
}

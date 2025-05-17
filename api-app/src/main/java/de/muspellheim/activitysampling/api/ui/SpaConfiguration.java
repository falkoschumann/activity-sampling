// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class SpaConfiguration implements WebMvcConfigurer {

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(
            new PathResourceResolver() {

              @Override
              protected Resource getResource(
                  @NonNull String resourcePath, @NonNull Resource location) throws IOException {
                if (resourcePath.startsWith("api/")) {
                  // Ignore API requests
                  return null;
                }

                var resource = location.createRelative(resourcePath);
                if (resource.exists() && resource.isReadable()) {
                  // Serve static resources from the classpath
                  return resource;
                }

                // Fallback to index.html for SPA routing
                return new ClassPathResource("/static/index.html");
              }
            });
  }
}

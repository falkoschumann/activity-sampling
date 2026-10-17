---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript

- Define data with `type` and behavior with `interface`. Everything described by
  an ESDM schema (state, command, event, query, query result, entity, value
  object) is a `type` wrapped in `Readonly<>`, so that `oneOf`, `allOf` and
  `enum` map to unions, intersections and literal types. Contracts of the shell
  like services, gateways and repositories are an `interface`.
- The ESDM schema requires names in kebab-case. The source code uses the
  idiomatic style like camelCase and PascalCase. Values like event names in the
  domain must not be changed when used as event type in code.

# Activity Sampling

Periodically ask the user about their current activity and log it for analysis.

## Commands

- Use `make` to run a full build with tests and checks. Must be run successfully
  before commit.
- Run `make format` to format the code. Should be run before running checks.

## Project Language

Use English for all files except the domain. The domain language is German.
Idiomatic code conventions like `create` prefix or `Repository` suffix stay in
English.

## Code Style

The ESDM schema requires names in kebab-case. The source code uses the idiomatic
style like CamelCase in TypeScript. Values like event names in the domain must
not be changed when used as event type in code.

## Domain Model

The domain model is written in ESDM.

- **Commands** are named in the imperative. A command name must be unambiguous
  in a bounded context.
- **Events** are named in the past tense. An event name must be unambiguous in a
  bounded context.
- **Queries** are named with the result form as a suffix and an optional
  adjective as prefix. A query name must be unambiguous in a bounded context.
- **Value objects** are referenced with `$ref` instead of repeating their
  schema. The value object carries `$id` inside its `schema`. The identifier is
  a URN of the form `urn:esdm:<domain>:<bounded-context>:<name>`.
- Apply `additionalProperties: false` for all JSON Schemas.
- The warning `esdm/modeling/event-name-with-aggregate-prefix` from `esdm lint`
  can be ignored.

## Commits

Use Conventional Commits. The commit message should be structured as follows:

```git-commit
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to
the consumers of your library:

1. **fix:** a commit of the type fix patches a bug in the codebase (this
   correlates with PATCH in Semantic Versioning).
2. **feat:** a commit of the type feat introduces a new feature to the codebase
   (this correlates with MINOR in Semantic Versioning).
3. **BREAKING CHANGE:** a commit that has a footer `BREAKING CHANGE:`,
   introduces a breaking API change (correlating with MAJOR in Semantic
   Versioning). A BREAKING CHANGE can be part of commits of any type.
4. _types_ other than `fix:` and `feat:` are allowed, e.g., `build:`, `chore:`,
   `ci:`, `docs:`, `style:`, `refactor:`, `perf:` and `test:`.
5. _footers_ other than `BREAKING CHANGE: &lt;description&gt;` may be provided
   and follow a convention similar to git trailer format.
6. A scope may be provided to a commit’s type, to provide additional contextual
   information and is contained within parenthesis, e.g.,
   `feat(parser): add ability to parse arrays`.

## Backlog

- [x] Replace aggregate with DCB when invariants needs other aggregates
- [x] Move references to owner: Rechnung enthält Diagnose und Leistungen
- [ ] Extract value objects like Anschrift
- [x] Use `additionalProperties: false`

# Agent Instructions

## Project Overview

Periodically ask the user about their current activity and log it for analysis.

## Build and Test Commands

All necessary commands can be run via `make`.

- `make` runs a full build with all tests and checks. Must be run successfully
  before commit.
- `make check` runs only unit tests and checks. This is triggered as a Claude
  stop hook.
- `make fix` fixes common linting issues and format the code. Should be run
  before `make check`.

## Project Language

Use English for all project files. Chat with the user in their preferred
language.

## Architecture

The repository is a monorepo with Bun workspaces, compatible with NPM
workspaces:

- `apps` contains applications to be delivered.
- `packages` contains libraries and shared configuration.

## Commits

Use the scopes `desktop` for the app and `model` for the ESDM model.

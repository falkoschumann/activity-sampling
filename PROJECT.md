# Activity Sampling

As a software developer, I want to be asked periodically about my current
activity, so that I can log it for analysis.

## Tech Stack

- **Platform:** Electron, TypeScript
- **Patterns:** domain-driven design, message-driven
- **Styling & UI:** Bootstrap, Bootstrap Icons, Chart.js
- **Storage:** CSV, JSON
- **Build:** make, bun, Vite, electron-builder
- **Testing:** Vitest
- **Linting & Formatting:** ESLint, Stylelint, Prettier, Sheriff

## Folder Structure and important Files

- `schemas/core/v1.yaml`: the JSON schema for all ESDM files
- `activity-sampling.esdm.yaml`: describe the domain
- `external-systems.esdm.yaml`: describe external systems
- `activity-sampling/*.esdm.yaml`: describe the bounded context
- `integration/*.esdm.yaml`: describe the integration between bounded contexts
- `src/main/`: entry point for the main process
- `src/main/application/`: application services
- `src/main/infrastructure/`: infrastructure code
- `src/main/ui/`: UI code handled by the main process
- `src/renderer/`: entry points for the renderer process
- `src/renderer/ui/assets/`: UI assets, like stylesheet and images
- `src/renderer/ui/components/`: shared UI components
- `src/renderer/ui/layouts/`: reusable UI layouts
- `src/renderer/ui/pages/`: UI pages and helpers in a subfolder per page
- `src/preload/index.ts`: defines the API between the main and renderer process
- `src/shared/domain/`: domain code shared by other components
- `src/shared/infrastructure/channels.ts`: Defines the IPC channels
- `test/main/unit/`: unit tests for the main process
- `test/main/integration/`: integration tests for the main process
- `test/main/data/`: test data used by the integration tests
- `test/renderer/unit/`: unit tests for the renderer process

## Important Commands

- `make`: run the full build including tests and checks
- `make build`: build the app without tests and checks
- `make test`: run all tests
- `bun run test -- {filter}`: run one or more tests with a filter (vitest)
- `make check`: run all checks (linting, formatting, architecture rules)
- `make check-esdm`, `make check-eslint`, `make check-stylelint`,
  `make check-prettier` or `make check-sheriff`: run a specific check
- `make fix`: try to fix issues found by `make check`
- `make fix-eslint`, `make fix-stylelint` or `make fix-prettier`: fix a specific
  issue

## Current Status & Roadmap

### Done

- [x] Display category optionally in timesheet

### In Progress

- [/] Export Timesheet with category as task and task as notes

### Backlog

- [ ] Export timesheet by client or project
- [ ] Reload does not update last Activity of notifier
- [ ] Create GitHub pipeline
- [ ] Sort all tables
- [ ] Add feature and scenarios to domain model per command, query or process
      manager
- [ ] Show read/parse error in GUI, not only in console
- [ ] Store view parameters in URL query
- [ ] Add return to "this month" button when period is not this month, same for
      other units
- [ ] Import holidays from an iCalendar file

## Known Issues & Caveats

- Currently, we have no issues

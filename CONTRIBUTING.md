# Contributing

## Requirements

- [Node.js](https://nodejs.org/en/download) >= 24 LTS
- [Bun](https://bun.com) >= 1.2
- Make
- [esdm](https://www.esdm.io/getting-started/installing-esdm/)
- [PlantUML](https://plantuml.com/en/starting)

## Make Targets

The most important targets are:

- `make` - Run full build
- `make domain` - Show domain overview
- `make format` - Apply coding style
- `make dev` - Start dev environment
- `make doc` - Update diagrams

## Build for macOS

Create a file `.env.local` with Apple Developer credentials for signing:

```bash
APPLE_ID=<your-apple-id>
APPLE_APP_SPECIFIC_PASSWORD=<your-app-specific-password>
APPLE_TEAM_ID=<your-team-id>
```

For CI/CD signing export your _Developer ID Application_ certificate from Xcode
and create a Bas64 encoded file from it:

```bash
base64 -i certificate.p12 -o certificate.txt
```

Set environment variables:

```bash
CSC_LINK=<base64-encoded-certificate>
CSC_KEY_PASSWORD=<your-certificate-password>
```

Build with `MAC_SIGN=true make`

## Open Issues

- Create GitHub pipeline
- Export timesheet by client or project
- Export Timesheet with category as task and task as notes
- Reload does not update last Activity of notifier
- Add feature and scenarios to domain model per command, query or process
  manager
- Sort all tables
- Show read/parse error in GUI, not only in console
- Store view parameters in URL query
- Add return to "this month" button when period is not this month, same for
  other units
- Import holidays from an iCalendar file
- Use the list of vacation days to automatically create activity entries

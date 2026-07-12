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

Build with `MAC_SIGN=true make`

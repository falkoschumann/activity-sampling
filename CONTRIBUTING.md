# Contributing

Requirements:

- [Node.js](https://nodejs.org/en/download) >= 24 LTS
- Make
- [PlantUML](https://plantuml.com/en/starting)

Make Targets:

- `make` - Run full build
- `make dev` - Start dev environment
- `make format` - Apply coding style
- `make doc` - Update diagrams

## Build for Apple macOS

Create a file `.env.local` with:

```bash
APPLE_ID=<your-apple-id>
APPLE_APP_SPECIFIC_PASSWORD=<your-app-specific-password>
APPLE_TEAM_ID=<your-team-id>
```

References:

- https://www.sqlstyle.guide

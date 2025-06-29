[![Build](https://github.com/falkoschumann/activity-sampling/actions/workflows/build.yml/badge.svg)](https://github.com/falkoschumann/activity-sampling/actions/workflows/build.yml)

# Activity Sampling

Periodically asks the user about their current activity and logs it for
analysis.

## Installation

### Authentication

Go to https://entra.microsoft.com.

Create a new _app registration_ "Activity Sampling" under _applications_. Under
_authentication_ add an SPA platform with redirect URI your start page or
`http://localhost:3000` for local testing. Select neither _access tokens_ nor
_ID tokens_ under _Implicit grant and hybrid flows_. Under _token configuration_
add the claim _groups ID_ for each type. Create the _app roles_ `user` and
`admin`.

Add _users and groups_ in _enterprise applications_ under _applications_ and
assign app roles.

Set the following environment variables for `api-app`:

- AZURE_CLIENT_ID=your-client-id
- AZURE_APP_ID_URI=your-app-id-uri

or the proper values in the `application.properties` file:

```properties
spring.cloud.azure.active-directory.credential.client-id = your-client-id
spring.cloud.azure.active-directory.app-id-uri = api://your-app-id-uri
```

Create a `.env.local` file in the `web-api` directory with the following
content:

```env
VITE_CLIENT_ID=your-client-id
VITE_TENANT_ID=your-tenant-id
VITE_SCOPES=${VITE_CLIENT_ID}/.default
```

Create `.env` in the root directory for Docker Compose with the following
content:

```env
AZURE_CLIENT_ID=your-client-id
AZURE_APP_ID_URI=your-app-id-uri
```

## Usage

## Contributing

The `Makefile` runs the built as default task. Other tasks are

- `start`: start the server
- `test`: run all tests,
- `format`: format source code

## Credits

# Architecture

- Use Domain Driven Design.
- Implement the functional core, imperative shell pattern with the following
  layers:
  - The component root creates and orchestrates the other layers
  - `application` orchestrates `domain` and `infrastructure` (object oriented)
  - `domain` implements the domain logic of the core (pure functional)
  - `infrastructure` implements the I/O parts of the shell (object oriented)
  - `ui` implements the user interface parts of the shell (object oriented)
    - The UI root creates and orchestrates the UI layers
    - `components` contains reusable components
    - `layouts` contains reusable layouts built from components
    - `pages` contains pages, each built from a layout and components. Each page
      has a folder of its own with the page as `index.tsx` and the modules only
      this page uses. Modules used by more than one page belong to `components`.
  - `shared` optional layer with domain-independent code shared between layers

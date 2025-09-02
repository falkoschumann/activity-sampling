// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import LogPage from "./pages/log";

export default function DesktopApp() {
  /*
  const [versions] = useState(window.electron.process.versions);
  const ping = (): void => window.electron.ping();
  const component = (
    <div className="my-4">
      <button className="btn btn-primary" onClick={ping}>
        Send IPC
      </button>
      <ul>
        <li className="electron-version">Electron v{versions.electron}</li>
        <li className="chrome-version">Chromium v{versions.chrome}</li>
        <li className="node-version">Node v{versions.node}</li>
      </ul>
    </div>
  );
  */

  return <LogPage />;
}

// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Scope, type ScopeType } from "../../../../shared/domain/activities";

export default function ScopeComponent({
  scope,
  onChangeScope,
}: {
  scope: ScopeType;
  onChangeScope: (scope: ScopeType) => void;
}) {
  return (
    <div className="container">
      <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with scope buttons">
        <div className="btn-group btn-group-sm">
          {Object.values(Scope).map((it) => (
            <button
              key={it}
              className={`btn btn-outline-secondary${scope === it ? " active" : ""}`}
              aria-current={scope === it ? "page" : undefined}
              onClick={() => onChangeScope(it)}
            >
              {it}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

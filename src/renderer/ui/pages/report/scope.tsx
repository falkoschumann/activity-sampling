// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { ReportScope } from "../../../../shared/domain/report_query";

export default function ScopeComponent({
  scope,
  onChangeScope,
}: {
  scope: ReportScope;
  onChangeScope: (scope: ReportScope) => void;
}) {
  return (
    <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with scope buttons">
      <div className="btn-group btn-group-sm" role="group" aria-label="Select report scope">
        {Object.values(ReportScope).map((it) => (
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
  );
}

// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Median } from "../../../../shared/domain/statistics_query";

export default function MedianComponent({ median }: { median: Median }) {
  return (
    <>
      <h2>Median</h2>
      <div className="mt-3 mb-2">
        <div className="progress-stacked" style={{ height: "1.5rem" }}>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment one"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "25%" }}
          >
            <div className="progress-bar bg-secondary" style={{ height: "1.5rem" }}>
              &lt; {median.edge25} days
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment two"
            aria-valuenow={50}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "50%" }}
          >
            <div className="progress-bar bg-primary" style={{ height: "1.5rem" }}>
              {median.edge50} days
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment three"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "25%" }}
          >
            <div className="progress-bar bg-secondary" style={{ height: "1.5rem" }}>
              &gt; {median.edge75} days
            </div>
          </div>
        </div>
      </div>
      <p className="small">
        {median.edge50} person days (median): 50% of the records are above this value and 50% are below.
      </p>
      <p className="small">
        {median.edge25} person days (lower quartile) and {median.edge75} person days (upper quartile): 25% of the
        records are below or above these values, respectively.
      </p>
    </>
  );
}

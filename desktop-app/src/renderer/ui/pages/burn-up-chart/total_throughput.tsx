// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export default function TotalThroughputComponent({ totalThroughput, unit }: { totalThroughput: number; unit: string }) {
  return (
    <div className="mt-3 mb-2">
      <p className="text-end">
        <strong>Throughput:</strong> {totalThroughput} per {unit.toLowerCase()}
      </p>
    </div>
  );
}

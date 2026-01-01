// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export default function TotalCountComponent({ totalCount }: { totalCount: number }) {
  return (
    <div className="mt-3 mb-2">
      <p className="text-end">
        <strong>Total count:</strong> {totalCount}
      </p>
    </div>
  );
}

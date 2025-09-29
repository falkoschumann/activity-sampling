// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { PeriodUnit } from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";

export default function TimesheetPage() {
  const from = "2025-09-29";
  const to = "2025-10-05";
  const unit = PeriodUnit.WEEK;
  const isCurrent = true;
  const units = [PeriodUnit.DAY, PeriodUnit.WEEK, PeriodUnit.MONTH];
  const onPreviousPeriod = () => {};
  const onNextPeriod = () => {};
  const onChangePeriod = () => {};

  return (
    <aside className="fixed-top bg-body-secondary">
      <PeriodComponent
        from={from}
        to={to}
        unit={unit}
        isCurrent={isCurrent}
        units={units}
        onPreviousPeriod={onPreviousPeriod}
        onNextPeriod={onNextPeriod}
        onChangePeriod={onChangePeriod}
      />
    </aside>
  );
}

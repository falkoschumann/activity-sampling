// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { formatDuration } from "../components/formatters";
import PageLayout from "../layouts/page_layout";

export default function ReportsPage() {
  return (
    <PageLayout>
      <main className="container my-4">
        <TimeReportContainer />
      </main>
    </PageLayout>
  );
}

function TimeReportContainer() {
  const { entries } = {
    entries: [
      {
        name: "Fleetboard",
        client: "IT Sonix",
        hours: "PT45H15M",
      },
      {
        name: "bitcontrol(R) Map Server",
        client: "DB SEV",
        hours: "PT5H30M",
      },
      {
        name: "bitcontrol(R) Map Server",
        client: "ecoVista",
        hours: "PT12H",
      },
      {
        name: "Vehicle Map",
        client: "Hochbahn",
        hours: "PT15M",
      },
      {
        name: "Planning Meeting",
        client: "MBTA",
        hours: "PT1H",
      },
      {
        name: "Grundlinien",
        client: "BVG",
        hours: "PT7H",
      },
      {
        name: "Abwesend",
        client: "BitCtrl",
        hours: "PT80H",
      },
      {
        name: "Dashboard",
        client: "TheBus",
        hours: "PT30M",
      },
      {
        name: "ABSOLUT II",
        client: "LVB",
        hours: "PT30M",
      },
    ],
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Client</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td className="text-nowrap">{entry.name}</td>
            <td className="text-nowrap">{entry.client}</td>
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

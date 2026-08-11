export type AnalyticsMetricComparison = {
  current: number;
  previous: number;
  delta: number;
  percentChange: number | null;
};

export type AnalyticsExportRow = {
  label: string;
  value: string | number;
};

export type AnalyticsExportSection = {
  title: string;
  rows: AnalyticsExportRow[];
};

export type AnalyticsExportPayload = {
  title: string;
  subtitle?: string;
  generatedAt?: string;
  sections: AnalyticsExportSection[];
};

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildAnalyticsCsv(payload: AnalyticsExportPayload): string {
  const lines: string[] = [
    escapeCsvCell(payload.title),
    escapeCsvCell(payload.subtitle ?? ""),
    escapeCsvCell(payload.generatedAt ?? new Date().toISOString()),
    "",
  ];

  for (const section of payload.sections) {
    lines.push(escapeCsvCell(section.title));
    lines.push(`${escapeCsvCell("Metric")},${escapeCsvCell("Value")}`);
    for (const row of section.rows) {
      lines.push(`${escapeCsvCell(row.label)},${escapeCsvCell(row.value)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function buildAnalyticsPrintHtml(payload: AnalyticsExportPayload): string {
  const sections = payload.sections
    .map((section) => {
      const rows = section.rows
        .map(
          (row) =>
            `<tr><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${row.label}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${row.value}</td></tr>`,
        )
        .join("");
      return `<h2 style="margin:24px 0 8px;font-size:16px;color:#0f766e;">${section.title}</h2><table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${payload.title}</title></head><body style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;padding:24px;"><h1 style="margin:0 0 4px;">${payload.title}</h1><p style="margin:0;color:#64748b;">${payload.subtitle ?? ""}</p><p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">${payload.generatedAt ?? new Date().toLocaleString()}</p>${sections}</body></html>`;
}

export function formatPercentChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function mapMetricComparison(raw: unknown): AnalyticsMetricComparison {
  const row = (raw ?? {}) as Record<string, unknown>;
  const percent =
    typeof row.percent_change === "number"
      ? row.percent_change
      : typeof row.percentChange === "number"
        ? row.percentChange
        : null;
  return {
    current: typeof row.current === "number" ? row.current : 0,
    previous: typeof row.previous === "number" ? row.previous : 0,
    delta: typeof row.delta === "number" ? row.delta : 0,
    percentChange: percent,
  };
}

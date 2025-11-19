// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { ChartType, Plugin } from "chart.js";
import Chart from "chart.js/auto";

export interface ThresholdPluginOptions {
  value?: number;
  axis?: string;
  color?: string;
  width?: number;
  dash?: number[];
  label?: string;
  labelColor?: string;
  font?: string;
}

export const thresholdPlugin: Plugin<ChartType, ThresholdPluginOptions> = {
  id: "threshold",
  afterDraw: (
    chartInstance: Chart,
    _args: unknown,
    options: ThresholdPluginOptions,
  ) => {
    const { ctx, chartArea: { left, right } = {} } = chartInstance;
    if (!ctx || !left || !right) {
      return;
    }

    const axisId = options?.axis || "y";
    const value = options?.value;
    if (value == null) {
      return;
    }

    const scale = chartInstance.scales[axisId];
    if (!scale) {
      return;
    }

    ctx.save();

    const y = scale.getPixelForValue(value);
    ctx.strokeStyle = options.color || "red";
    ctx.lineWidth = options.width ?? 2;
    if (options.dash) {
      ctx.setLineDash(options.dash);
    }
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();

    if (options.label) {
      ctx.fillStyle = options.labelColor || ctx.strokeStyle;
      ctx.font = options.font || "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(options.label, right - 4, y - 4);
    }

    ctx.restore();
  },
};

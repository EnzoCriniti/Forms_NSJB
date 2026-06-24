/**
 * @file frontend/src/features/bi/BiCharts.jsx
 * @summary Wrappers finos de Recharts com o tema do app.
 * @responsibility Linha de tendencia, barras horizontais, histograma e donut,
 * todos respeitando claro/escuro via CSS vars e com tooltips estilizados.
 */

import React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { COLORS } from "../../components/ui";
import { grauColor } from "./BiPanels";

const AXIS = "var(--text-muted)";
const GRID = "var(--border-light)";
const axisTick = { fill: AXIS, fontSize: 11 };

const TooltipBox = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bi-chart-tooltip">
      {label !== undefined && <div className="bi-chart-tooltip-label">{label}</div>}
      {payload.map((entry, index) => (
        <div key={index} className="bi-chart-tooltip-row">
          <span className="bi-grau-dot" style={{ background: entry.color || entry.payload?.fill || COLORS.primary }} />
          {formatter ? formatter(entry.value, entry.payload) : entry.value}
        </div>
      ))}
    </div>
  );
};

export const BiTrendChart = ({ data = [], color = COLORS.primary, height = 240, valueFormatter }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
      <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} width={42} unit="%" />
      <Tooltip content={<TooltipBox formatter={valueFormatter} />} cursor={{ stroke: GRID }} />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
    </LineChart>
  </ResponsiveContainer>
);

export const BiHistogramChart = ({ data = [], color = COLORS.primary, height = 200, valueFormatter }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -20 }}>
      <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
      <Tooltip content={<TooltipBox formatter={valueFormatter} />} cursor={{ fill: "rgba(var(--primary-rgb), 0.06)" }} />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
    </BarChart>
  </ResponsiveContainer>
);

/** Barras horizontais com label à esquerda (vacância, tempo, carga). */
export const BiHBarChart = ({ data = [], color = COLORS.primary, height, valueFormatter, colorByLabel = false, labelWidth = 150 }) => (
  <ResponsiveContainer width="100%" height={height || Math.max(120, data.length * 38 + 24)}>
    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
      <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
      <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
      <YAxis type="category" dataKey="label" tick={{ ...axisTick, width: labelWidth - 8 }} tickLine={false} axisLine={false} width={labelWidth} interval={0} />
      <Tooltip content={<TooltipBox formatter={valueFormatter} />} cursor={{ fill: "rgba(var(--primary-rgb), 0.06)" }} />
      <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
        {data.map((entry, index) => (
          <Cell key={index} fill={colorByLabel ? grauColor(entry.label) : (entry.color || color)} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const BiDonutChart = ({ data = [], height = 220, valueFormatter }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="82%" paddingAngle={2} stroke="var(--surface)" strokeWidth={2}>
        {data.map((entry, index) => (
          <Cell key={index} fill={entry.color || grauColor(entry.label)} />
        ))}
      </Pie>
      <Tooltip content={<TooltipBox formatter={valueFormatter} />} />
    </PieChart>
  </ResponsiveContainer>
);

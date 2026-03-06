import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const formatShort = (value) => {
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatMonthYear = (value) => {
  const d = new Date(value);
  const m = d.toLocaleDateString(undefined, { month: "short" });
  const y = String(d.getFullYear()).slice(-2);
  return `${m} '${y}`;
};

export default function StockChart({ series = null, height = 180, className = "" }) {
  const sortedSeries = useMemo(() => {
    if (!series || series.length === 0) return [];
    return [...series].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }, [series]);

  // Heuristiek: veel punten = langere range (1Y/2Y) => minder, grovere labels
  const isLongRange = sortedSeries.length > 220; // ~ > 1 jaar aan handelsdagen

  const tickFormatter = isLongRange ? formatMonthYear : formatShort;
  const labelFormatter = isLongRange ? formatMonthYear : formatShort;

  // Voor lange range: minder labels (rust)
  const tickCount = isLongRange ? 6 : 8;

  return (
    <div className={className} style={{ width: "100%", minWidth: 0 }}>
      {sortedSeries.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={sortedSeries}>
            <CartesianGrid stroke="#e9ecef" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="datetime"
              tickFormatter={tickFormatter}
              tick={{ fontSize: 11, fill: "#6c757d" }}
              tickLine={false}
              axisLine={false}
              tickCount={tickCount}
              interval="preserveStartEnd"
              minTickGap={28}
            />

            {/* Y-as blijft hidden; grid geeft context */}
            <YAxis dataKey="close" domain={["dataMin", "dataMax"]} hide />

            <Tooltip
              contentStyle={{ fontSize: "0.85rem" }}
              labelFormatter={labelFormatter}
            />

            <Line
              type="monotone"
              dataKey="close"
              stroke="#0d6efd"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height,
            borderRadius: "8px",
            border: "1px dashed #ccc",
          }}
        />
      )}
    </div>
  );
}

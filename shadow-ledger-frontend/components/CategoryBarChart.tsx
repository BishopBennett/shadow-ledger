"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CategoryBarChartProps {
  data: Array<{ category: string; amount: bigint }>;
}

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  const chartData = useMemo(() => {
    return data
      .map((item) => ({
        category: item.category,
        amount: Number(item.amount) / 100, // Convert from cents to dollars
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
        <p className="text-textSecondary text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
            />
            <Legend />
            <Bar dataKey="amount" fill="#6366F1" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};



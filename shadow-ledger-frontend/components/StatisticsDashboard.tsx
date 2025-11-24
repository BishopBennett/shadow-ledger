"use client";

import { useEffect, useMemo } from "react";
import { useStatistics } from "@/hooks/useStatistics";
import { Bill } from "@/hooks/useShadowLedger";
import { CategoryChart } from "./CategoryChart";
import { CategoryBarChart } from "./CategoryBarChart";

interface StatisticsDashboardProps {
  statistics: ReturnType<typeof useStatistics>;
  billCount: number;
  bills: Bill[];
}

export const StatisticsDashboard = ({
  statistics,
  billCount,
  bills,
}: StatisticsDashboardProps) => {
  // Extract categories from bills (for display only, no auto-decrypt)
  useEffect(() => {
    if (bills.length > 0) {
      statistics.getAllCategories(bills);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills.length]);

  const categoryData = useMemo(() => {
    const data: Array<{ category: string; amount: bigint }> = [];
    statistics.decryptedCategoryTotals.forEach((amount, category) => {
      data.push({ category, amount });
    });
    return data;
  }, [statistics.decryptedCategoryTotals]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-textSecondary mb-2">Total Bills</h3>
          <p className="text-3xl font-bold">{billCount}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-textSecondary mb-2">Total Amount</h3>
          {statistics.decryptedTotal !== undefined ? (
            <p className="text-3xl font-bold">
              {(Number(statistics.decryptedTotal) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          ) : statistics.totalAmountHandle ? (
            <button
              onClick={statistics.decryptTotalAmount}
              disabled={statistics.isLoading}
              className="text-sm text-accent hover:underline disabled:opacity-50"
            >
              Decrypt Total
            </button>
          ) : (
            <p className="text-textSecondary">Loading...</p>
          )}
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-textSecondary mb-2">Categories</h3>
          <p className="text-3xl font-bold">{statistics.categories.length}</p>
        </div>
      </div>

      {statistics.categories.length > 0 && categoryData.length === 0 && (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <button
            onClick={() => {
              const categories = Array.from(statistics.categories);
              if (categories.length > 0) {
                statistics.loadAndDecryptAllCategories(categories);
              }
            }}
            disabled={statistics.isLoading}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {statistics.isLoading ? "Decrypting..." : "Decrypt Category Statistics"}
          </button>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <CategoryChart data={categoryData} />
          <CategoryBarChart data={categoryData} />
        </div>
      )}
    </div>
  );
};


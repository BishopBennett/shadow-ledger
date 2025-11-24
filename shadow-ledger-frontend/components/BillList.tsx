"use client";

import { useCallback } from "react";
import { Bill } from "@/hooks/useShadowLedger";
import { DecryptedBill } from "@/hooks/useBillDecryption";

interface BillListProps {
  bills: Bill[];
  decryptBill: (handle: string) => Promise<bigint | null>;
  decryptBills: (handles: string[]) => Promise<Map<string, bigint>>;
  decryptedBills: Map<string, DecryptedBill>;
  isDecrypting: boolean;
  refreshBills: () => void;
  isRefreshing: boolean;
}

export const BillList = ({
  bills,
  decryptBill,
  decryptBills,
  decryptedBills,
  isDecrypting,
  refreshBills,
  isRefreshing,
}: BillListProps) => {
  const handleDecryptAll = useCallback(async () => {
    const handles = bills.map((b) => b.amountHandle);
    await decryptBills(handles);
  }, [bills, decryptBills]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bills ({bills.length})</h2>
        <div className="space-x-2">
          <button
            onClick={refreshBills}
            disabled={isRefreshing}
            className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          {bills.length > 0 && (
            <button
              onClick={handleDecryptAll}
              disabled={isDecrypting}
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt All"}
            </button>
          )}
        </div>
      </div>

      {bills.length === 0 ? (
        <p className="text-textSecondary text-center py-8">No bills yet. Create your first bill!</p>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => {
            const decrypted = decryptedBills.get(bill.amountHandle);
            return (
              <div
                key={bill.index}
                className="p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-primary">{bill.meta.category}</span>
                    <span className="text-textSecondary text-sm ml-2">
                      {formatDate(bill.meta.timestamp)}
                    </span>
                  </div>
                  {decrypted ? (
                    <span className="font-bold text-lg">
                      {(Number(decrypted.clear) / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ) : (
                    <button
                      onClick={() => decryptBill(bill.amountHandle)}
                      disabled={isDecrypting}
                      className="text-sm text-accent hover:underline disabled:opacity-50"
                    >
                      Decrypt
                    </button>
                  )}
                </div>
                {bill.meta.description && (
                  <p className="text-sm text-textSecondary">{bill.meta.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



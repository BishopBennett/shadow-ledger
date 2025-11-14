"use client";

import { useState } from "react";

interface BillFormProps {
  createBill: (amount: number, category: string, description: string) => void;
  canCreateBill: boolean;
  isCreating: boolean;
  message: string;
}

// Predefined bill categories for better organization
const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

export const BillForm = ({ createBill, canCreateBill, isCreating, message }: BillFormProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    const finalCategory = category === "Other" ? customCategory.trim() : category.trim();
    if (amountNum > 0 && finalCategory) {
      createBill(amountNum, finalCategory, description.trim());
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setDescription("");
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h2 className="text-2xl font-semibold mb-4">Create Bill</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {category === "Other" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background mt-2"
              placeholder="Enter custom category"
              required
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            rows={3}
            placeholder="Optional description"
          />
        </div>
        <button
          type="submit"
          disabled={!canCreateBill || isCreating}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? "Creating..." : "Create Bill"}
        </button>
        {message && (
          <p className="text-sm text-textSecondary">{message}</p>
        )}
      </form>
    </div>
  );
};



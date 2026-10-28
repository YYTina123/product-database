"use client";

import { createLocalStore } from "./local-store";
import sampleData from "./sample-expenses.json";

export type Expense = {
  id: string;
  date: string;
  category: string;
  item: string;
  amount: number;
  note: string;
};

export const EXPENSE_CATEGORIES = ["進貨成本", "薪資", "租金", "水電", "運費", "雜支"];

const store = createLocalStore<Expense>("expenses", sampleData);

export const saveExpenses = store.save;
export const useExpenses = store.useItems;
export const loadSampleExpenses = store.loadSample;

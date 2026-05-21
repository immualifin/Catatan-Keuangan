"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency, formatShortDate } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TransactionItemProps {
  transaction: Transaction;
  showLink?: boolean;
}

export function TransactionItem({ transaction, showLink = true }: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  const content = (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 relative",
          isIncome ? "bg-emerald-500/15" : "bg-rose-500/15"
        )}
      >
        <span>{transaction.category?.icon ?? "💳"}</span>
        {transaction.source === "scan" && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <ScanLine className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {transaction.description || transaction.category?.name || "Transaksi"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {transaction.category?.name}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground">
            {formatShortDate(transaction.transaction_date || transaction.transactionDate || "")}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            isIncome ? "bg-emerald-500/20" : "bg-rose-500/20"
          )}
        >
          {isIncome ? (
            <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowUpRight className="w-3 h-3 text-rose-500" />
          )}
        </div>
        <span
          className={cn(
            "text-sm font-semibold",
            isIncome ? "text-emerald-500" : "text-rose-400"
          )}
        >
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/transactions/${transaction.id}`} id={`trx-item-${transaction.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}

interface TransactionListProps {
  transactions: Transaction[];
  showLink?: boolean;
  emptyMessage?: string;
}

export function TransactionList({ transactions, showLink = true, emptyMessage = "Belum ada transaksi" }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <span className="text-3xl">📭</span>
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((trx) => (
        <TransactionItem key={trx.id} transaction={trx} showLink={showLink} />
      ))}
    </div>
  );
}

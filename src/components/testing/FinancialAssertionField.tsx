import { FinancialAssertion, FinancialCalcType } from "@/types/test-case";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  evaluateFinancialAssertion,
  hasFinancialData,
  formatCurrency,
  FINANCIAL_CALC_TYPES,
} from "@/lib/financial";
import { CheckCircle2, XCircle, Coins } from "lucide-react";

// Read-only summary chip showing expected vs actual and the computed verdict.
export function FinancialResultChip({
  financial,
}: {
  financial: FinancialAssertion | undefined;
}) {
  if (!hasFinancialData(financial)) {
    return <span className="text-gray-300 text-xs">—</span>;
  }
  const verdict = evaluateFinancialAssertion(financial);
  const currency = financial?.currency || "NGN";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
        <Coins className="h-3 w-3 text-gray-400" />
        <span className="tabular-nums">
          {formatCurrency(financial?.expectedAmount, currency)}
        </span>
        <span className="text-gray-300">vs</span>
        <span className="tabular-nums font-medium text-gray-800">
          {formatCurrency(financial?.actualAmount, currency)}
        </span>
      </div>
      {verdict !== null && (
        <Badge
          className={cn(
            "w-fit text-[9px] px-1.5 py-0 font-black uppercase tracking-wider border gap-1",
            verdict
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200",
          )}
        >
          {verdict ? (
            <CheckCircle2 className="h-2.5 w-2.5" />
          ) : (
            <XCircle className="h-2.5 w-2.5" />
          )}
          {verdict ? "Accurate" : "Mismatch"}
        </Badge>
      )}
    </div>
  );
}

// Compact editor for a financial assertion.
export function FinancialAssertionEditor({
  value,
  onChange,
}: {
  value: FinancialAssertion | undefined;
  onChange: (next: FinancialAssertion) => void;
}) {
  const fa = value || {};

  const update = (patch: Partial<FinancialAssertion>) => {
    onChange({ ...fa, ...patch });
  };

  const numOrUndef = (raw: string): number | undefined =>
    raw === "" ? undefined : Number(raw);

  return (
    <div className="space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
      <div className="flex items-center gap-1.5">
        <Coins className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
          Financial Accuracy
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold uppercase text-gray-400">
            Calculation
          </label>
          <select
            value={fa.calcType || ""}
            onChange={(e) =>
              update({
                calcType: (e.target.value || undefined) as
                  | FinancialCalcType
                  | undefined,
              })
            }
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">None</option>
            {FINANCIAL_CALC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-gray-400">
            Currency
          </label>
          <input
            type="text"
            value={fa.currency ?? "NGN"}
            onChange={(e) =>
              update({ currency: e.target.value.toUpperCase() || undefined })
            }
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] uppercase outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="NGN"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-gray-400">
            Expected
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={fa.expectedAmount ?? ""}
            onChange={(e) => update({ expectedAmount: numOrUndef(e.target.value) })}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] tabular-nums outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-gray-400">
            Actual
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={fa.actualAmount ?? ""}
            onChange={(e) => update({ actualAmount: numOrUndef(e.target.value) })}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] tabular-nums outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-gray-400">
            Tolerance (±)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={fa.tolerance ?? ""}
            onChange={(e) => update({ tolerance: numOrUndef(e.target.value) })}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] tabular-nums outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="0"
          />
        </div>
        <div className="flex items-end">
          <FinancialResultChip financial={fa} />
        </div>
      </div>
    </div>
  );
}

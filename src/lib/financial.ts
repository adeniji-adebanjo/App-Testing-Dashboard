import { FinancialAssertion } from "@/types/test-case";

// Rosabon QA Framework §2.1, §16-18 - financial accuracy evaluation.
// Returns true if the assertion passes within tolerance, false if it fails,
// and null when there is not enough data to evaluate (no expected/actual).
export function evaluateFinancialAssertion(
  financial: FinancialAssertion | undefined,
): boolean | null {
  if (
    !financial ||
    financial.expectedAmount == null ||
    financial.actualAmount == null ||
    Number.isNaN(financial.expectedAmount) ||
    Number.isNaN(financial.actualAmount)
  ) {
    return null;
  }
  const tolerance = Math.abs(financial.tolerance ?? 0);
  return (
    Math.abs(financial.expectedAmount - financial.actualAmount) <= tolerance
  );
}

// Absolute delta between expected and actual, or null if not evaluable.
export function financialDelta(
  financial: FinancialAssertion | undefined,
): number | null {
  if (
    !financial ||
    financial.expectedAmount == null ||
    financial.actualAmount == null
  ) {
    return null;
  }
  return Math.abs(financial.expectedAmount - financial.actualAmount);
}

export function hasFinancialData(
  financial: FinancialAssertion | undefined,
): boolean {
  return (
    !!financial &&
    (financial.expectedAmount != null ||
      financial.actualAmount != null ||
      !!financial.calcType)
  );
}

export function formatCurrency(
  amount: number | undefined | null,
  currency = "NGN",
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export const FINANCIAL_CALC_TYPES: { value: string; label: string }[] = [
  { value: "interest", label: "Interest" },
  { value: "roi", label: "ROI" },
  { value: "maturity", label: "Maturity" },
  { value: "balance", label: "Balance" },
  { value: "fee", label: "Fee" },
  { value: "penalty", label: "Penalty" },
];

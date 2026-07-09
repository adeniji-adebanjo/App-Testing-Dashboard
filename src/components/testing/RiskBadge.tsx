import { RiskLevel } from "@/types/test-case";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, AlertTriangle, Shield, Info } from "lucide-react";

// Rosabon QA Framework §7 - risk badge used to make risk classification
// visible wherever test cases and modules are shown.
const RISK_STYLES: Record<
  RiskLevel,
  { label: string; className: string; Icon: typeof ShieldAlert }
> = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 border-red-200",
    Icon: ShieldAlert,
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    Icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Icon: Shield,
  },
  low: {
    label: "Low",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    Icon: Info,
  },
};

interface RiskBadgeProps {
  risk: RiskLevel | undefined;
  className?: string;
  showIcon?: boolean;
}

export default function RiskBadge({
  risk,
  className,
  showIcon = true,
}: RiskBadgeProps) {
  if (!risk) return null;
  const { label, className: riskClass, Icon } = RISK_STYLES[risk];

  return (
    <Badge
      className={cn(
        "text-[9px] px-1.5 py-0 font-black uppercase tracking-wider border gap-1",
        riskClass,
        className,
      )}
      title={`Risk level: ${label}`}
    >
      {showIcon && <Icon className="h-2.5 w-2.5" />}
      {label}
    </Badge>
  );
}

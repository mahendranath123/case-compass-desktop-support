
import { CaseStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CaseStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge = ({ 
  status, 
  showLabel = true, 
  size = "md" 
}: StatusBadgeProps) => {
  const getStatusClass = () => {
    switch (status) {
      case "Pending":
        return "status-badge-pending";
      case "Overdue":
        return "status-badge-overdue";
      case "Completed":
        return "status-badge-completed";
      case "OnHold":
        return "status-badge-onhold";
      default:
        return "";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "lg":
        return "w-4 h-4";
      case "md":
      default:
        return "w-3 h-3";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("status-badge", getStatusClass(), getSizeClass())}></span>
      {showLabel && <span>{status}</span>}
    </div>
  );
};

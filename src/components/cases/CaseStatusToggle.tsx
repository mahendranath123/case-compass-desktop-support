
import { Button } from "@/components/ui/button";
import { CaseStatus } from "@/types";
import { cn } from "@/lib/utils";

interface CaseStatusToggleProps {
  currentStatus: CaseStatus;
  onStatusChange: (status: CaseStatus) => void;
}

export const CaseStatusToggle = ({ 
  currentStatus, 
  onStatusChange 
}: CaseStatusToggleProps) => {
  const statuses: { value: CaseStatus; label: string; color: string }[] = [
    { 
      value: "Pending", 
      label: "🟡 Pending", 
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
    },
    { 
      value: "Overdue", 
      label: "🔴 Overdue", 
      color: "bg-red-100 text-red-800 hover:bg-red-200" 
    },
    { 
      value: "Completed", 
      label: "🟢 Completed", 
      color: "bg-green-100 text-green-800 hover:bg-green-200" 
    },
    { 
      value: "OnHold", 
      label: "⚪ On Hold", 
      color: "bg-gray-100 text-gray-800 hover:bg-gray-200" 
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant="outline"
          className={cn(
            status.color,
            "border",
            currentStatus === status.value ? "ring-2 ring-primary" : ""
          )}
          onClick={() => onStatusChange(status.value)}
        >
          {status.label}
        </Button>
      ))}
    </div>
  );
};

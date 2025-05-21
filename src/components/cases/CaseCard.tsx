
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { Case, Lead } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface CaseCardProps {
  caseItem: Case;
  lead: Lead | undefined;
}

export const CaseCard = ({ caseItem, lead }: CaseCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/case/${caseItem.id}`);
  };
  
  return (
    <Card 
      className="card-hover cursor-pointer animate-fade-in"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">
              Lead #{caseItem.leadCkt}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {lead?.cust_name || "Unknown Customer"}
            </p>
          </div>
          <StatusBadge status={caseItem.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Contact:</p>
            <p>{lead?.contact_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">IP Address:</p>
            <p>{caseItem.ipAddress}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Connectivity:</p>
            <p>{caseItem.connectivity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due in:</p>
            <p className={caseItem.status === "Overdue" ? "text-status-overdue font-medium" : ""}>
              {formatDistanceToNow(new Date(caseItem.dueDate), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

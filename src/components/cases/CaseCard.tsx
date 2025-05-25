
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { Case, Lead } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useData } from "@/contexts/LocalDataContext";
import { useState } from "react";

interface CaseCardProps {
  caseItem: Case;
  lead: Lead | undefined;
}

export const CaseCard = ({ caseItem, lead }: CaseCardProps) => {
  const navigate = useNavigate();
  const { deleteCase } = useData();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleClick = () => {
    navigate(`/case/${caseItem.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    setIsDeleting(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      deleteCase(caseItem.id);
      setIsDeleting(false);
    }, 300);
  };
  
  // Parse the ISO string to get the formatted time
  const formattedAssignedDate = caseItem.assignedDate 
    ? format(new Date(caseItem.assignedDate), "PPP p") 
    : "N/A";

  const formattedDueDate = caseItem.dueDate
    ? format(new Date(caseItem.dueDate), "PPP p")
    : "N/A";
  
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
            <p className="text-muted-foreground">Due:</p>
            <p className={caseItem.status === "Overdue" ? "text-status-overdue font-medium" : ""}>
              {formatDistanceToNow(new Date(caseItem.dueDate), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">Assigned:</p>
          <p>{formattedAssignedDate}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-2 pb-3">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 px-3"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
};

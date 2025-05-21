
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { CaseStatusToggle } from "@/components/cases/CaseStatusToggle";
import { Case, Lead, CaseStatus } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { cases, leads, updateCase, deleteCase } = useData();
  const navigate = useNavigate();
  
  const [caseDetails, setCaseDetails] = useState<Case | null>(null);
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Editable fields
  const [ipAddress, setIpAddress] = useState("");
  const [connectivity, setConnectivity] = useState<"Stable" | "Unstable" | "Unknown">("Stable");
  const [caseRemarks, setCaseRemarks] = useState("");
  const [status, setStatus] = useState<CaseStatus>("Pending");
  const [assignedTime, setAssignedTime] = useState("");
  const [dueTime, setDueTime] = useState("");

  useEffect(() => {
    if (id) {
      const foundCase = cases.find((c) => c.id === id);
      if (foundCase) {
        setCaseDetails(foundCase);
        setStatus(foundCase.status);
        setIpAddress(foundCase.ipAddress);
        setConnectivity(foundCase.connectivity);
        setCaseRemarks(foundCase.caseRemarks);
        
        // Extract time from dates
        const assignedDate = new Date(foundCase.assignedDate);
        setAssignedTime(format(assignedDate, "HH:mm"));
        
        const dueDate = new Date(foundCase.dueDate);
        setDueTime(format(dueDate, "HH:mm"));
        
        const foundLead = leads.find((l) => l.ckt === foundCase.leadCkt);
        if (foundLead) {
          setLeadDetails(foundLead);
        }
      } else {
        toast.error("Case not found");
        navigate("/cases");
      }
    }
  }, [id, cases, leads, navigate]);

  const handleSave = () => {
    if (!caseDetails) return;
    
    // Update the date with time
    const assignedDate = new Date(caseDetails.assignedDate);
    const [assignedHours, assignedMinutes] = assignedTime.split(":");
    assignedDate.setHours(parseInt(assignedHours), parseInt(assignedMinutes));
    
    const dueDate = new Date(caseDetails.dueDate);
    const [dueHours, dueMinutes] = dueTime.split(":");
    dueDate.setHours(parseInt(dueHours), parseInt(dueMinutes));
    
    const updatedCase: Case = {
      ...caseDetails,
      ipAddress,
      connectivity,
      caseRemarks,
      status,
      assignedDate: assignedDate.toISOString(),
      dueDate: dueDate.toISOString(),
    };
    
    updateCase(updatedCase);
    setCaseDetails(updatedCase);
    setEditMode(false);
  };

  const handleDelete = () => {
    if (!caseDetails) return;
    deleteCase(caseDetails.id);
    toast.success("Case deleted successfully");
    navigate("/cases");
  };

  if (!caseDetails || !leadDetails) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin-slow">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(caseDetails.dueDate) < new Date() && caseDetails.status !== "Completed";
  const formattedAssignedDate = format(new Date(caseDetails.assignedDate), "PPP");
  const formattedAssignedTime = format(new Date(caseDetails.assignedDate), "p");
  const formattedDueDate = format(new Date(caseDetails.dueDate), "PPP");
  const formattedDueTime = format(new Date(caseDetails.dueDate), "p");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Case Details: {caseDetails.leadCkt}
            <StatusBadge status={caseDetails.status} />
          </h1>
          <p className="text-muted-foreground">
            {leadDetails.cust_name} - Created {formattedAssignedDate}
          </p>
        </div>
        
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete case?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the case for lead {caseDetails.leadCkt}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={() => setEditMode(true)}>Edit Case</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{leadDetails.cust_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{leadDetails.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Person</p>
              <p className="font-medium">{leadDetails.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{leadDetails.email_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bandwidth</p>
              <p className="font-medium">{leadDetails.bandwidth}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Device</p>
              <p className="font-medium">{leadDetails.device}</p>
            </div>
            {leadDetails.remarks && (
              <div>
                <p className="text-sm text-muted-foreground">Lead Remarks</p>
                <p className="font-medium">{leadDetails.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            {isOverdue && !editMode && (
              <CardDescription className="text-status-overdue font-medium">
                This case is overdue!
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                {editMode ? (
                  <>
                    <Label>Assigned Date</Label>
                    <p className="font-medium">{formattedAssignedDate}</p>
                    
                    <Label htmlFor="assignedTime">Assigned Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        id="assignedTime"
                        type="time"
                        value={assignedTime} 
                        onChange={e => setAssignedTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Assigned Date & Time</p>
                    <p className="font-medium">{formattedAssignedDate} at {formattedAssignedTime}</p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                {editMode ? (
                  <>
                    <Label>Due Date</Label>
                    <p className="font-medium">{formattedDueDate}</p>
                    
                    <Label htmlFor="dueTime">Due Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        id="dueTime"
                        type="time"
                        value={dueTime} 
                        onChange={e => setDueTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Due Date & Time</p>
                    <p className={`font-medium ${isOverdue ? "text-status-overdue" : ""}`}>
                      {formattedDueDate} at {formattedDueTime}
                      <span className="text-sm ml-2">
                        ({formatDistanceToNow(new Date(caseDetails.dueDate), { addSuffix: true })})
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {editMode ? (
                <>
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input 
                    id="ipAddress"
                    value={ipAddress} 
                    onChange={e => setIpAddress(e.target.value)} 
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{caseDetails.ipAddress}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              {editMode ? (
                <div className="space-y-2">
                  <Label>Connectivity</Label>
                  <RadioGroup
                    value={connectivity}
                    onValueChange={(value) => setConnectivity(value as "Stable" | "Unstable" | "Unknown")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Stable" id="stable" />
                      <Label htmlFor="stable" className="cursor-pointer">Stable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unstable" id="unstable" />
                      <Label htmlFor="unstable" className="cursor-pointer">Unstable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unknown" id="unknown" />
                      <Label htmlFor="unknown" className="cursor-pointer">Unknown</Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Connectivity</p>
                  <p className="font-medium">{caseDetails.connectivity}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              {editMode ? (
                <>
                  <Label htmlFor="caseRemarks">Case Remarks</Label>
                  <Textarea
                    id="caseRemarks"
                    value={caseRemarks}
                    onChange={e => setCaseRemarks(e.target.value)}
                    className="min-h-[100px]"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Case Remarks</p>
                  <p className="font-medium whitespace-pre-wrap">{caseDetails.caseRemarks}</p>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Status</p>
              {editMode ? (
                <CaseStatusToggle
                  currentStatus={status}
                  onStatusChange={setStatus}
                />
              ) : (
                <StatusBadge status={caseDetails.status} showLabel size="lg" />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => navigate("/cases")}>
              Back to Cases
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

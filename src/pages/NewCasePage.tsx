
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CaseStatusToggle } from "@/components/cases/CaseStatusToggle";
import { CaseStatus, Connectivity, Lead } from "@/types";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Clock, Search, Building, MapPin, User, Phone, Mail } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormValues {
  leadCkt: string;
  companyName: string;
  address: string;
  contactPerson: string;
  contactInfo: string;
  ipAddress: string;
  connectivity: Connectivity;
  assignedDate: Date;
  assignedTime: string;
  dueDate: Date;
  dueTime: string;
  caseRemarks: string;
}

export const NewCasePage = () => {
  const { leads, addCase, getLeadByCkt, searchLeads } = useData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CaseStatus>("Pending");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      leadCkt: "",
      companyName: "",
      address: "",
      contactPerson: "",
      contactInfo: "",
      ipAddress: "",
      connectivity: "Stable",
      assignedDate: new Date(),
      assignedTime: format(new Date(), "HH:mm"),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      dueTime: "17:00",
      caseRemarks: "",
    },
  });
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchLeads(searchQuery);
      setSearchResults(results);
      setIsSearchDialogOpen(true);
    } else {
      toast.error("Please enter a search term");
    }
  };
  
  // Update form fields when lead changes
  useEffect(() => {
    if (selectedLead) {
      form.setValue("leadCkt", selectedLead.ckt);
      form.setValue("companyName", selectedLead.cust_name || "");
      form.setValue("address", selectedLead.address || "");
      form.setValue("contactPerson", selectedLead.contact_name || "");
      form.setValue("contactInfo", selectedLead.email_id || "");
      form.setValue("ipAddress", selectedLead.usable_ip_address || "");
    }
  }, [selectedLead, form]);

  const onSubmit = (values: FormValues) => {
    if (!values.leadCkt) {
      toast.error("Please select a lead");
      return;
    }

    // Format dates with times
    const assignedDateTime = new Date(values.assignedDate);
    const [assignedHours, assignedMinutes] = values.assignedTime.split(":");
    assignedDateTime.setHours(parseInt(assignedHours), parseInt(assignedMinutes));

    const dueDateTime = new Date(values.dueDate);
    const [dueHours, dueMinutes] = values.dueTime.split(":");
    dueDateTime.setHours(parseInt(dueHours), parseInt(dueMinutes));

    addCase({
      leadCkt: values.leadCkt,
      ipAddress: values.ipAddress,
      connectivity: values.connectivity,
      assignedDate: assignedDateTime.toISOString(),
      dueDate: dueDateTime.toISOString(),
      caseRemarks: values.caseRemarks,
      status,
    });

    navigate("/cases");
  };
  
  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSearchDialogOpen(false);
    setSearchQuery(lead.ckt);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Create New Case</h1>
        <p className="text-muted-foreground">Create a new support case for a customer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>
            Search for a lead and fill in the case details
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Lead Search */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Lead Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Search for a lead to auto-fill customer information
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Search Lead</FormLabel>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter lead number or customer name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleSearch}>
                        <Search className="h-4 w-4 mr-1" /> Search
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Company Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>Company Name</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Address</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Contact Person</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>Phone/Email</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="leadCkt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Case Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Case Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the technical details for this case
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="connectivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connectivity</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Stable" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Stable
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Unstable" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Unstable
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Unknown" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Unknown
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="assignedDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Assigned Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned Time</FormLabel>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                className="pl-10"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Time</FormLabel>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                className="pl-10"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="caseRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter case specific notes"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Case Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the current status of this case
                  </p>
                </div>
                
                <CaseStatusToggle
                  currentStatus={status}
                  onStatusChange={setStatus}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cases")}
              >
                Cancel
              </Button>
              <Button type="submit">Create Case</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Lead Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Select a lead from the search results
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((lead) => (
                  <div 
                    key={lead.ckt}
                    className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleLeadSelect(lead)}
                  >
                    <div className="font-medium">{lead.ckt}</div>
                    <div className="text-sm text-muted-foreground">{lead.cust_name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No leads found. Try a different search term.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

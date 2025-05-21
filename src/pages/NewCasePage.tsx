
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CaseStatusToggle } from "@/components/cases/CaseStatusToggle";
import { CaseStatus, Connectivity } from "@/types";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface FormValues {
  leadCkt: string;
  ipAddress: string;
  connectivity: Connectivity;
  assignedDate: Date;
  dueDate: Date;
  caseRemarks: string;
}

export const NewCasePage = () => {
  const { leads, addCase, getLeadByCkt } = useData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CaseStatus>("Pending");
  const [selectedLead, setSelectedLead] = useState(leads[0] || null);

  const form = useForm<FormValues>({
    defaultValues: {
      leadCkt: "",
      ipAddress: "",
      connectivity: "Stable",
      assignedDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      caseRemarks: "",
    },
  });
  
  // Update IP address when lead changes
  useEffect(() => {
    if (selectedLead) {
      form.setValue("ipAddress", selectedLead.usable_ip_address || "");
    }
  }, [selectedLead, form]);

  const onSubmit = (values: FormValues) => {
    if (!values.leadCkt) {
      toast.error("Please select a lead");
      return;
    }

    addCase({
      leadCkt: values.leadCkt,
      ipAddress: values.ipAddress,
      connectivity: values.connectivity,
      assignedDate: values.assignedDate.toISOString().split('T')[0],
      dueDate: values.dueDate.toISOString().split('T')[0],
      caseRemarks: values.caseRemarks,
      status,
    });

    navigate("/cases");
  };
  
  const handleLeadChange = (value: string) => {
    form.setValue("leadCkt", value);
    const lead = getLeadByCkt(value);
    setSelectedLead(lead || null);
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
            Select a lead and fill in the case details
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Lead Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Lead Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a lead to auto-fill customer information
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="leadCkt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Number</FormLabel>
                      <Select
                        onValueChange={handleLeadChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leads.map((lead) => (
                            <SelectItem key={lead.ckt} value={lead.ckt}>
                              {lead.ckt} - {lead.cust_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Auto-filled Lead Info */}
                {selectedLead && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">Company Name</p>
                      <p className="text-sm">{selectedLead.cust_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm">{selectedLead.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact Person</p>
                      <p className="text-sm">{selectedLead.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm">{selectedLead.email_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bandwidth</p>
                      <p className="text-sm">{selectedLead.bandwidth}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Device</p>
                      <p className="text-sm">{selectedLead.device}</p>
                    </div>
                  </div>
                )}
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
    </div>
  );
};

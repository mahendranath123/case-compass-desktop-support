
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { CaseCard } from "@/components/cases/CaseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Case, Lead } from "@/types";
import { PlusCircle } from "lucide-react";

export const CasesPage = () => {
  const { cases, leads } = useData();
  const [filteredCases, setFilteredCases] = useState<Case[]>(cases);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("recent");

  useEffect(() => {
    let result = [...cases];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Apply search filter (by lead number/ckt or customer name)
    if (searchTerm) {
      result = result.filter(c => 
        c.leadCkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leads.find(l => l.ckt === c.leadCkt)?.cust_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        // Sort by assigned date (most recent first)
        result.sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
        break;
      case "due-soon":
        // Sort by due date (soonest first)
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case "customer":
        // Sort by customer name
        result.sort((a, b) => {
          const customerA = leads.find(l => l.ckt === a.leadCkt)?.cust_name || "";
          const customerB = leads.find(l => l.ckt === b.leadCkt)?.cust_name || "";
          return customerA.localeCompare(customerB);
        });
        break;
    }

    setFilteredCases(result);
  }, [cases, statusFilter, searchTerm, sortBy, leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Cases</h1>
          <p className="text-muted-foreground">View and manage all support cases</p>
        </div>
        <Button asChild>
          <Link to="/new-case" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Case
          </Link>
        </Button>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search by lead number or customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:flex">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="OnHold">OnHold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="due-soon">Due Soon</SelectItem>
              <SelectItem value="customer">Customer Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              lead={leads.find((l) => l.ckt === caseItem.leadCkt)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground mb-4">No cases matching your filters</p>
            <Button asChild>
              <Link to="/new-case">Create New Case</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

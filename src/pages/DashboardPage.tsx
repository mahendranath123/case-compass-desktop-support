
import { useEffect, useState } from "react";
import { useData } from "@/contexts/LocalDataContext";
import { CaseCard } from "@/components/cases/CaseCard";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Case, CaseStatus } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DashboardPage = () => {
  const { cases, leads } = useData();
  const [filteredCases, setFilteredCases] = useState<Case[]>(cases);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Status counts for the chart
  const statusCounts = {
    Pending: cases.filter(c => c.status === "Pending").length,
    Overdue: cases.filter(c => c.status === "Overdue").length,
    Completed: cases.filter(c => c.status === "Completed").length,
    OnHold: cases.filter(c => c.status === "OnHold").length,
  };

  const chartData = [
    { name: 'Pending', value: statusCounts.Pending, color: '#F9D923' },
    { name: 'Overdue', value: statusCounts.Overdue, color: '#EB5353' },
    { name: 'Completed', value: statusCounts.Completed, color: '#36AE7C' },
    { name: 'OnHold', value: statusCounts.OnHold, color: '#D3D3D3' },
  ];

  useEffect(() => {
    let result = cases;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Apply search filter (by lead number/ckt)
    if (searchTerm) {
      result = result.filter(c => 
        c.leadCkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leads.find(l => l.ckt === c.leadCkt)?.cust_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCases(result);
  }, [cases, statusFilter, searchTerm, leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of support cases</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="status-badge status-badge-pending mr-2"></div>
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.Pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="status-badge status-badge-overdue mr-2"></div>
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.Overdue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="status-badge status-badge-completed mr-2"></div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.Completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="status-badge status-badge-onhold mr-2"></div>
              On Hold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.OnHold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Case Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases.slice(0, 5).map(caseItem => (
                <div key={caseItem.id} className="flex items-center justify-between bg-background rounded-lg p-3 shadow-sm">
                  <div>
                    <div className="font-medium">{caseItem.leadCkt}</div>
                    <div className="text-sm text-muted-foreground">
                      {leads.find(l => l.ckt === caseItem.leadCkt)?.cust_name || "Unknown Customer"}
                    </div>
                  </div>
                  <StatusBadge status={caseItem.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by lead number or customer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="OnHold">OnHold</SelectItem>
          </SelectContent>
        </Select>
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
          <p className="col-span-3 text-center py-8 text-muted-foreground">
            No cases matching your filters
          </p>
        )}
      </div>
    </div>
  );
};

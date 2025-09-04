import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FileCheck } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TAReports() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedEmployee, setSelectedEmployee] = useState("");
  
  // Fetch tour advances
  const { data: tourAdvances = [] } = useQuery({ queryKey: ["/api/tour-advances"] });
  const { data: users = [] } = useQuery({ queryKey: ["/api/users"] });

  // Filter tour advances by selected month
  const filteredTourAdvances = tourAdvances.filter((ta: any) => {
    const matchesMonth = !selectedMonth || format(new Date(ta.tourStartDate), "yyyy-MM") === selectedMonth;
    const matchesEmployee = !selectedEmployee || selectedEmployee === "all" || ta.employeeId === selectedEmployee;
    return matchesMonth && matchesEmployee;
  });

  // Generate PDF report
  const generateTAReport = (ta: any) => {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TA EXPENSES', 105, 20, { align: 'center' });
    
    // Employee Details Table
    const employeeData = [
      ['Employee Name:', ta.employeeName || '', 'Purpose of Trip', ta.purposeOfTrip || ''],
      ['Designation:', ta.designation || '', 'Party Visit', ta.partyVisit || ''],
      ['State Name:', ta.state || '', '', '']
    ];
    
    autoTable(doc, {
      startY: 30,
      head: [],
      body: employeeData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        2: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }
    });

    // Travel Details
    const travelData = [
      ['Travel Details'],
      [`From: ${ta.segments?.[0]?.fromLocation || 'N/A'}`],
      [`To: ${ta.segments?.[0]?.toLocation || 'N/A'}`]
    ];

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    autoTable(doc, {
      startY: finalY,
      head: [],
      body: travelData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // Expense Categories
    const expenseCategories = [
      ['Food and Accommodation Expenses', '', '', '', '', '', '', '', ''],
      ['Usage of Personal Car in KMS:', '', '', '', '', '', '', '', ''],
      ['Room Rent:', '', '', '', '', '', '', '', '0.00'],
      ['Water:', '', '', '', '', '', '', '', '0.00'],
      ['Breakfast:', '', '', '', '', '', '', '', '0.00'],
      ['Lunch:', '', '', '', '', '', '', '', '0.00'],
      ['Dinner:', '', '', '', '', '', '', '', '0.00'],
      ['Travel & Other Expenses', '', '', '', '', '', '', '', ''],
      ['Usage Rate Rs./KM', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00'],
      ['TRAIN/Air Ticket:', '', '', '', '', '', '', '', '0.00'],
      ['AUTO/Taxi :', '', '', '', '', '', '', '', '0.00'],
      ['Rent A Car:', '', '', '', '', '', '', '', '0.00'],
      ['Other Transport:', '', '', '', '', '', '', '', '0.00'],
      ['Telephone:', '', '', '', '', '', '', '', '0.00'],
      ['Tolls:', '', '', '', '', '', '', '', '0.00'],
      ['Parking:', '', '', '', '', '', '', '', '0.00'],
      ['Diesel/petrol:', '', '', '', '', '', '', '', '0.00'],
      ['Other:', '', '', '', '', '', '', '', '0.00'],
      ['Daily Total', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00']
    ];

    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    autoTable(doc, {
      startY: finalY,
      head: [['Date', 'Date', 'Date', 'Date', 'DATE', 'Date', 'Date', 'Date', 'Date']],
      body: expenseCategories,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 35 }
      }
    });

    // Footer Information
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    const footerData = [
      ['Date of Submission', '', 'Approved By:', '', 'Total Expense Amount', '0.00'],
      ['', '', '', '', 'Amount in Words', ''],
      ['Employee Signature', '', 'Senior Accountant', '', '', '']
    ];

    autoTable(doc, {
      startY: finalY,
      head: [],
      body: footerData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // Save PDF
    doc.save(`TA_Expenses_${ta.employeeName}_${format(new Date(ta.tourStartDate), 'yyyy-MM')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TA Expense Reports</h1>
          <p className="text-gray-600">Monthly tour advance and expense reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full"
                data-testid="input-month-filter"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger data-testid="select-employee-filter">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TA Reports Grid */}
      <div className="grid gap-4">
        {filteredTourAdvances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No TA Records Found</h3>
              <p className="text-muted-foreground">No tour advance records found for the selected criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTourAdvances.map((ta: any) => (
            <Card key={ta.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ta.employeeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {ta.designation} • {ta.department}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ta.tourStartDate), "MMM dd")} - {format(new Date(ta.tourEndDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ta.status === 'SETTLED' ? 'default' : 'secondary'}>
                      {ta.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateTAReport(ta)}
                      data-testid={`button-download-ta-${ta.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Purpose:</span>
                    <p>{ta.purposeOfTrip || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Destination:</span>
                    <p>{ta.mainDestination || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Travel Mode:</span>
                    <p>{ta.modeOfTravel || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Advance Amount:</span>
                    <p>{ta.advanceRequired ? `₹${ta.advanceAmountRequested || 0}` : 'Not Required'}</p>
                  </div>
                </div>
                
                {ta.segments && ta.segments.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-sm">Travel Segments:</span>
                    <div className="mt-2 space-y-2">
                      {ta.segments.map((segment: any, index: number) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                          <strong>Segment {segment.segmentNumber || index + 1}:</strong> {segment.fromLocation} → {segment.toLocation}
                          <br />
                          <span className="text-muted-foreground">
                            {format(new Date(segment.departureDate), "MMM dd, HH:mm")} - {format(new Date(segment.arrivalDate), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
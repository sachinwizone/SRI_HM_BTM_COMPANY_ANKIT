import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Upload, FileCheck } from "lucide-react";
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
      [`From: ${ta.segments?.[0]?.fromLocation || ta.mainDestination || 'N/A'}`],
      [`To: ${ta.segments?.[ta.segments?.length - 1]?.toLocation || ta.mainDestination || 'N/A'}`]
    ];

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    autoTable(doc, {
      startY: finalY,
      head: [],
      body: travelData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // Parse daily expenses data
    let dailyExpenses = {};
    try {
      dailyExpenses = ta.dailyExpenses ? (typeof ta.dailyExpenses === 'string' ? JSON.parse(ta.dailyExpenses) : ta.dailyExpenses) : {};
    } catch (e) {
      console.error('Error parsing daily expenses:', e);
      dailyExpenses = {};
    }

    // Helper function to get expense value for a category and day
    const getExpenseValue = (category: string, dayIndex: number) => {
      const value = dailyExpenses[category]?.[dayIndex] || 0;
      return value.toFixed(2);
    };

    // Helper function to get total for a category across all days
    const getCategoryTotal = (category: string) => {
      const categoryData = dailyExpenses[category] || {};
      const total = Object.values(categoryData).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
      return total.toFixed(2);
    };

    // Helper function to get daily total for a specific day
    const getDayTotal = (dayIndex: number) => {
      let total = 0;
      // Sum all detailed expense categories
      const allCategories = ['PERSONAL_CAR_KMS', 'ROOM_RENT', 'WATER', 'BREAKFAST', 'LUNCH', 'DINNER',
                            'USAGE_RATE_PER_KM', 'TRAIN_AIR_TICKET', 'AUTO_TAXI', 'RENT_A_CAR', 
                            'OTHER_TRANSPORT', 'TELEPHONE', 'TOLLS', 'PARKING', 'DIESEL_PETROL', 'OTHER'];
      allCategories.forEach(category => {
        total += parseFloat(dailyExpenses[category]?.[dayIndex] || 0);
      });
      return total.toFixed(2);
    };

    // Generate columns for each day
    const numberOfDays = ta.numberOfDays || 5;
    const dayColumns = [];
    for (let i = 0; i < numberOfDays; i++) {
      dayColumns.push(i);
    }

    // Helper function to get group total
    const getGroupTotal = (categories: string[]) => {
      return categories.reduce((total, cat) => total + parseFloat(getCategoryTotal(cat)), 0).toFixed(2);
    };

    // Food & Accommodation categories
    const foodCategories = ['PERSONAL_CAR_KMS', 'ROOM_RENT', 'WATER', 'BREAKFAST', 'LUNCH', 'DINNER'];
    // Travel & Other categories  
    const travelCategories = ['USAGE_RATE_PER_KM', 'TRAIN_AIR_TICKET', 'AUTO_TAXI', 'RENT_A_CAR', 'OTHER_TRANSPORT', 'TELEPHONE', 'TOLLS', 'PARKING', 'DIESEL_PETROL', 'OTHER'];

    // Expense Categories with actual data
    const expenseCategories = [
      ['Food and Accommodation Expenses', ...dayColumns.map(() => ''), getGroupTotal(foodCategories)],
      ['Usage of Personal Car in KMS:', ...dayColumns.map(i => getExpenseValue('PERSONAL_CAR_KMS', i)), getCategoryTotal('PERSONAL_CAR_KMS')],
      ['Room Rent:', ...dayColumns.map(i => getExpenseValue('ROOM_RENT', i)), getCategoryTotal('ROOM_RENT')],
      ['Water:', ...dayColumns.map(i => getExpenseValue('WATER', i)), getCategoryTotal('WATER')],
      ['Breakfast:', ...dayColumns.map(i => getExpenseValue('BREAKFAST', i)), getCategoryTotal('BREAKFAST')],
      ['Lunch:', ...dayColumns.map(i => getExpenseValue('LUNCH', i)), getCategoryTotal('LUNCH')],
      ['Dinner:', ...dayColumns.map(i => getExpenseValue('DINNER', i)), getCategoryTotal('DINNER')],
      ['Travel & Other Expenses', ...dayColumns.map(() => ''), getGroupTotal(travelCategories)],
      ['Usage Rate Rs./KM', ...dayColumns.map(i => getExpenseValue('USAGE_RATE_PER_KM', i)), getCategoryTotal('USAGE_RATE_PER_KM')],
      ['TRAIN/Air Ticket:', ...dayColumns.map(i => getExpenseValue('TRAIN_AIR_TICKET', i)), getCategoryTotal('TRAIN_AIR_TICKET')],
      ['AUTO/Taxi :', ...dayColumns.map(i => getExpenseValue('AUTO_TAXI', i)), getCategoryTotal('AUTO_TAXI')],
      ['Rent A Car:', ...dayColumns.map(i => getExpenseValue('RENT_A_CAR', i)), getCategoryTotal('RENT_A_CAR')],
      ['Other Transport:', ...dayColumns.map(i => getExpenseValue('OTHER_TRANSPORT', i)), getCategoryTotal('OTHER_TRANSPORT')],
      ['Telephone:', ...dayColumns.map(i => getExpenseValue('TELEPHONE', i)), getCategoryTotal('TELEPHONE')],
      ['Tolls:', ...dayColumns.map(i => getExpenseValue('TOLLS', i)), getCategoryTotal('TOLLS')],
      ['Parking:', ...dayColumns.map(i => getExpenseValue('PARKING', i)), getCategoryTotal('PARKING')],
      ['Diesel/petrol:', ...dayColumns.map(i => getExpenseValue('DIESEL_PETROL', i)), getCategoryTotal('DIESEL_PETROL')],
      ['Other:', ...dayColumns.map(i => getExpenseValue('OTHER', i)), getCategoryTotal('OTHER')],
      ['Daily Total', ...dayColumns.map(i => getDayTotal(i)), dayColumns.reduce((sum, i) => sum + parseFloat(getDayTotal(i)), 0).toFixed(2)]
    ];

    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Generate date headers
    const dateHeaders = ['Date'];
    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(ta.tourStartDate);
      date.setDate(date.getDate() + i);
      dateHeaders.push(format(date, 'MMM dd'));
    }
    dateHeaders.push('Total');

    autoTable(doc, {
      startY: finalY,
      head: [dateHeaders],
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
    
    // Calculate grand total
    const grandTotal = dayColumns.reduce((sum, i) => sum + parseFloat(getDayTotal(i)), 0);
    
    const footerData = [
      ['Date of Submission', '', 'Approved By:', '', 'Total Expense Amount', `₹${grandTotal.toFixed(2)}`],
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => {
              const csv = filteredTourAdvances.map((ta: any) => 
                `${ta.id},${ta.employeeName || ''},${ta.designation || ''},${ta.state || ''},${ta.purposeOfTrip || ''},${ta.tourStartDate},${ta.tourEndDate},${ta.advanceAmount || ''}`
              ).join('\n');
              const header = 'Request ID,Employee Name,Designation,State,Purpose,Tour Start Date,Tour End Date,Advance Amount\n';
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + csv));
              element.setAttribute('download', `ta_requests_${new Date().toISOString().split('T')[0]}.csv`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
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
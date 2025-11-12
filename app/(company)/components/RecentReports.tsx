import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const reportTabs = ["All Reports", "Published", "Approved", "Under Review", "Drafts"];

const reportsData = [
  {
    title: "Q3 2024 ESG Performance Report",
    type: "Quarterly",
    submissionDate: "2021-01-01",
    status: "Published",
  },
  {
    title: "2024 Sustainability Snapshot",
    type: "Annual",
    submissionDate: "2020-08-08",
    status: "Rejected",
  },
  {
    title: "H1 2024 Social Impact Report",
    type: "Bi-Annual",
    submissionDate: "2025-12-12",
    status: "Under Review",
  },
  {
    title: "Q2 2024 Environmental Data Submission",
    type: "Sustainability",
    submissionDate: "2020-08-08",
    status: "Approved",
  },
  {
    title: "2023 Governance and Compliance Summary",
    type: "Compliance",
    submissionDate: "2022-10-10",
    status: "Draft",
  },
  {
    title: "Q1 2024 Investor ESG Disclosure",
    type: "Quarterly",
    submissionDate: "2022-10-10",
    status: "Approved",
  },
  {
    title: "Q4 2023 ESG Overview",
    type: "Annual",
    submissionDate: "2022-10-10",
    status: "Published",
  },
  {
    title: "Mid-Year Regulatory ESG Filing",
    type: "Bi-Annual",
    submissionDate: "2020-08-08",
    status: "Under Review",
  },
  {
    title: "2024 ESG Baseline Metrics Submission",
    type: "Sustainability",
    submissionDate: "2022-10-10",
    status: "Published",
  },
  {
    title: "Q3 2024 Impact & Risk Summary",
    type: "Compliance",
    submissionDate: "2025-12-12",
    status: "Rejected",
  },
];

const getStatusBadge = (status: string) => {
  const statusStyles: Record<string, string> = {
    Published: "bg-esg-green text-white",
    Rejected: "bg-esg-red text-white",
    "Under Review": "bg-esg-orange text-white",
    Approved: "bg-esg-blue text-white",
    Draft: "bg-esg-gray text-white",
  };

  return statusStyles[status] || "bg-esg-gray text-white";
};

export function RecentReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold font-poppins">Recent Reports</h2>

      <Card className="bg-white border border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-wrap gap-2 mb-4">
            {reportTabs.map((tab, index) => (
              <Button
                key={tab}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={index === 0 ? "bg-esg-green hover:bg-esg-green/90" : ""}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or company" className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="bi-annual">Bi-Annual</SelectItem>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-esg-green text-white border-esg-green hover:bg-esg-green/90"
              >
                Search
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Report Title
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Submission Date
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsData.map((report, index) => (
                <TableRow key={index} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="text-sm font-medium max-w-xs">{report.title}</TableCell>
                  <TableCell className="text-sm">{report.type}</TableCell>
                  <TableCell className="text-sm">{report.submissionDate}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadge(report.status)} border-0 text-xs`}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">1 - 10 of 25</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    size="icon"
                    className={`w-8 h-8 ${page === 1 ? "bg-esg-green hover:bg-esg-green/90" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

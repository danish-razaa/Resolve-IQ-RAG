import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaints } from "@/data/mockData";

const severityDot: Record<string, string> = {
  Critical: "🔴",
  Medium: "🟡",
  Low: "🟢",
};

const categories = ["All", "UPI", "Credit Card", "Debit/ATM", "NetBanking", "Loans", "KYC", "Fraud"] as const;

type ComplaintStatus = "Open" | "In Progress" | "Seen" | "Resolved";

const statusMap: Record<string, ComplaintStatus> = {
  "CMP-2024-0847": "Open",
  "CMP-2024-0846": "In Progress",
  "CMP-2024-0845": "Seen",
  "CMP-2024-0844": "Open",
  "CMP-2024-0843": "In Progress",
  "CMP-2024-0842": "Resolved",
  "CMP-2024-0841": "Open",
  "CMP-2024-0840": "In Progress",
  "CMP-2024-0839": "Resolved",
  "CMP-2024-0838": "Open",
  "CMP-2024-0837": "Seen",
  "CMP-2024-0836": "Resolved",
};

const statusStyles: Record<ComplaintStatus, string> = {
  Open: "bg-critical/10 text-critical border-critical/20",
  "In Progress": "bg-warning/10 text-warning border-warning/20",
  Seen: "bg-primary/10 text-primary border-primary/20",
  Resolved: "bg-success/10 text-success border-success/20",
};

const categoryStyles: Record<string, string> = {
  UPI: "bg-primary/10 text-primary border-primary/20",
  "Credit Card": "bg-[hsl(280,70%,55%)]/10 text-[hsl(280,70%,45%)] border-[hsl(280,70%,55%)]/20",
  "Debit/ATM": "bg-warning/10 text-warning border-warning/20",
  NetBanking: "bg-[hsl(200,80%,45%)]/10 text-[hsl(200,80%,40%)] border-[hsl(200,80%,45%)]/20",
  Loans: "bg-[hsl(45,90%,45%)]/10 text-[hsl(45,90%,35%)] border-[hsl(45,90%,45%)]/20",
  KYC: "bg-muted text-muted-foreground border-border",
  Fraud: "bg-critical/10 text-critical border-critical/20",
};

const statuses: ComplaintStatus[] = ["Open", "In Progress", "Seen", "Resolved"];

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = complaints.filter((c) => {
    if (severityFilter !== "All" && c.severity !== severityFilter) return false;
    if (categoryFilter !== "All" && c.category !== categoryFilter) return false;
    if (statusFilter !== "All" && statusMap[c.id] !== statusFilter) return false;
    return true;
  });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg font-bold text-foreground">All Complaints</h2>

      {/* Filter + Table */}
      <div className="bg-card border border-border rounded-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-4 border-b border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setVisibleCount(8); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Severity + Status Filters */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Complaint Feed</h3>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setVisibleCount(8); }}
              className="bg-card text-foreground text-xs rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setVisibleCount(8); }}
              className="bg-card text-foreground text-xs rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Severity</option>
              <option>Critical</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left px-4 py-3">Severity</th>
                <th className="text-left px-4 py-3">Customer Name</th>
                <th className="text-left px-4 py-3">Complaint Type</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const status = statusMap[c.id] || "Open";
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <td className="px-4 py-3">{severityDot[c.severity]}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{c.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.complaintType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryStyles[c.category] || "bg-muted text-muted-foreground border-border"}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.severity === "Critical" ? "bg-critical/10 text-critical" :
                        c.severity === "Medium" ? "bg-medium/10 text-medium" :
                        "bg-low/10 text-low"
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.timeAgo}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-primary hover:underline font-medium">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCount < filtered.length && (
          <div className="p-4 text-center border-t border-border">
            <button
              onClick={() => setVisibleCount((c) => c + 8)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsPage;

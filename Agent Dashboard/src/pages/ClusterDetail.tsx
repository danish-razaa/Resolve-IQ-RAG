import { useParams, useNavigate } from "react-router-dom";
import { complaints, duplicateClusters } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const domainColors: Record<string, string> = {
  UPI: "bg-primary/15 text-primary",
  "Credit Card": "bg-purple-500/15 text-purple-400",
  "Debit/ATM": "bg-amber-500/15 text-amber-400",
  NetBanking: "bg-blue-500/15 text-blue-400",
  Loans: "bg-rose-500/15 text-rose-400",
  KYC: "bg-teal-500/15 text-teal-300",
  Fraud: "bg-red-500/15 text-red-400",
};

type Status = "Open" | "In Progress" | "Resolved" | "Seen";

// Assign mock statuses to complaints
const getStatus = (complaint: typeof complaints[0]): Status => {
  if (complaint.slaHoursLeft > 48) return "Resolved";
  if (complaint.slaHoursLeft > 24) return "Seen";
  if (complaint.slaHoursLeft > 4) return "In Progress";
  return "Open";
};

const statusStyles: Record<Status, string> = {
  Open: "bg-critical/15 text-critical",
  "In Progress": "bg-medium/15 text-medium",
  Resolved: "bg-low/15 text-low",
  Seen: "bg-primary/15 text-primary",
};

const statusDot: Record<Status, string> = {
  Open: "bg-critical",
  "In Progress": "bg-medium",
  Resolved: "bg-low",
  Seen: "bg-primary",
};

const ClusterDetail = () => {
  const { clusterId } = useParams();
  const navigate = useNavigate();

  const cluster = duplicateClusters.find((c) => c.id === clusterId);

  // Map clusters to relevant complaints
  const clusterComplaints = (() => {
    if (!cluster) return [];
    if (cluster.title.includes("UPI")) return complaints.filter((c) => c.category === "UPI");
    if (cluster.title.includes("ATM")) return complaints.filter((c) => c.category === "Debit/ATM");
    if (cluster.title.includes("Net banking")) return complaints.filter((c) => c.category === "NetBanking");
    return complaints.slice(0, 5);
  })();

  const filtered = clusterComplaints;

  if (!cluster) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Cluster not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/duplicates")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">"{cluster.title}"</h2>
          <p className="text-xs text-muted-foreground">
            {cluster.count} complaints · {cluster.similarity}% similarity
          </p>
        </div>
      </div>


      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No complaints match the current filters.</p>
        )}
        {filtered.map((c) => {
          const status = getStatus(c);
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/complaints/${c.id}`)}
              className="bg-card border border-border rounded-lg p-4 card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    c.severity === "Critical" ? "bg-critical" : c.severity === "Medium" ? "bg-medium" : "bg-low"
                  }`} />
                  <span className="text-sm font-semibold text-foreground">{c.customerName}</span>
                  <span className="text-xs text-muted-foreground">· {c.id}</span>
                </div>
                <span className="text-xs text-muted-foreground">{c.timeAgo}</span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.unmaskedText}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Domain badge */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${domainColors[c.category] || "bg-secondary text-muted-foreground"}`}>
                  {c.category}
                </span>
                {/* Status badge */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${statusStyles[status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />
                  {status}
                </span>
                {/* Severity */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  c.severity === "Critical" ? "bg-critical/15 text-critical" : c.severity === "Medium" ? "bg-medium/15 text-medium" : "bg-low/15 text-low"
                }`}>
                  {c.severity}
                </span>
                {/* SLA */}
                <span className={`text-[10px] ml-auto font-medium ${
                  c.slaHoursLeft < 2 ? "text-critical sla-pulse" : c.slaHoursLeft < 24 ? "text-medium" : "text-low"
                }`}>
                  SLA: {c.slaHoursLeft}h left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClusterDetail;

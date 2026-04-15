import { useParams, useNavigate } from "react-router-dom";
import { complaints } from "@/data/mockData";
import { ArrowLeft, Mail, Phone, Smartphone, Building2, Globe } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const channelIcon: Record<string, React.ElementType> = {
  Email: Mail, Phone: Phone, App: Smartphone, Branch: Building2, Web: Globe,
};

const sentimentEmoji: Record<string, string> = {
  "Very Angry": "😠", Angry: "😤", Neutral: "😐", Satisfied: "🙂",
};

const severityColor: Record<string, string> = {
  Critical: "bg-critical/15 text-critical",
  Medium: "bg-medium/15 text-medium",
  Low: "bg-low/15 text-low",
};

type Status = "Open" | "In Progress" | "Resolved" | "Seen";
const statusOptions: Status[] = ["Open", "In Progress", "Resolved", "Seen"];

const statusBadgeStyles: Record<Status, string> = {
  Open: "bg-critical/10 text-critical",
  "In Progress": "bg-medium/10 text-medium",
  Resolved: "bg-low/10 text-low",
  Seen: "bg-primary/10 text-primary",
};

const getInitialStatus = (complaint: typeof complaints[0]): Status => {
  if (complaint.slaHoursLeft > 48) return "Resolved";
  if (complaint.slaHoursLeft > 24) return "Seen";
  if (complaint.slaHoursLeft > 4) return "In Progress";
  return "Open";
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const complaint = complaints.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(complaint?.aiDraftReply ?? "");
  const [status, setStatus] = useState<Status>(complaint ? getInitialStatus(complaint) : "Open");

  if (!complaint) {
    return <div className="text-center py-20 text-muted-foreground">Complaint not found.</div>;
  }

  const ChannelIcon = channelIcon[complaint.channel] ?? Mail;

  const slaColor = complaint.slaHoursLeft < 2 ? "text-critical sla-pulse" : complaint.slaHoursLeft < 24 ? "text-medium" : "text-success";
  const slaLabel = complaint.slaHoursLeft < 1 ? `${Math.round(complaint.slaHoursLeft * 60)} min left` : `${complaint.slaHoursLeft.toFixed(1)} hrs left`;

  const handleApprove = () => {
    toast({ title: "Reply Sent Successfully", description: `Response sent to ${complaint.customerName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">{complaint.id}</h2>
          <select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value as Status;
              setStatus(newStatus);
              toast({ title: "Status Updated", description: `Complaint marked as ${newStatus}` });
            }}
            className={`text-xs font-semibold rounded-lg px-3 py-1.5 border border-border cursor-pointer ${statusBadgeStyles[status]}`}
          >
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className={`text-sm font-bold ${slaColor}`}>⏱ SLA: {slaLabel}</div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name</span><p className="font-medium text-foreground">{complaint.customerName}</p></div>
              <div><span className="text-muted-foreground">Account</span><p className="font-medium text-foreground">{complaint.accountNumber}</p></div>
              <div><span className="text-muted-foreground">Branch</span><p className="font-medium text-foreground">{complaint.branch}</p></div>
              <div><span className="text-muted-foreground">Past Complaints</span><p className="font-medium text-foreground">{complaint.pastComplaints}</p></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Complaint</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{complaint.unmaskedText}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <ChannelIcon className="h-3.5 w-3.5" /><span>{complaint.channel}</span><span>·</span><span>{complaint.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-green-100 border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">🧬 Complaint DNA</h3>
            <div className="space-y-3 text-sm">
              <Row label="Category" value={complaint.category} />
              <Row label="Severity" value={
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColor[complaint.severity]}`}>
                  {complaint.severity === "Critical" ? "🔴" : complaint.severity === "Medium" ? "🟡" : "🟢"} {complaint.severity}
                </span>
              } />
              <Row label="Sentiment" value={`${sentimentEmoji[complaint.sentiment] ?? "😐"} ${complaint.sentiment}`} />
              <Row label="Priority" value={
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColor[complaint.severity]}`}>
                  {complaint.severity}
                </span>
              } />
              <Row label="Root Cause" value={complaint.rootCause} />
              <Row label="RBI Risk" value={
                <span className={complaint.rbiRisk === "High" ? "text-critical font-semibold" : complaint.rbiRisk === "Medium" ? "text-medium" : "text-muted-foreground"}>
                  {complaint.rbiRisk === "High" ? "⚠️ " : ""}{complaint.rbiRisk}
                </span>
              } />
              <Row label="Duplicates" value={complaint.duplicateCount > 0 ? `${complaint.duplicateCount} similar complaints today` : "None"} />
            </div>
          </div>

          {/* AI Draft Reply */}
          <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">📝 AI Draft Reply</h3>
            {editing ? (
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={8} value={reply} onChange={(e) => setReply(e.target.value)}
              />
            ) : (
              <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{reply}</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                {editing ? "Done Editing" : "Edit Reply"}
              </button>
              <button onClick={handleApprove} className="text-xs px-4 py-1.5 rounded-lg bg-success text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Approve & Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Past */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Similar Past Complaints</h3>
        <div className="space-y-2">
          {complaint.similarPast.map((sp) => (
            <div key={sp.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-primary font-mono text-xs">{sp.id}</span>
                <span className="text-muted-foreground">{sp.description}</span>
              </div>
              <span className="text-xs text-muted-foreground">{sp.resolutionTime}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-foreground text-right">{value}</span>
  </div>
);

export default ComplaintDetail;

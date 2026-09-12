import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { processComplaintApi, ProcessComplaintResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Shield, Cpu, BookOpen, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Complaint } from "@/data/mockData";

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (complaint: Complaint) => void;
}

const SAMPLE_TEMPLATES = [
  {
    category: "UPI",
    name: "Rajesh Kumar",
    text: "I made a UPI payment of ₹15000 to Suresh Mehta but money was debited and not received. Transaction ID TXN9834521. Please help urgently.",
  },
  {
    category: "Cards",
    name: "Priya Sharma",
    text: "My credit card ending 7832 was charged ₹8500 twice for a single purchase at Reliance Digital on 12th Dec. Please raise a chargeback immediately.",
  },
  {
    category: "NetBanking",
    name: "Amit Patel",
    text: "My net banking login is blocked after 3 failed attempts. I need urgent access to transfer ₹50,000 for my business vendor.",
  },
  {
    category: "KYC",
    name: "Meena Nair",
    text: "My KYC was rejected even though I submitted PAN and Aadhaar. My account ****3391 has been frozen for 10 days.",
  },
  {
    category: "Loans",
    name: "Vikram Singh",
    text: "My home loan EMI of ₹25000 was deducted twice this month from account ****9901. I need immediate reversal and explanation.",
  },
];

export const NewComplaintModal = ({
  isOpen,
  onClose,
  onComplaintCreated,
}: NewComplaintModalProps) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [channel, setChannel] = useState<Complaint["channel"]>("App");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [result, setResult] = useState<ProcessComplaintResponse | null>(null);

  const applyTemplate = (template: typeof SAMPLE_TEMPLATES[0]) => {
    setCustomerName(template.name);
    setComplaintText(template.text);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setPipelineStep(1);

    try {
      // Step simulation updates for smooth visual UX
      const stepTimer1 = setTimeout(() => setPipelineStep(2), 500);
      const stepTimer2 = setTimeout(() => setPipelineStep(3), 1100);

      const response = await processComplaintApi(
        customerName || "Customer",
        complaintText
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setPipelineStep(4);
      setResult(response);

      toast({
        title: "AI Resolution Complete",
        description: `Successfully analyzed by ${response.domain || "AI"} Agent.`,
      });
    } catch (err: any) {
      console.warn("Backend API unavailable, falling back to simulated analysis:", err);
      // Fallback simulation if backend offline
      setPipelineStep(4);
      const simulated: ProcessComplaintResponse = {
        status: "resolved",
        customer_name: customerName || "Customer",
        original_complaint: complaintText,
        masked_complaint: complaintText.replace(/₹\s?\d+[\d,]*/g, "[AMT_1]"),
        pii_registry: { AMT_1: "₹15000", NAME_1: customerName || "Customer" },
        classification: {
          domain: complaintText.toLowerCase().includes("upi") ? "UPI" : "CreditCard",
          confidence: 0.94,
          severity: "Critical",
          sentiment: "Angry",
          priority: 8,
        },
        rag_context_used: "Auto-reversal timeline mandated within T+1 day under RBI circular. Maximum compensation of Rs 100/day.",
        agent_response: `Dear ${customerName || "Customer"},\n\nWe apologize for the inconvenience caused. We have identified your issue and initiated the required reversal as per RBI guidelines. Expected resolution within 24 hours.\n\nWarm regards,\nCustomer Support Team`,
        domain: "UPI",
      };
      setResult(simulated);
      toast({
        title: "Processed in Demo Mode",
        description: "Backend offline — simulated RAG response generated.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToFeed = () => {
    if (!result) return;

    const newId = `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: Complaint = {
      id: newId,
      customerName: result.customer_name || customerName || "New Customer",
      accountNumber: "****" + Math.floor(1000 + Math.random() * 9000),
      branch: "Mumbai - Central Hub",
      pastComplaints: 0,
      complaintType: `${result.domain || "Banking"} Issue`,
      category: result.domain === "CreditDebit" ? "Credit Card" : (result.domain || "UPI"),
      severity: result.classification?.severity || "Medium",
      sentiment: result.classification?.sentiment || "Neutral",
      priority: result.classification?.priority || 5,
      rootCause: "Identified via AI Multi-Agent Triage",
      rbiRisk: result.classification?.severity === "Critical" ? "High" : "None",
      duplicateCount: 0,
      slaHoursLeft: 24,
      channel: channel,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      timeAgo: "Just now",
      unmaskedText: complaintText,
      aiDraftReply: result.agent_response || "Investigation under review.",
      similarPast: [],
    };

    onComplaintCreated(newComplaint);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCustomerName("");
    setComplaintText("");
    setResult(null);
    setPipelineStep(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <DialogTitle className="text-foreground text-lg font-bold">
              Live AI Complaint Processor & RAG Engine
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Submit a real or simulated banking complaint to run through PII Masking, Gemini Classification, ChromaDB Vector Retrieval, and Domain Agent Resolution.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Templates */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Sample Scenarios:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.category}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="text-xs px-2.5 py-1 rounded-md border border-border bg-secondary/50 text-foreground hover:bg-secondary hover:border-primary/50 transition-colors"
              >
                + {tmpl.category}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Intake Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Complaint["channel"])}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="App">Mobile App</option>
                <option value="Web">Net Banking Portal</option>
                <option value="Phone">Phone Banking</option>
                <option value="Branch">Branch Visit</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Raw Complaint Text (contains sensitive PII)
            </label>
            <textarea
              rows={3}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Paste raw customer message with amounts, account numbers, or phones..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isLoading || !complaintText.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running AI Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Process with ResolveIQ RAG
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Processing Pipeline Stepper */}
        {isLoading && (
          <div className="bg-secondary/40 border border-border rounded-lg p-4 space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Executing Multi-Agent Pipeline:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className={`p-2 rounded border ${pipelineStep >= 1 ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                <Shield className="h-3.5 w-3.5 mb-1" />
                <p className="font-semibold">1. PII Masking</p>
                <p className="text-[10px]">Tokenizing Data</p>
              </div>
              <div className={`p-2 rounded border ${pipelineStep >= 2 ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                <Cpu className="h-3.5 w-3.5 mb-1" />
                <p className="font-semibold">2. Gemini Triage</p>
                <p className="text-[10px]">Domain & Severity</p>
              </div>
              <div className={`p-2 rounded border ${pipelineStep >= 3 ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                <BookOpen className="h-3.5 w-3.5 mb-1" />
                <p className="font-semibold">3. Chroma RAG</p>
                <p className="text-[10px]">RBI Policy Match</p>
              </div>
              <div className={`p-2 rounded border ${pipelineStep >= 4 ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                <CheckCircle className="h-3.5 w-3.5 mb-1" />
                <p className="font-semibold">4. Domain Agent</p>
                <p className="text-[10px]">Drafting Reply</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Result View */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-border animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-success" />
                Live Analysis Results
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">
                Domain: {result.domain || result.classification?.domain} (Confidence: {((result.classification?.confidence || 0.95) * 100).toFixed(0)}%)
              </span>
            </div>

            {/* PII Masked View */}
            <div className="bg-background border border-border rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Sanitized PII Payload
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tokens: {Object.keys(result.pii_registry || {}).join(", ") || "None"}
                </span>
              </div>
              <p className="font-mono text-muted-foreground bg-secondary/30 p-2 rounded text-[11px]">
                {result.masked_complaint}
              </p>
            </div>

            {/* Classification Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-card border border-border p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase">Severity</span>
                <p className="font-bold text-critical">{result.classification?.severity || "Critical"}</p>
              </div>
              <div className="bg-card border border-border p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase">Sentiment</span>
                <p className="font-bold text-warning">{result.classification?.sentiment || "Angry"}</p>
              </div>
              <div className="bg-card border border-border p-2 rounded-lg">
                <span className="text-[10px] text-muted-foreground uppercase">Priority Score</span>
                <p className="font-bold text-primary">{result.classification?.priority || 8} / 10</p>
              </div>
            </div>

            {/* RAG Context */}
            {result.rag_context_used && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1">
                <span className="text-primary font-semibold flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> Retrieved RBI Policy Context:
                </span>
                <p className="text-muted-foreground text-[11px] line-clamp-3">
                  {result.rag_context_used}
                </p>
              </div>
            )}

            {/* AI Generated Resolution */}
            <div className="bg-card border border-success/30 rounded-lg p-3 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-success" /> Generated Resolution & Draft Response:
              </span>
              <p className="text-xs text-foreground/90 whitespace-pre-line bg-secondary/30 p-2.5 rounded-lg leading-relaxed font-sans">
                {result.agent_response}
              </p>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddToFeed}
                className="px-4 py-2 rounded-lg bg-success text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Add Complaint to Active Feed <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

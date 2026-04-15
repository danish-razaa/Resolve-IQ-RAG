import { duplicateClusters } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const severityColor: Record<string, string> = {
  Critical: "bg-critical/20 text-critical",
  Medium: "bg-medium/20 text-medium",
};

const DuplicatesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Duplicate Clusters</h2>
        <select className="bg-secondary text-foreground text-xs rounded-md px-3 py-1.5 border border-border">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="space-y-4">
        {duplicateClusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-card border border-border rounded-lg p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  "{cluster.title}"
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColor[cluster.severity]}`}>
                    {cluster.severity}
                  </span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">
                    {cluster.similarity}% similar
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{cluster.count}</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border">
              <button
                onClick={() => navigate(`/duplicates/${cluster.id}`)}
                className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                View All ({cluster.count})
              </button>
              <button
                onClick={() =>
                  toast({
                    title: "Bulk Reply Sent",
                    description: `Reply sent to ${cluster.count} complaints in this cluster`,
                  })
                }
                className="text-xs px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Send Bulk Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuplicatesPage;

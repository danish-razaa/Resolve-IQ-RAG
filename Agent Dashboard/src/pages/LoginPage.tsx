import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !id.trim()) {
      setError("Please fill in all fields");
      return;
    }
    localStorage.setItem("agent_logged_in", "true");
    localStorage.setItem("agent_name", name.trim());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Resolve<span className="text-primary">IQ</span>
            </h1>
            <p className="text-sm text-muted-foreground">Agent Portal — Sign In</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Agent ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => { setId(e.target.value); setError(""); }}
                placeholder="e.g. AGT-001"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            {error && <p className="text-xs text-critical font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Secure banking complaint management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

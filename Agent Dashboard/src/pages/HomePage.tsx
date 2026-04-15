import { analyticsData } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";

const BLUE = "hsl(217, 91%, 50%)";
const RED = "hsl(0, 84%, 60%)";
const AMBER = "hsl(38, 92%, 50%)";
const MUTED = "hsl(215, 16%, 47%)";
const GREEN = "hsl(142, 71%, 45%)";

const stats = [
  { label: "Total Complaints", value: "847", icon: TrendingUp, color: "text-primary" },
  { label: "Open", value: "234", icon: Clock, color: "text-warning" },
  { label: "Breaching SLA", value: "12", icon: AlertCircle, color: "text-critical", pulse: true },
  { label: "Resolved Today", value: "601", icon: CheckCircle, color: "text-success" },
];

const HomePage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Dashboard Overview</h2>
        <select className="bg-card text-foreground text-xs rounded-lg px-3 py-1.5 border border-border">
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
              {s.pulse ? (
                <span className="relative flex h-3 w-3">
                  <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-critical opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-critical"></span>
                </span>
              ) : (
                <s.icon className={`h-4 w-4 ${s.color}`} />
              )}
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Complaint Volume">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analyticsData.dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 88%)" />
              <XAxis dataKey="day" stroke={MUTED} fontSize={12} />
              <YAxis stroke={MUTED} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(214, 32%, 88%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="complaints" stroke={BLUE} strokeWidth={2} dot={{ fill: BLUE, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 88%)" />
              <XAxis type="number" stroke={MUTED} fontSize={12} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" stroke={MUTED} fontSize={12} width={80} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(214, 32%, 88%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sentiment Trend">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 88%)" />
              <XAxis dataKey="day" stroke={MUTED} fontSize={12} />
              <YAxis stroke={MUTED} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(214, 32%, 88%)", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="angry" fill={RED} name="Angry" radius={[4, 4, 0, 0]} />
              <Bar dataKey="neutral" fill={MUTED} name="Neutral" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="SLA Performance">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.slaPerformance}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={3}
                label={({ name, value }) => `${name} ${value}%`}
                fontSize={11}
              >
                {analyticsData.slaPerformance.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(214, 32%, 88%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Root Cause Insight */}
      <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-primary mb-2">🔍 Root Cause Insight</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          47 UPI complaints this week share the same pattern — failures occurring between 7–9 PM.
          Likely cause: Peak load on payment server. Recommend scaling UPI gateway capacity during
          evening hours and implementing queue-based retry mechanism.
        </p>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

export default HomePage;

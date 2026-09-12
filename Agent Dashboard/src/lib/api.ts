export interface PiiRegistry {
  [key: string]: string;
}

export interface ClassificationResult {
  domain: string;
  confidence: number;
  severity: "Critical" | "Medium" | "Low";
  sentiment: "Very Angry" | "Angry" | "Neutral" | "Satisfied";
  priority: number;
}

export interface ProcessComplaintResponse {
  status: "resolved" | "escalated" | "error";
  customer_name?: string;
  original_complaint?: string;
  masked_complaint?: string;
  pii_registry?: PiiRegistry;
  classification?: ClassificationResult;
  rag_context_used?: string;
  agent_response?: string;
  domain?: string;
  reason?: string;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  vector_stores_loaded: boolean;
  loaded_domains: string[];
  has_gemini_key: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function checkApiHealth(): Promise<{ online: boolean; data?: HealthResponse; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { online: false, error: `HTTP ${res.status}` };
    }
    const data: HealthResponse = await res.json();
    return { online: true, data };
  } catch (err: any) {
    return { online: false, error: err.message || "Connection refused" };
  }
}

export async function processComplaintApi(
  customerName: string,
  complaintText: string
): Promise<ProcessComplaintResponse> {
  const res = await fetch(`${API_BASE_URL}/api/process-complaint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_name: customerName,
      complaint: complaintText,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Server error: ${res.statusText}`);
  }

  return await res.json();
}

export async function maskPiiApi(
  text: string,
  customerName: string = ""
): Promise<{ original_text: string; masked_text: string; pii_registry: PiiRegistry; tokens_found: number }> {
  const res = await fetch(`${API_BASE_URL}/api/mask-pii`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      customer_name: customerName,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mask PII: ${res.statusText}`);
  }

  return await res.json();
}

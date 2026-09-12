import os
import uvicorn

if __name__ == "__main__":
    # Render sets PORT env variable (usually 10000)
    port = int(os.environ.get("PORT", 10000))
    print(f"🚀 Launching ResolveIQ API Server on 0.0.0.0:{port}...")
    uvicorn.run("api:app", host="0.0.0.0", port=port, log_level="info")

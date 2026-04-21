FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml .env* ./

# Install dependencies using uv
# We use --system to install into the image's python environment
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY rag_backend ./rag_backend

# Expose FastAPI port
EXPOSE 8000

# Run with uvicorn
CMD ["python", "-m", "uvicorn", "rag_backend.app:app", "--host", "0.0.0.0", "--port", "8000"]

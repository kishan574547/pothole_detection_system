# Multi-stage lightweight Python container for YOLOv4 + OpenCV FastAPI Backend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install minimal OS dependencies for OpenCV headless and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy entire build context
COPY . .

# Universal context adapter: if files are nested in backend/, move them to /app
RUN if [ -d "backend" ]; then \
        cp -r backend/* . && rm -rf backend; \
    fi

# Ensure requirements are installed
RUN pip install --no-cache-dir -r requirements.txt

# Ensure models directory exists
RUN mkdir -p models && touch models/.gitkeep

# Create a non-root user for security best practices
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Start FastAPI server using uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

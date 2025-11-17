FROM python:3.11-slim

# Explicitly set Python version
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies (minimal, only for runtime)
RUN apt-get update && apt-get install -y \
    libpq5 \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Verify Python version
RUN python --version

# Upgrade pip and install wheel for binary packages
RUN pip install --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements.txt ./

# Install Python dependencies using ONLY pre-built wheels (no source builds)
# This forces pip to use binary wheels and fail if they don't exist
RUN pip install --only-binary :all: --no-cache-dir -r requirements.txt || \
    (echo "Some packages don't have wheels, trying with source..." && \
     pip install --no-cache-dir -r requirements.txt)

# Copy application code
COPY . .

# Make scripts executable
RUN chmod +x scripts/create_tables.py 2>/dev/null || true

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


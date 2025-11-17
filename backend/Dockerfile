FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libpq-dev \
    postgresql-client \
    libffi-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --upgrade pip && \
    pip install poetry==1.7.1

# Configure poetry to not create virtual env and use system site-packages
RUN poetry config virtualenvs.create false && \
    poetry config installer.max-workers 10

# Copy dependency files
COPY pyproject.toml ./
# Copy poetry.lock if it exists, otherwise continue
COPY poetry.lock* ./

# Install dependencies (use pip fallback if poetry fails)
RUN poetry install --no-dev --no-interaction --no-ansi || \
    (echo "Poetry install failed, trying pip..." && \
     pip install -r requirements.txt)

# Copy application code
COPY . .

# Make scripts executable
RUN chmod +x scripts/create_tables.py 2>/dev/null || true

# Expose port
EXPOSE 8000

# Health check (optional, can be removed if curl not available)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD curl -f http://localhost:8000/healthz || exit 1

# Run the application
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


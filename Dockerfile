# ======== Stage 1: Build Frontend ========
FROM node:20-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Build with empty VITE_API_BASE so frontend uses relative paths
ENV VITE_API_BASE=""
RUN npm run build

# ======== Stage 2: Backend + Serve Frontend ========
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for mysqlclient (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn PyMySQL cryptography

# Copy backend code
COPY backend/ .

# Copy frontend build output to static folder
COPY --from=frontend-build /frontend/dist ./static

# Cloud Run uses PORT env variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Use gunicorn for production
CMD exec gunicorn --bind :$PORT --workers 2 --threads 4 --timeout 120 main:app
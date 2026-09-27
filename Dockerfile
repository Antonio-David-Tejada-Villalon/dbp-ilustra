# ---- 1) Compila el frontend (React + Vite) ----
FROM node:22-alpine AS front
WORKDIR /front
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---- 2) Backend Django + FastAPI que además sirve el frontend compilado ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 FRONTEND_DIST=/app/frontend/dist IMAGE_CACHE_DIR=/data/image_cache
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=front /front/dist /app/frontend/dist
RUN useradd -m ilustra && mkdir -p /data/image_cache && chown -R ilustra /data /app
USER ilustra
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput -v0 && uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WEB_WORKERS:-2} --proxy-headers --forwarded-allow-ips='*'"]

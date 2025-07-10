# Use official Python slim image
FROM python:3.9-slim-buster

WORKDIR /app

# Copy backend requirements.txt
COPY backend/requirements.txt .

# Copy core folder so that ../core is valid relative to /app/backend/
COPY core /core

# Now install requirements — `-e ../core` will resolve correctly
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code last
COPY backend/insighthub/backend ./insighthub/backend

EXPOSE 8000
CMD ["uvicorn", "insighthub.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

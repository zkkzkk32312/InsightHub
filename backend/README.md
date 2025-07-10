# FastAPI Project

This is a simple FastAPI project with an async endpoint.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source env/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Run the application

```
uvicorn main:app --reload
```

## API Endpoint

- GET /async-endpoint: An async endpoint that returns a simple message.

## Building Docker Image

This project includes scripts to build a Docker image for easy deployment.

### Prerequisites

- Docker installed on your system.

### Build Scripts

- `build.sh`: A bash script for building the Docker image on macOS/Linux.
- `build.ps1`: A PowerShell script for building the Docker image on Windows.

### Usage

1.  Navigate to the `insighthub/backend/` directory.
2.  Run the appropriate build script for your operating system:

    - On Windows:
        ```powershell
        .\build.ps1
        ```
    - On macOS/Linux:
        ```bash
        ./build.sh
        ```

This will build a Docker image named `insighthub-backend`.

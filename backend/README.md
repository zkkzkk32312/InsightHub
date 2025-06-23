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

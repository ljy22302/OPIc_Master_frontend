## Local Setup

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start the frontend with `npm run dev`
4. Make sure the backend is already running at `http://127.0.0.1:8000`

Default frontend env:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_STT_API_BASE_URL=http://127.0.0.1:8000
VITE_STT_PROXY_TARGET=http://127.0.0.1:8000
```

Backend health check:

`http://127.0.0.1:8000/health`

# HustleApp Frontend Deploy Guide

This project is a Vite/React frontend. It should be deployed as static files.

## Build

```bash
npm install
npm run build
```

Deploy the contents of `dist/` to the web root or static host.

## Environment

Set these before building:

```env
VITE_API_BASE_URL=https://api-v2.hustleapp.info/api/v1
VITE_SOCKET_URL=https://api-v2.hustleapp.info
```

## Routing

Configure the host so all frontend routes fall back to `index.html`.

Routes such as `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, and `/feed` are React routes. They should fall back to `index.html`.

## API Auth

The frontend uses the documented API endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `POST /auth/verify-email`

Password reset links should point to the React route:

```text
https://hustleapp.info/reset-password?email=user@example.com&token=RESET_TOKEN
```

The React page reads `email`, `token`, and optional `account_type` from the URL and submits the reset request to the API.

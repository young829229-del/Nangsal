# Nangsal Apparel - Security & Environment Setup

## Secret Safety & Environment Variable Configuration

All application configuration options, credentials, and API keys are managed through environment variables to ensure zero hardcoded secrets in the source code.

### Required Environment Variables

Refer to `.env.example` for all configurable environment variables:

- **ADMIN_USERNAME**: Server admin username.
- **ADMIN_PASSWORD** / **VITE_ADMIN_PASSWORD**: Admin password for operator portal access.
- **ADMIN_BEARER_TOKEN** / **VITE_ADMIN_BEARER_TOKEN**: Secure token used to authenticate administrative API endpoints.
- **VITE_FIREBASE_\***: Public Firebase Web SDK configuration (API key, auth domain, database URL, project ID, storage bucket, messaging sender ID, app ID, measurement ID).
- **GEMINI_API_KEY**: Server-side API key for Google Gemini model requests.

> ⚠️ **CRITICAL GIT HISTORY WARNING / SECRET ROTATION MANDATE**
> If any secrets, passwords, or API keys were previously hardcoded or committed in earlier git revisions before this security pass, those keys must be considered compromised and **MUST BE ROTATED IMMEDIATELY** in their respective administration consoles (Firebase Console, Google Cloud Platform, Admin portals).

## Security Measures Applied

1. **Environment Variables**: Moved all database URLs, API keys, credentials, and tokens out of source code literals and into `process.env` / `import.meta.env`.
2. **Frontend Exposure Safeguards**: Ensured no secret keys (e.g. server API keys, service role keys, or database credentials) are exposed via client-side builds.
3. **Log Sanitization**: Cleaned server logs and error handlers to ensure sensitive tokens and OTP codes are never logged to console or stdout.
4. **Git Protection**: Ensured `.env` files are ignored by git in `.gitignore` while maintaining `.env.example`.

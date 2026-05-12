# Security Hardening

- Use PHP 8.1+ only.
- Keep `display_errors=Off` in production.
- Use long random values for `JWT_SECRET` and `INSTALLER_KEY`.
- Set `INSTALLER_ENABLED=false` after setup.
- Limit `CORS_ALLOWED_ORIGINS` to trusted frontend domains.
- Serve the app over HTTPS only.
- Rotate demo credentials before public exposure.
- Move to Redis-backed rate limiting and idempotency storage for scale.
- Add audit logging for admin moderation and payout actions.
- Add signed upload URLs and antivirus scanning before production file uploads.

# TalentForge

React site for uploading resumes and downloading the formatted DOCX or PDF. The product is behind Microsoft Entra ID. Nothing in the app is available until sign-in, and the API rejects requests that do not carry a valid access token.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173/.

## Environment

Copy `.env.example` to `.env`. Do not put real values in `.env.example`.

```env
TF_API_BASE=
TF_TENANT_ID=
TF_SPA_CLIENT_ID=
TF_API_CLIENT_ID=
```

`TF_API_BASE` is the existing API root, including `/api/v1`. `TF_SPA_CLIENT_ID` is the single-page app registration. `TF_API_CLIENT_ID` is the API registration. The site requests `api://<TF_API_CLIENT_ID>/access_as_user` and keeps the MSAL cache in `sessionStorage`.

The API reads `ENTRA_TENANT_ID`, `API_CLIENT_ID`, `DATABASE_URL`, and `FRONTEND_ORIGIN`. See the TalentForge API README for the database migration (`alembic upgrade head`).

## Entra setup

Single tenant only.

1. **API app.** Expose a delegated scope named `access_as_user`. In the app manifest set `"accessTokenAcceptedVersion": 2`.
2. **SPA app.** Add redirect URIs for `http://localhost:5173` and the deployed site origin. Grant the SPA the API's `access_as_user` permission.
3. On the API app, add the SPA client id under **Expose an API → Authorized client applications**.
4. Grant **admin consent** for `access_as_user`.
5. On the API enterprise application, turn on **Assignment required** and assign the users or groups who may sign in.

## Manual test checklist

- [ ] An assigned user can sign in with Microsoft and reach the uploader. Sign out returns to the sign-in screen.
- [ ] `GET /api/v1/me` with the access token returns `tid`, `oid`, `name`, `preferred_username`, and `roles`.
- [ ] A missing, expired, or edited token returns **401**.
- [ ] A user who is not assigned on the enterprise app is blocked at sign-in.
- [ ] A token with the wrong audience is rejected (**401**).
- [ ] A token from another tenant, or without `access_as_user`, returns **403** and the site shows Access denied.
- [ ] `GET /health` works without a token. Any resume route without a token returns **401**.

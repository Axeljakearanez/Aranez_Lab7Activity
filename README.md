# Angular 21 Auth Boilerplate (Beginner Guide)

This project is a beginner-friendly Angular 21 boilerplate that demonstrates a complete authentication flow:

- Email sign up + email verification
- Login + Logout
- JWT auth header for API requests
- Refresh tokens (cookie-based) + auto-refresh before access token expiry
- Forgot password + reset password
- Role-based authorization (User & Admin)
- Admin area for account management
- Profile area for viewing/updating your own account

## Table of contents

- [1) Prerequisites](#1-prerequisites)
- [2) Run the app (real API)](#2-run-the-app-real-api)
- [3) Run the app (fake backend, no API)](#3-run-the-app-fake-backend-no-api)
- [4) Using the app](#4-using-the-app-what-to-click)
- [5) How authentication works](#5-how-authentication-works)
- [6) Authorization (roles + route guards)](#6-authorization-roles-route-guards)
- [7) Project structure (quick tour)](#7-project-structure-quick-tour)
- [8) Troubleshooting](#8-troubleshooting)

---

# 1) Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- (Optional) Angular CLI:

```bash
npm i -g @angular/cli
```

---

# 2) Run the app (real API)

By default this project is set up to call a real API at:

- `http://localhost:4000`

## Step 1: install packages

From the project root (where `package.json` is):

```bash
npm install
```

## Step 2: start your backend API

Start an API that implements the `/accounts/*` endpoints.

The frontend expects the API to be available at:

```txt
http://localhost:4000
```

## Step 3: start Angular

```bash
npm start
```

This runs:

```bash
ng serve --open
```

and should open the app in your browser.

---

# 3) Run the app (fake backend, no API)

If you want to run everything fully in the browser (no backend), enable the fake backend provider.

## Step 1: enable fake backend provider

Open:

```txt
src/app/app.module.ts
```

Then uncomment the `fakeBackendProvider` line inside the `providers` array.

It should look like this:

```ts
providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    fakeBackendProvider
]
```

## Step 2: run the app

```bash
npm install
npm start
```

---

# 4) Update API URL (if your API runs elsewhere)

Edit the environment files:

```txt
src/environments/environment.ts
src/environments/environment.prod.ts
```

Update:

```ts
apiUrl: 'http://localhost:4000'
```

---

# 5) Using the app (what to click)

- Register a new account
- Verify email
- Login
- Access profile page
- Access admin page (admin accounts only)
- Reset password if forgotten

---

# 6) How authentication works

- JWT access token stored for authenticated requests
- Refresh token stored in secure cookies
- Interceptors automatically attach tokens
- Route guards protect admin/user pages

---

# 7) Project structure (quick tour)

```txt
src/
 ├── app/
 │   ├── _components
 │   ├── _helpers
 │   ├── _models
 │   ├── _services
 │   ├── account
 │   ├── admin
 │   ├── home
 │   └── profile
```

---

# 8) Troubleshooting

## npm install errors

Try:

```bash
npm install --legacy-peer-deps
```

## Angular version issues

Check versions:

```bash
ng version
```

## Start app

```bash
ng serve
```

Open:

```txt
http://localhost:4200
```
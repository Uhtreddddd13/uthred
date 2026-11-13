# Thread shop - full project (front end + Node.js backend)

## Run
    npm install
    npm start          # http://localhost:3000

First run prints the admin login (email + random password) in the console.
Set your own before the first run:  ADMIN_EMAIL=you@site.com ADMIN_PASSWORD=YourStrongPass npm start

## Features
Multi-page store, multi-photo products with hover zoom, sizes, cart, checkout, printable receipt,
support ticket opened after every order (customer <-> support chat), roles (customer / support / admin),
admin panel (products, photos, stock, user roles), email+password accounts, Google sign-in.

## Google sign-in
1. Google Cloud Console > APIs & Services > Credentials > Create OAuth client ID (Web application).
2. Add your site URL (https://yourdomain.com) under Authorized JavaScript origins.
3. Start the server with GOOGLE_CLIENT_ID=your-client-id (the button appears automatically).

## Deploy
Any host that runs Node 18+: VPS, Railway, Render, Fly.io, or cPanel "Setup Node.js App".
Startup file: server.js. Use HTTPS. Keep the data/ and public/uploads/ folders on persistent storage (back them up).
Data is stored in data/db.json (fine for a small shop; move to PostgreSQL/MySQL when you grow).

## Not included yet
Real card payments (checkout offers cash on delivery or a demo card option), password reset emails, email notifications.

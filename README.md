# KMS | Khana Management System ( About the App )

KMS is a comprehensive campus food ordering and canteen management platform designed to improve the efficiency, reliability, and transparency of food services within our university campus. The system consists of React Native mobile applications and a Node.js backend, supporting students, canteen operators, and administrators through a unified ecosystem.

## Problem Statement

Campus canteens often suffer from inconsistent operating hours, long waiting times for orders, and lack of order visibility. Students frequently walk to canteens only to find them closed or overcrowded, while canteen operators struggle with demand unpredictability and order management during peak hours.

KMS aims to address these challenges by introducing real-time canteen availability, controlled pre-ordering, and structured order workflows.

## Solution Overview

KMS introduces a mobile-first solution where:

Canteen availability is explicitly controlled by canteen operators, with ease for canteen operators as they just have to use our iot based device to toggle their status.

Pre-orders are disabled by default and enabled only when the canteen is prepared to handle online demand.

Students can place orders in advance and track them in real time.

Order pickup is secured using QR-based verification to prevent misuse.

## Core Features
### Student Application

View all campus canteens with real-time open and closed status.

Browse canteen menus with clear vegetarian and non-vegetarian indicators.

Add items to a cart and place pre-orders.

Mock payment integration for demonstration purposes.

Live order status tracking from placement to readiness.

QR code generation for secure and authenticated order pickup.

Access complete order history for reference and tracking.

### Canteen Application

Toggle canteen availability to control visibility for students.

Enable or disable online pre-orders independently of physical availability.

Manage menus with fine-grained control:

Add, edit, and delete menu items.

Toggle item availability during peak or low inventory periods.

View and manage incoming orders in real time.

Update order status through a structured workflow:

Accepted → Preparing → Ready.

Scan QR codes at pickup counters to verify and complete orders securely.

# KMS - Khana Management System ( Code for Debugging )

This repository contains a campus food-ordering platform: a backend API and a React Native mobile application (UnifiedApp). The READMEs in this repo explain how the parts are organized and how to run them locally.

Quick links
- Root README: this file
- Backend code: [backend](backend/)
- Mobile app: [UnifiedApp](UnifiedApp/)

Prerequisites
- Node.js (16+)
- npm or yarn
- Python 3.8+ and `pip` (for the Flask server if used)
- MongoDB (local or Atlas)
- (Optional) Expo CLI (`npm install -g expo-cli`) if you use Expo for the mobile app

Quick Start (recommended)

1) Backend (Node/Express)

```powershell
cd backend
npm install
# create or edit .env (see backend/README.md)
node server.js
```

2) Mobile app (UnifiedApp)

```powershell
cd UnifiedApp
npm install
npx expo start
```

Notes
- The mobile app reads the API base URL from [UnifiedApp/src/config/api.js](UnifiedApp/src/config/api.js).
- Backend DB configuration is in [backend/config/db.js](backend/config/db.js).

Testing and utilities
- There are some test and helper scripts at repository root such as `test-signup.sh` and tests under `backend/` (e.g., `test-auth.js`). See `backend/README.md` for running backend tests.

Where to go next
- See [backend/README.md](backend/README.md) for details about the backend structure and how to run it (Flask and Node instructions).
- See [UnifiedApp/README.md](UnifiedApp/README.md) for the mobile app structure and how to run and develop screens and navigation.

If anything in these READMEs should be expanded (setup examples, env vars, CI steps), tell me which area you'd like more detail on and I'll extend it.

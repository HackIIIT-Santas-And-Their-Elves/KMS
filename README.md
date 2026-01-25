# Khana Management System (KMS)

## APK Download
![alt text](download_qr.png)
https://expo.dev/accounts/rudra20.6/projects/kms-unified/builds/454e8af2-d3a7-4e8f-aa02-8fcb67b4676a

### Problem Statement
Campus food systems face recurring operational inefficiencies that impact both students and canteen operators. These include unpredictable canteen operating hours, long waiting times after ordering, lack of real-time visibility into canteen status, and poor order coordination during peak or late-night hours. Students often waste time and effort walking to closed or overcrowded canteens, while operators struggle with unmanaged demand and order congestion.

KMS is designed to address these issues by making canteen availability reliable, food ordering predictable, and pickup seamless.

---

### Solution Approach

KMS introduces an integrated hardware and software solution tailored specifically for a university campus environment.

At the core of the system is a physical IoT-based availability switch installed at each canteen. This switch acts as the single source of truth for whether a canteen is open or closed, eliminating dependence on schedules or manual digital updates by the canteen operators which they often find complicated.

On top of this real-time availability layer, KMS enables controlled pre-ordering. Canteens can independently choose when to accept online orders, allowing them to manage workload and preparation capacity. Students can place orders remotely and are notified while the order is being prepared, and ready to pick-up shifting the experience from waiting in queues physically to instant pickup.

The entire system is designed mobile-first, ensuring minimal operational overhead for canteen staff and maximum convenience for students and canteen operators.

---

### Technology Stack

**Frontend**

* React Native for cross-platform mobile applications for students and canteen operators

**Backend**

* Node.js with Express for RESTful APIs

**Database**

* MongoDB Atlas for persistent data storage

**Hardware and IoT**

* ESP32 microcontroller for physical switch state detection
* LoRa for low-power, long-range communication between canteens and the central backend
* Optional Raspberry Pi for an on-site canteen dashboard

---

### Key Features Highlighted

* Real-time canteen availability backed by a physical IoT switch convinent for canteen operators.
* Pre-ordering enabled only when canteens are operational and willing to accept demand
* End-to-end order lifecycle management with clear status transitions
* QR-based secure pickup to prevent order misuse or impersonation
* Mobile-first experience designed specifically for campus-scale usage
* Reduced waiting times, crowding, and wasted trips for students
* Low-effort, high-reliability operational control for canteen operators
* Live push notifications to students for key order updates such as order acceptance, preparation, and readiness for pickup.


## Core Features
### Student Application

**View all campus canteens with real-time open and closed status.**

* Browse canteen menus with clear vegetarian and non-vegetarian indicators.

* Add items to a cart and place pre-orders.

* Mock payment integration for demonstration purposes.

* Real-time push notifications for order status changes (accepted, preparing, ready), eliminating the need to manually check the app.


* Live order status tracking from placement to readiness.

* QR code generation for secure and authenticated order pickup.

* Access complete order history for reference and tracking.


### Canteen Application

* Toggle canteen availability to control visibility for students.

* Enable or disable online pre-orders independently of physical availability.

* Manage menus with fine-grained control:

* Add, edit, and delete menu items.

* Toggle item availability during peak or low inventory periods.

* View and manage incoming orders in real time.

* Update order status through a structured workflow:

* Accepted → Preparing → Ready.

* Also added feature to cancel an order by the canteen only. In which case refunds will be given directly to the student.

* Scan QR codes at pickup counters to verify and complete orders securely.

## Running the Code 

### For Using the Deployed App

Download the APK from the link above and install it on your Android device.

The Sever is already hosted on Render.com and the database is hosted on MongoDB Atlas.

> Render is a free service so you may need to wait for few minutes for the server to start.

### For Development

This repository contains a campus food-ordering platform: a backend API in Node and a React Native mobile application (UnifiedApp). The READMEs in this repo explain how the parts are organized and how to run them locally for replication.

Quick links
- Root README: this file
- Backend code: [backend](backend/)
- Mobile app: [UnifiedApp](UnifiedApp/)

Prerequisites
- Node.js (16+)
- npm or yarn
- MongoDB (local or Atlas)
- (Optional) Expo CLI (`npm install -g expo-cli`) if you use Expo for the mobile app

Quick Start (recommended)

1) Backend (Node/Express)

```bash
cd backend
npm install
# create or edit .env (see backend/README.md)
npm run start
```

In .env file add the following:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kms?retryWrites=true&w=majority
PORT=5000
``` 

In UnifiedApp/src/config/api.js add the following:
```bash
export const API_BASE_URL = 'http://[IP Address]:8081/api'; # this is for testing locally
# export const API_BASE_URL = 'https://[Your Domain].com/api'; # this is for production IF YOU HAVE DEPLOYED.
```

2) Mobile app (UnifiedApp)

```bash
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

## Full Disclosure of AI Tools Used

While building this project, we used a few AI tools to help us work faster and clearer:

* Anti-Gravity: Used heavily while coding most parts of the application, mainly to speed up development and reduce repetitive work.

* ChatGPT: To help with ideas, writing the problem statement, and understanding or fixing issues.

* GitHub Copilot: For code suggestions and faster coding.

* Google Gemini: To cross-check ideas and get alternative explanations.

* Claude Opus: To help with debugging the code.


All major decisions, logic, and final code were done by the team. AI tools were only used as support, not as a replacement for our work.

## Any previous work referred/ any open source project used as a base

We did not use any open source project as a base. The solution was built from scratch.

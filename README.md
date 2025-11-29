# UnityCare Home Care Agency Management Platform  
A full-scale Next.js web application designed for home care agencies, with a focus on **Pennsylvania EVV compliance**, operational efficiency, and streamlined agency management workflows.

## 🏥 Overview
This platform provides agency administrators and staff with all tools needed to manage daily operations—including scheduling, visits, employees, clients, billing, EVV compliance dashboards, alerts, and automated workflow tasks.

It is tightly integrated with the UnityCare EVV mobile app for caregivers.

---

## 🚀 Tech Stack
- **Next.js (App Router)**
- **TypeScript**
- **React / ShadCN UI**
- **Prisma ORM**
- **PostgreSQL**
- **Node.js / Express backend**
- **DigitalOcean Deployment**
- **Socket.IO (messaging & real-time updates)**

---

## 📌 Key Features

### **1. Scheduling & Visit Management**
- Create, update, or cancel visits  
- Weekly and monthly schedule overviews  
- Auto-filtering based on employee availability  
- Exception-based alerts for missing EVV data  

### **2. Employee Management**
- Role-based access control (Agency Admin, Agency User, System Admin)  
- Onboarding workflows  
- Certification & compliance tracking  
- HR Alerting system (expiring docs, missing compliance, PTO requests)

### **3. Client Management**
- Demographics  
- Authorized hours & service plans  
- Visit history  
- Billing and audit logs  

### **4. EVV Compliance Tools**
- Timely Audits  
- GPS Exceptions  
- Visit Exceptions  
- Auto/manual visit detection  
- Mileage review modules  
- Compliance thresholds (85% auto-verified required)

### **5. Agency Billing**
- Subscription plans  
- Usage tracking (# of clients, employees, storage)  
- Payment methods & statuses  
- Invoices dashboard  

### **6. Automated Task System**
- Weekly/Monthly/Quarterly tasks  
- Task engine with due-date logic  
- Tasks for Billing Review, Visit Exceptions, Timely Audits, GPS Exceptions, and more  

### **7. Fully Integrated Authentication**
- Secure login  
- 15-minute session expiration  
- Role-based routing  
- Protected dashboards  

---

## 📂 Project Structure (Core)
/app
/dashboard
/visits
/clients
/employees
/system_admin
/billing
/api
/components
/lib
/prisma
/backend (Express server)

---

## 🛠️ Development

### Install Dependencies
npm install

### Strat Dev Sever
npm run dev

### Apply Prisma Migrations
npx prisma migrate dev

### Environment Variables
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_BASE_URL=
SOCKET_SERVER_URL=

## 📦 Deployment
- Deployed on DigitalOcean Droplet
- Reverse-proxy via NGINX
- SSL via Certbot
- Backend + frontend run as PM2 services

## 📄 License
Private proprietary system (do not redistribute without permission).



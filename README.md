# Online Banking System
A full-stack, secure, event-driven online banking platform built as part of a software engineering course project at Rutgers University. This system emulates the core functionalities of real-world banking services, including secure authentication, real-time transactions, credit/debit operations, account and policy management, and third-party API integrations for communication, geolocation, and security.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Testing:** Jasmine, Postman
- **Authentication:** JWT, Google OAuth2, bcrypt
- **APIs & Services:** Twilio, SMTP (Elastic Email), Google reCAPTCHA, Mapbox, Nominatim

## Features
### Core Functionalities
- User authentication with role-based access: Visitor, Customer, Bank Teller, Admin
- Account creation: checking accounts, credit cards, and certified deposits (CDs)
- Fund transfers (internal and external)
- Debit and credit card issuance, lost/stolen card reporting
- Monthly interest calculation and CD maturity logic
- Transaction revocation (within 2 days)
- Admin configuration of business policies, interest rates, and thresholds
- Appointment scheduling with bank representatives

### Dashboards
- Customized views for customers and admins
- Alerts for statements, credit card bills, and transactions via SMS/email

### Security Measures
- JWT-based session management with bcrypt-salted passwords
- Google reCAPTCHA for bot protection on login/signup
- Automatic logout on inactivity

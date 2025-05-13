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

## System Architecture
- **Modular RESTful API design** using Express routers and middleware
- **Service layers** for validation, authentication, authorization, and transactions
- **Middleware security** for route protection based on user roles
- **Event-driven integrations** for SMS, email, and OTP-free notifications

## Database Schema (MySQL)
- **Customer** – Stores user profile info
- **Credentials** – Manages login info per role
- **Accounts** – Multiple accounts per customer
- **Transactions** – Tracks all transaction details
- **Cards** – Includes both debit and credit card metadata
- **Bank_Representative** – Teller and admin details
- **Business_Policies** – Descriptions of bank rules
- **Policy_Rates** – Interest rates and thresholds
- **Meeting_Schedule** – For scheduling appointments

## Third-Party Integrations

| Service               | Purpose                                               |
|-----------------------|-------------------------------------------------------|
| **Twilio**            | SMS alerts for transactions, card statuses, and statements |
| **SMTP (Elastic Email)** | Transactional email alerts                          |
| **Google OAuth2**     | OAuth login for secure session management             |
| **Google reCAPTCHA**  | Prevent bot signups and brute-force attacks           |
| **Mapbox + Nominatim**| Geolocation and interactive branch/ATM maps           |

## Testing & Validation
- **Unit testing** conducted via Jasmine on key transaction workflows
- **Stress testing** and concurrent usage validation with Postman
- Edge-case handling for overdrafts, duplicate submissions, and revocation limits

## Business Logic Highlights
- CD early withdrawal incurs configurable penalties
- Admin-controlled policy changes reflected across dashboards
- Transactions blocked below minimum balance thresholds
- Out-of-network ATM usage incurs tiered fees (set by admin)

## How to Run Locally

This project requires configuration of private services (e.g., MySQL, Twilio, SMTP, JWT) through environment variables, which are not publicly provided.

If you're interested in running or extending the system, you'll need to:
- Set up a local MySQL database based on the schema structure outlined above
- Configure `.env` with your own secrets (DB credentials, JWT secret, email/SMS API keys)
- Install dependencies with `npm install`
- Start the server with `npm start`

**Note:** This project was developed and tested in an academic environment. Full setup details, including credentials and external API keys, are not included in this repository

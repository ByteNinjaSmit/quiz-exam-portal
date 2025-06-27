# Quiz Exam Portal

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [API & Component Overview](#api--component-overview)
- [Contribution Guide](#contribution-guide)
- [FAQ](#faq)
- [Credits](#credits)
- [Backend Deep Dive: Quiz & Code-Judge Controllers](#backend-deep-dive-quiz--code-judge-controllers)

---

## Project Overview

**Quiz Exam Portal** is a full-stack web application designed to facilitate online quizzes, coding contests, and exams for educational institutions, organizations, or competitive platforms. It supports multiple user roles (Admin, Developer, Client/User), real-time code judging, result analytics, and robust authentication. The platform is built for scalability, security, and extensibility.

---

## Features

- **Multi-Role Platform**: Seamlessly supports Admins, Developers, and Users, each with tailored dashboards and permissions, ensuring a secure and organized workflow.
- **Dynamic Exam & Contest Creation**: Admins can craft quizzes, coding exams, and contests with rich question types (MCQ, code, subjective), time limits, and custom settings—all from an intuitive interface.
- **Real-Time Code Judging Engine**: Submissions are processed instantly by a secure, isolated judge worker, providing immediate feedback, detailed error messages, and robust language support.
- **Advanced Leaderboards & Analytics**: Live leaderboards update in real-time, while in-depth analytics help track user performance, identify trends, and highlight top performers.
- **Intelligent Cheat Detection**: The system actively monitors for suspicious behaviors (tab switching, copy-paste, rapid answer changes), logs incidents, and alerts admins for review, ensuring exam integrity.
- **Scalable Microservices Architecture**: Backend services are modular, containerized, and can be scaled independently, supporting thousands of concurrent users and submissions.
- **Developer & Admin Tooling**: Built-in log viewers, user management, and system health dashboards empower platform maintainers to monitor and optimize operations.
- **Modern, Responsive UI/UX**: Built with React and Tailwind CSS, the interface is fast, accessible, and adapts beautifully to all devices.
- **Secure Authentication & Data Protection**: Uses JWT, encrypted passwords, and strict access controls to safeguard user data and platform resources.
- **Easy Deployment & CI/CD Ready**: Fully dockerized for one-command deployment; integrates smoothly with CI/CD pipelines for automated testing and delivery.

---

## Tech Stack

### Frontend
- **React** (with JSX)
- **Vite** (for fast development/build)
- **Tailwind CSS** (utility-first styling)
- **TypeScript** (for type safety, where applicable)

### Backend
- **Node.js** (runtime)
- **Express.js** (REST API framework)
- **MongoDB** (database)
- **Mongoose** (ODM for MongoDB)
- **JWT** (authentication)
- **Docker** (containerization)

### DevOps
- **Docker Compose** (multi-container orchestration)
- **ESLint** (code linting)
- **PostCSS** (CSS processing)

---

## Architecture

The project follows a modular, layered architecture:

- **Client (Frontend)**: Handles all user interactions, routing, and UI rendering. Communicates with the backend via REST APIs.
- **Server (Backend)**: Exposes RESTful endpoints, handles business logic, authentication, and database operations.
- **Database**: Stores users, exams, questions, submissions, results, and logs.
- **Worker/Queue**: Processes code submissions asynchronously for real-time judging.

### High-Level Diagram

```
User <-> React Client <-> Express API <-> MongoDB
                                 |
                                 v
                          Code Judge Worker
```

---

## Folder Structure

```
quiz-exam-portal/
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components (by role)
│   │   ├── lib/           # Utility functions
│   │   ├── store/         # State management
│   │   └── assets/        # Static assets
│   ├── public/            # Public files
│   └── ...                # Config, README, etc.
├── server/                # Backend (Node.js/Express)
│   ├── controllers/       # Route handlers
│   ├── database/          # DB connection & models
│   ├── middlewares/       # Express middlewares
│   ├── router/            # API route definitions
│   ├── utils/             # Utility modules
│   ├── workers/           # Background job workers
│   └── ...                # Config, logs, uploads, etc.
├── docker-compose.yml     # Docker orchestration
└── README.md              # Project documentation
```

---

## How This Is Built & How It Works (In-Depth)

### System Design & Build Process

- **Frontend (React + Vite + Tailwind CSS):**
  - Built as a Single Page Application (SPA) for speed and seamless navigation.
  - Uses modular components and layouts for maintainability and reusability.
  - State management is handled via React context and custom hooks, ensuring efficient data flow and UI updates.
  - Real-time updates (e.g., leaderboards, code judging) are fetched via REST APIs, with potential for WebSocket integration for even faster feedback.

- **Backend (Node.js + Express + MongoDB):**
  - RESTful API design, with clear separation of concerns via controllers, routers, and middlewares.
  - MongoDB (with Mongoose) stores all persistent data: users, exams, questions, submissions, results, logs, and cheat events.
  - Authentication is managed with JWT tokens, and sensitive data is encrypted at rest.
  - Business logic is encapsulated in controllers, while validation and error handling are managed by dedicated middlewares.

- **Code Judging & Worker System:**
  - Code submissions are queued and processed asynchronously by a dedicated worker (job-worker.js), ensuring the main server remains responsive.
  - Each code submission is executed in a secure, sandboxed environment to prevent malicious activity and resource abuse.
  - Results (pass/fail, errors, execution time) are returned to the user in real-time and stored for analytics.

- **Cheat Detection & Logging:**
  - The frontend monitors user actions (focus, clipboard, navigation) and reports suspicious events to the backend.
  - All incidents are logged and can be reviewed by admins or developers for further action.

- **DevOps & Deployment:**
  - Docker and docker-compose orchestrate the frontend, backend, and database services for consistent, reproducible deployments.
  - Environment variables and configuration files allow for easy customization across development, staging, and production.
  - ESLint and PostCSS ensure code quality and modern CSS features.

### Workflow Example

1. **Admin creates a coding contest** via the dashboard, specifying problems, time limits, and participant access.
2. **Users register and join the contest** at the scheduled time, solving problems in the built-in code editor.
3. **Submissions are sent to the backend**, queued, and processed by the judge worker, which runs the code in a sandbox and returns results.
4. **Leaderboard updates in real-time** as users submit solutions, with detailed analytics available post-contest.
5. **Cheat detection logs** are reviewed by admins to ensure fairness and integrity.

This architecture ensures high performance, security, and a seamless experience for all users, from students to administrators and developers.

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB](https://www.mongodb.com/) (if not using Docker)

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/quiz-exam-portal.git
   cd quiz-exam-portal
   ```
2. **Install Dependencies**
   - Frontend:
     ```bash
     cd client
     npm install
     ```
   - Backend:
     ```bash
     cd ../server
     npm install
     ```
3. **Configure Environment**
   - Create `.env` files in `server/` and `client/` as needed (see sample `.env.example` if provided).
4. **Run MongoDB** (if not using Docker):
   ```bash
   mongod
   ```
5. **Start Backend**
   ```bash
   cd server
   npm start
   ```
6. **Start Frontend**
   ```bash
   cd ../client
   npm run dev
   ```
7. **Access the App**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker Deployment

1. **Build & Run All Services**
   ```bash
   docker-compose up --build
   ```
2. **Access the App**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## Usage Guide

- **Register/Login** as a user, admin, or developer.
- **Admins** can create/manage exams, contests, and users from their dashboard.
- **Users** can join available quizzes/contests, submit answers/code, and view results.
- **Developers** can monitor logs, manage admins/users, and oversee system health.

---

## API & Component Overview

### Backend (Express API)
- **Auth**: `/api/auth` (login, register, JWT)
- **User**: `/api/user` (profile, results)
- **Exam/Contest**: `/api/exam`, `/api/code-contest` (CRUD operations)
- **Submission**: `/api/code`, `/api/quiz` (submit answers/code)
- **Logs**: `/api/logs` (developer access)

### Frontend (React Components)
- **Pages**: Located in `src/pages/` (by role: admin, client, dev)
- **Components**: Reusable UI in `src/components/`
- **Layouts**: Shared layouts in `src/components/layout/`
- **State Management**: Auth and global state in `src/store/`
- **Utilities**: Helper functions in `src/lib/`

---

## Contribution Guide

1. **Fork the repository** and create your branch:
   ```bash
   git checkout -b feature/your-feature
   ```
2. **Commit your changes** with clear messages.
3. **Push to your fork** and submit a Pull Request.
4. **Follow code style guidelines** (see ESLint config).
5. **Write clear documentation** for new features.

---

## FAQ

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page or contact your admin.

**Q: How are code submissions evaluated?**
A: Code is sent to a secure judge worker, executed in a sandbox, and results are returned in real-time.

**Q: Can I add new question types?**
A: Yes, extend the question model and update the frontend components accordingly.

**Q: How do I report a bug or request a feature?**
A: Open an issue or submit a pull request on GitHub.

---

## Credits

- **Project Lead**: [Your Name]
- **Contributors**: [List of contributors]
- **Inspiration**: LeetCode, HackerRank, Google Forms
- **License**: MIT

---

## Backend Deep Dive: Quiz & Code-Judge Controllers

### Quiz Controller

The **Quiz Controller** is responsible for all quiz-related operations, ensuring a seamless experience for both admins (who create/manage quizzes) and users (who participate in them).

**Key Responsibilities:**
- Creating, updating, and deleting quizzes and their questions.
- Managing quiz schedules, time limits, and participant access.
- Handling user quiz attempts, answer submissions, and auto-grading (for objective questions).
- Fetching quiz results, analytics, and user performance data.
- Enforcing security and integrity (e.g., preventing multiple attempts, timing out sessions).

**Typical Endpoints:**
- `POST /api/quiz` — Create a new quiz (admin only)
- `PUT /api/quiz/:id` — Edit an existing quiz
- `DELETE /api/quiz/:id` — Remove a quiz
- `GET /api/quiz` — List all available quizzes
- `GET /api/quiz/:id` — Fetch quiz details (with or without answers, based on user role)
- `POST /api/quiz/:id/submit` — Submit answers for grading
- `GET /api/quiz/:id/results` — Get results and analytics

**Workflow Example:**
1. Admin creates a quiz with a set of questions and a time window.
2. User fetches the quiz, attempts it, and submits answers.
3. Controller validates the submission, auto-grades objective questions, and stores results.
4. Results and analytics are made available to both users and admins, with detailed breakdowns.

**Robustness & Scalability:**
- Uses middleware for authentication, validation, and rate limiting.
- Supports bulk operations for efficient quiz/question management.
- Designed to handle high concurrency during large-scale exams.

---

### Code-Judge Controller

The **Code-Judge Controller** is the heart of the platform's coding contest and code evaluation system. It manages the lifecycle of code problems, user submissions, and real-time judging.

**Key Responsibilities:**
- Creating, updating, and deleting coding problems (with test cases, constraints, and metadata).
- Accepting user code submissions in multiple programming languages.
- Queuing submissions for asynchronous, secure evaluation by the judge worker.
- Returning detailed feedback (pass/fail, error messages, execution stats) to users.
- Aggregating results for leaderboards and analytics.

**Typical Endpoints:**
- `POST /api/code-problem` — Create a new coding problem (admin/developer)
- `PUT /api/code-problem/:id` — Edit a coding problem
- `DELETE /api/code-problem/:id` — Remove a problem
- `GET /api/code-problem` — List all problems
- `GET /api/code-problem/:id` — Fetch problem details
- `POST /api/code/:problemId/submit` — Submit code for judging
- `GET /api/code/:submissionId/result` — Get submission result and feedback

**Workflow Example:**
1. Admin or developer defines a coding problem with sample and hidden test cases.
2. User writes and submits code via the in-browser editor.
3. Controller receives the submission, stores it, and places it in the job queue.
4. Judge worker picks up the job, runs the code in a sandbox, and updates the result.
5. User receives instant feedback; results are used for leaderboards and analytics.

**Security & Performance:**
- All code is executed in isolated, resource-limited containers to prevent abuse.
- Submissions are rate-limited and validated for language, size, and runtime.
- The system is horizontally scalable: multiple judge workers can be deployed to handle high submission volumes.

**Integration:**
- Closely integrated with user, contest, and leaderboard modules.
- Logs all submissions and results for audit and analytics.

---

> _This project is open-source and welcomes contributions!_ 
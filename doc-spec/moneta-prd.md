

# Moneta, a Personal Expense Tracker Web Application - Product Requirements Document

## 1. Project Overview

### 1.1. Project Title

**Moneta, a Personal Expense Tracker Web Application**

This document outlines the requirements for a personal finance management web application designed for individual use. The primary objective is to provide a fast, efficient, and user-friendly tool for tracking income and expenses, visualizing financial health, and gaining insights into spending habits. The application will be built using a modern technology stack, including TypeScript, Vite, React, Hono.js, and PostgreSQL, and will be deployed on a personal VPS. The development process will prioritize speed and simplicity, leveraging pre-built components and libraries like Shadcn UI and Better Auth to accelerate the build and deployment cycle. The application will be accessible via a subdomain and will feature a secure authentication system, a comprehensive dashboard with data visualizations, and dedicated pages for managing income and expense entries.

### 1.2. Document Version & Date

**Document Version:** 1.0.0  
**Creation Date:** November 24, 2025  
**Last Modified:** November 24, 2025  
**Author:** Erdhy Ernando Davis  
**Status:** Draft

This version of the Product Requirements Document (PRD) serves as the initial blueprint for the development of the Moneta, a Personal Expense Tracker web application. It details the project's vision, functional and non-functional requirements, technical specifications, and implementation plan. As a living document, it will be updated and refined throughout the development lifecycle to reflect any changes in scope, design, or technical approach. The document is structured to provide a clear and comprehensive guide for all stakeholders, ensuring alignment and a shared understanding of the project's goals and deliverables. Regular reviews and revisions will be conducted to maintain its accuracy and relevance, with version control in place to track all modifications.

### 1.3. Project Vision & Goals

**Vision:**  
To create a simple, fast, and reliable personal finance web application that empowers users to effortlessly track their income and expenses, visualize their financial health, and make more informed financial decisions. The application will be designed for personal use, focusing on a streamlined user experience and rapid development and deployment.

**Goals:**  
1.  **Rapid Development and Deployment:** Leverage a modern, efficient tech stack (TypeScript, Vite, React, Hono.js) and pre-built libraries (Shadcn UI, Better Auth) to build and deploy the application quickly on a personal VPS.
2.  **User-Friendly Financial Tracking:** Provide an intuitive interface for users to easily log income and expenses, categorize transactions, and view their financial history.
3.  **Data Visualization and Insights:** Offer a comprehensive dashboard with interactive charts and summaries to help users understand their spending patterns, track their financial progress, and identify areas for improvement.
4.  **Secure and Private Access:** Implement a secure authentication system using Better Auth to ensure that only the authorized user can access their financial data.
5.  **Maintainable and Scalable Architecture:** Design a clean and modular codebase that is easy to maintain and can be extended with new features in the future.

### 1.4. Target User & Persona

**Target User:**  
The primary target user for this application is a tech-savvy individual who wants a simple and efficient way to manage their personal finances. This user is comfortable with web applications and prefers a self-hosted solution for privacy and control.

**User Persona: "Alex"**  
-   **Name:** Alex  
-   **Age:** 28-45  
-   **Occupation:** Software Developer / Engineer  
-   **Technical Proficiency:** High. Alex is familiar with modern web technologies and is comfortable using command-line tools and self-hosting applications.  
-   **Financial Goals:** Alex wants to gain a clear understanding of their spending habits, track their income and expenses, and make more informed financial decisions. They are not looking for a complex, feature-rich financial planning tool, but rather a straightforward and reliable expense tracker.  
-   **Pain Points:**  
    -   Existing expense tracking solutions are either too complex, too expensive, or do not offer the level of privacy and control desired.  
    -   Manual tracking methods (e.g., spreadsheets) are cumbersome and do not provide useful visualizations.  
-   **Motivations:**  
    -   To have a clear and organized view of their financial situation.  
    -   To identify areas where they can save money.  
    -   To have a simple, fast, and private tool that they can customize and control.

### 1.5. Success Metrics

The success of this project will be measured based on the following key performance indicators (KPIs):

1.  **Development Speed:** The project should be completed and deployed within a short timeframe, ideally within a few days to a week, to meet the "fast to build and deploy" requirement.
2.  **Functional Completeness:** The application must successfully implement all core features as outlined in the PRD, including user authentication, income/expense tracking, and a functional dashboard with data visualizations.
3.  **User Experience (UX):** The application should be intuitive and easy to use, with a clean and responsive interface. The user should be able to log a transaction within a few seconds.
4.  **Data Accuracy:** All financial data entered by the user should be accurately stored, retrieved, and displayed. Calculations for summaries and visualizations must be correct.
5.  **System Reliability:** The application should be stable and performant, with minimal downtime or errors. It should handle typical user interactions smoothly.
6.  **Security:** The authentication system must be secure, and user data should be protected from unauthorized access.

### 1.6. Scope & Out of Scope

**In Scope:**  
-   A single-user web application for personal expense tracking.
-   User authentication and authorization using email and password (Better Auth).
-   A login page.
-   A home dashboard with financial summaries and data visualizations (bar charts, line charts).
-   Filtering capabilities on the dashboard (weekly, monthly, yearly views).
-   An `/income` page to add and view income entries with categories.
-   An `/expense` page to add and view expense entries with categories.
-   A predefined set of categories for income and expenses.
-   A PostgreSQL database to store user and financial data.
-   A Hono.js backend API to handle data operations.
-   A React frontend built with Vite and TypeScript.
-   A responsive UI styled with Tailwind CSS and Shadcn UI components.
-   Deployment to a personal VPS using Dokploy on a subdomain.

**Out of Scope:**  
-   Multi-user support or account sharing.
-   Advanced financial features like budgeting, goal setting, or investment tracking.
-   Bank account integration or automatic transaction import.
-   Mobile application (native iOS or Android).
-   Offline functionality.
-   Advanced data analytics or machine learning insights.
-   Email notifications or reminders.
-   Currency conversion for international transactions.
-   Receipt scanning or OCR capabilities.
-   Data export/import functionality (e.g., CSV, PDF).

## 2. Functional Requirements & User Stories

### 2.1. Core Features Overview

The Personal Expense Tracker web application will be built around a set of core features designed to provide a comprehensive yet simple financial management experience. These features are centered on user authentication, data visualization, and the management of income and expense transactions. The application will be structured to ensure a logical and intuitive user flow, from secure login to detailed financial analysis. Each feature is broken down into specific user stories with clear acceptance criteria to guide the development process and ensure that the final product meets the user's needs. The focus is on creating a minimal viable product (MVP) that is functional, reliable, and easy to use, with the potential for future enhancements.

The core features can be categorized as follows:

1.  **User Authentication:** A secure login system to protect user data and ensure privacy. This will be implemented using the Better Auth library, providing a simple and robust email/password authentication flow.
2.  **Dashboard View:** A central hub for financial overview, displaying key metrics, summaries, and visualizations. This will be the primary landing page after login, offering insights into income, expenses, and net balance.
3.  **Income Management:** A dedicated interface for users to record and categorize their income sources. This will include a form for adding new income entries and a view to see the history of all income transactions.
4.  **Expense Management:** A similar interface for managing expenses, allowing users to log their spending with relevant categories and descriptions. This will also include a historical view of all expenses.

These features are designed to work together to provide a complete picture of the user's financial situation, enabling them to track their money flow and make more informed decisions.

### 2.2. User Story: User Authentication

#### 2.2.1. Story: As a user, I want to log in with my email and password

As a user of the Personal Expense Tracker, I need a secure and straightforward way to access my financial data. I want to be able to log in to the application using my registered email address and a password. This will ensure that my personal financial information is protected and that only I can view and manage it. The login process should be simple and intuitive, with clear input fields for my credentials and a clear call-to-action button to sign in. In case I enter incorrect credentials, I expect to see a helpful error message that informs me of the issue without compromising security. The authentication system should be reliable and integrate seamlessly with the rest of the application, providing a smooth transition to the main dashboard upon successful login.

#### 2.2.2. Acceptance Criteria

-   **AC1:** The login page must display two input fields: one for email and one for password.
-   **AC2:** The email field must validate that the input is in a valid email format (e.g., `user@example.com`).
-   **AC3:** The password field must mask the input characters for security.
-   **AC4:** A "Sign In" button must be present, which is disabled until both email and password fields are filled.
-   **AC5:** Upon clicking "Sign In," the application must send a request to the backend authentication endpoint (`POST /auth/sign-in`).
-   **AC6:** If the credentials are correct, the user must be redirected to the dashboard page (`/`).
-   **AC7:** If the credentials are incorrect, a generic error message must be displayed (e.g., "Invalid email or password").
-   **AC8:** The application must store a secure session token upon successful login to maintain the user's authenticated state.
-   **AC9:** The user must be able to log out, which clears the session and redirects them to the login page.
-   **AC10:** All authenticated routes must be protected, and users who are not logged in must be redirected to the login page.

### 2.3. User Story: Dashboard View

#### 2.3.1. Story: As a user, I want to see a summary of my financial data

As a user, once I log in, I want to be presented with a comprehensive dashboard that gives me an immediate overview of my financial status. This dashboard should be the central hub of the application, providing a clear and concise summary of my income, expenses, and net balance. I want to be able to see this information at a glance, without having to navigate to different pages. The dashboard should also include visual representations of my financial data, such as charts and graphs, to help me better understand my spending and earning patterns. I would like the ability to filter this data by different time periods, such as weekly, monthly, or yearly, to analyze my financial trends over time. The dashboard should be well-organized and easy to read, with a clean and modern design that makes it a pleasure to use.

#### 2.3.2. Acceptance Criteria

-   **AC1:** The dashboard must be the default landing page after a successful login.
-   **AC2:** The dashboard must display a summary of total income, total expenses, and net balance (income - expenses).
-   **AC3:** The summary data must be filterable by time period: "This Week," "This Month," and "This Year."
-   **AC4:** The default view must be "This Month."
-   **AC5:** The dashboard must display a bar or line chart showing income vs. expenses over the selected time period.
-   **AC6:** The dashboard must display a pie or donut chart showing the breakdown of expenses by category for the selected time period.
-   **AC7:** The dashboard must display a list or table of recent transactions (both income and expenses).
-   **AC8:** All data displayed on the dashboard must be fetched from the backend API and must be specific to the logged-in user.
-   **AC9:** The dashboard must be responsive and display correctly on different screen sizes.
-   **AC10:** The UI must use the Shadcn UI component library for a consistent and modern look and feel.

### 2.4. User Story: Income Management

#### 2.4.1. Story: As a user, I want to add and view my income

As a user, I need a dedicated section of the application to manage my income. I want to be able to add new income entries, specifying the amount, the source or category (e.g., salary, freelance, gift), and a brief description. It should also allow me to set the date and time for the income entry, in case I want to log it for a past date. Once I've added an income entry, I want to be able to see it in a list or table, along with all my other income transactions. This list should be sortable, perhaps by date, and should show the key details of each entry. This will help me keep a clear record of all the money I've received and from what sources, which is essential for understanding my overall financial picture.

#### 2.4.2. Acceptance Criteria

-   **AC1:** There must be a dedicated page/route for income management (e.g., `/income`).
-   **AC2:** The income page must include a form to add a new income entry.
-   **AC3:** The form must have fields for: amount (number), category (dropdown), description (text), and date/time.
-   **AC4:** The amount field must only accept positive numbers.
-   **AC5:** The category dropdown must be populated with a predefined list of income categories (e.g., Salary, Freelance, Gift, Reimbursement).
-   **AC6:** The date/time picker must allow the user to select a date and time for the income entry.
-   **AC7:** Upon submitting the form, a new income record must be created in the database via the backend API (`POST /api/incomes`).
-   **AC8:** The page must display a list or table of all income entries for the logged-in user, sorted by date (newest first).
-   **AC9:** Each entry in the list must display the amount, category, description, and date.
-   **AC10:** The form must be cleared after a successful submission, and the new entry must appear in the list without requiring a page refresh.

### 2.5. User Story: Expense Management

#### 2.5.1. Story: As a user, I want to add and view my expenses

As a user, I need a separate section to manage my expenses, similar to the income section. I want to be able to log every expense I make, including the amount, the category (e.g., groceries, rent, entertainment), and a description of what the expense was for. I also want to be able to set the date and time for the expense entry. After adding an expense, I want to see it listed with all my other expenses, so I can keep track of where my money is going. This will be crucial for me to analyze my spending habits and identify areas where I might be overspending. The interface should be simple and efficient, allowing me to quickly add an expense and move on.

#### 2.5.2. Acceptance Criteria

-   **AC1:** There must be a dedicated page/route for expense management (e.g., `/expense`).
-   **AC2:** The expense page must include a form to add a new expense entry.
-   **AC3:** The form must have fields for: amount (number), category (dropdown), description (text), and date/time.
-   **AC4:** The amount field must only accept positive numbers.
-   **AC5:** The category dropdown must be populated with a predefined list of expense categories (e.g., Rent, Groceries, Food/Restaurant, Utilities, Subscription, Health, Travel, Investment, Entertainment).
-   **AC6:** The date/time picker must allow the user to select a date and time for the expense entry.
-   **AC7:** Upon submitting the form, a new expense record must be created in the database via the backend API (`POST /api/expenses`).
-   **AC8:** The page must display a list or table of all expense entries for the logged-in user, sorted by date (newest first).
-   **AC9:** Each entry in the list must display the amount, category, description, and date.
-   **AC10:** The form must be cleared after a successful submission, and the new entry must appear in the list without requiring a page refresh.

## 3. Technical Specifications

### 3.1. Technology Stack

The technology stack has been carefully selected to meet the project's primary goal of rapid development and deployment while ensuring a modern, maintainable, and performant application. The combination of these technologies provides a robust foundation for building a full-stack web application with a rich user interface and a secure, efficient backend.

| Component | Technology | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React (with TypeScript) | Building the user interface (UI). | A widely adopted, component-based library with a vast ecosystem, ensuring rapid development and long-term maintainability. TypeScript adds type safety, reducing runtime errors. |
| **Build Tool** | Vite | Bundling and serving the frontend application. | Offers an exceptionally fast development server and optimized build process, significantly speeding up the development workflow compared to older tools like Create React App. |
| **Routing** | TanStack Router | Managing client-side navigation and routes. | A modern, type-safe router with built-in features like data loading and code-splitting, which simplifies complex routing logic and improves performance. |
| **Backend Framework** | Hono.js | Building the server-side API. | A fast, lightweight, and web-standard-based framework for building APIs. Its simplicity and performance make it ideal for a quick-to-deploy backend. |
| **Database** | PostgreSQL | Storing application data (users, transactions, categories). | A powerful, open-source relational database known for its reliability, data integrity, and support for complex queries, making it suitable for financial data. |
| **Authentication** | Better Auth | Handling user authentication and session management. | A modern, framework-agnostic authentication library that simplifies the implementation of secure login/logout flows, saving significant development time. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for styling components. | Allows for rapid UI development directly in markup without writing custom CSS, ensuring a consistent and responsive design with minimal effort. |
| **UI Components** | Shadcn UI | A collection of accessible and customizable components. | Provides pre-built, high-quality components that can be copied directly into the project, drastically accelerating the creation of a polished and accessible UI. |
| **Data Visualization** | Recharts | A composable charting library for React. | Integrates seamlessly with React and is the recommended visualization library for Shadcn UI, making it the perfect choice for creating the dashboard charts. |

*Table 1: Technology Stack Overview*

#### 3.1.1. Frontend Framework & Build Tools

The frontend will be built with **React** and **TypeScript**, providing a robust and type-safe foundation for the user interface. **Vite** will be used as the build tool, offering a significantly faster and more streamlined development experience compared to traditional tools. Its Hot Module Replacement (HMR) allows for near-instantaneous updates in the browser during development, which is a key factor in achieving the project's goal of rapid iteration. **TanStack Router** will handle all client-side routing, providing a type-safe way to manage navigation between the login, dashboard, income, and expense pages. Its features, such as data loaders, will allow the application to fetch necessary data before a page is rendered, leading to a smoother user experience.

#### 3.1.2. Backend Framework & Language

The backend API will be developed using **Hono.js**, a fast and lightweight web framework designed for the modern web. Hono.js is built on web standards like `Fetch` and `Web Crypto`, making it highly performant and portable. Its minimalist design allows for the quick creation of RESTful APIs without the overhead of larger, more complex frameworks. The backend will be written in **TypeScript** to maintain consistency with the frontend and leverage the benefits of static typing for the server-side logic. This unified language approach simplifies the development process and reduces context switching for the developer.

#### 3.1.3. Database

**PostgreSQL** has been chosen as the relational database for its proven reliability, robustness, and strong support for ACID (Atomicity, Consistency, Isolation, Durability) transactions, which is critical for handling financial data. It will store all persistent data, including user account information, transaction records (income and expenses), and predefined categories. The structured nature of a relational database is well-suited for the application's data model, which involves clear relationships between users and their transactions. Its powerful querying capabilities will also be essential for generating the aggregated data needed for the dashboard visualizations.

#### 3.1.4. Authentication Library

**Better Auth** will be integrated to handle all authentication-related tasks. This library provides a comprehensive, secure, and easy-to-implement solution for user authentication. It will manage user registration (if needed), login, logout, and session management. By using Better Auth, the project can avoid the significant time and effort required to build a secure authentication system from scratch, including handling password hashing, session tokens, and protection against common vulnerabilities. This aligns perfectly with the goal of rapid development while ensuring a high level of security.

#### 3.1.5. Styling & UI Components

The user interface will be styled using **Tailwind CSS**, a utility-first CSS framework that enables rapid UI development. Instead of writing custom CSS, developers can apply pre-defined utility classes directly in the HTML/JSX, which significantly speeds up the styling process and helps maintain a consistent design system. For UI components, **Shadcn UI** will be used. This is not a traditional component library but a collection of copy-pasteable, accessible, and highly customizable components built with Radix UI and Tailwind CSS. This approach provides the speed of using a component library with the flexibility of having full ownership and control over the component code.

#### 3.1.6. Data Visualization

For the dashboard's charts and graphs, **Recharts** will be the library of choice. It is a composable and declarative charting library built specifically for React. Its component-based API fits naturally with the React paradigm, making it easy to create and customize various types of charts, such as bar charts for income vs. expenses and pie charts for expense breakdowns. Recharts is also the recommended visualization library in the Shadcn UI ecosystem, ensuring seamless integration and a consistent look and feel with the rest of the application's components.

### 3.2. System Architecture & Deployment

#### 3.2.1. Hosting Environment

The application will be hosted on a **Virtual Private Server (VPS)** . This provides full control over the server environment, allowing for custom configurations and ensuring privacy, as the data will be self-hosted. The VPS will run a Linux-based operating system (e.g., Ubuntu) and will be configured with the necessary software, including Node.js for the backend, a process manager like PM2, and a reverse proxy like Nginx to handle incoming traffic and SSL certificates.

#### 3.2.2. Deployment Strategy with Dokploy

**Dokploy** will be used as the deployment platform. Dokploy is a self-hosted, open-source platform-as-a-service (PaaS) that simplifies the process of deploying and managing applications on a VPS. It provides a user-friendly web interface to manage deployments, databases, and environment variables. The application will be deployed on a **subdomain** (e.g., `expense.yourdomain.com`). The deployment process will involve connecting the Dokploy instance to the application's Git repository. When changes are pushed to the main branch, Dokploy will automatically trigger a new build and deployment, implementing a continuous deployment (CD) pipeline. This strategy significantly streamlines the deployment process, making it as simple as a `git push`.

## 4. Database Schema Design

### 4.1. Entity Relationship Diagram (ERD) Overview

The database schema is designed to be simple and efficient, reflecting the core requirements of the application. It consists of four main entities: `users`, `categories`, `incomes`, and `expenses`. The `users` table stores authentication-related information. The `categories` table holds predefined categories for both income and expenses. The `incomes` and `expenses` tables store the financial transaction records, each linked to a user and a category. This relational structure allows for easy querying and aggregation of financial data for the dashboard.

### 4.2. Table: `users`

#### 4.2.1. Purpose

The `users` table stores the core information for each user of the application. This table is primarily managed by the Better Auth library, which will handle user registration and authentication. It will store the user's unique identifier, email address, and hashed password.

#### 4.2.2. Fields & Data Types

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | A unique identifier for the user, typically a UUID generated by Better Auth. |
| `email` | `TEXT` | `UNIQUE`, `NOT NULL` | The user's email address, used for login. |
| `password` | `TEXT` | `NOT NULL` | The user's hashed password, managed by Better Auth. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of when the user account was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of the last update to the user record. |

*Table 2: `users` Table Schema*

### 4.3. Table: `categories`

#### 4.3.1. Purpose

The `categories` table stores the predefined list of categories for both income and expenses. This allows for consistent categorization of transactions and enables the application to generate meaningful reports and visualizations based on these categories. The table includes a `type` field to distinguish between income and expense categories.

#### 4.3.2. Fields & Data Types

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | A unique auto-incrementing integer ID for the category. |
| `name` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | The name of the category (e.g., 'Salary', 'Groceries'). |
| `type` | `VARCHAR(10)` | `NOT NULL`, `CHECK (type IN ('income', 'expense'))` | The type of category, either 'income' or 'expense'. |

*Table 3: `categories` Table Schema*

### 4.4. Table: `incomes`

#### 4.4.1. Purpose

The `incomes` table stores all income-related transactions for every user. Each record represents a single income entry, including the amount, a reference to the user who logged it, the category it belongs to, a description, and the date and time of the transaction.

#### 4.4.2. Fields & Data Types

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | A unique auto-incrementing integer ID for the income entry. |
| `user_id` | `TEXT` | `NOT NULL`, `FOREIGN KEY REFERENCES users(id)` | The ID of the user who logged this income. |
| `category_id` | `INTEGER` | `NOT NULL`, `FOREIGN KEY REFERENCES categories(id)` | The ID of the category this income belongs to. |
| `amount` | `NUMERIC(10, 2)` | `NOT NULL`, `CHECK (amount > 0)` | The amount of the income. |
| `description` | `TEXT` | | An optional description of the income source. |
| `date` | `TIMESTAMP` | `NOT NULL` | The date and time of the income transaction. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of when the record was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of the last update to the record. |

*Table 4: `incomes` Table Schema*

### 4.5. Table: `expenses`

#### 4.5.1. Purpose

The `expenses` table is analogous to the `incomes` table but stores all expense-related transactions. Each record details a single expense, including the amount, the user, the category, a description, and the transaction date and time.

#### 4.5.2. Fields & Data Types

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | A unique auto-incrementing integer ID for the expense entry. |
| `user_id` | `TEXT` | `NOT NULL`, `FOREIGN KEY REFERENCES users(id)` | The ID of the user who logged this expense. |
| `category_id` | `INTEGER` | `NOT NULL`, `FOREIGN KEY REFERENCES categories(id)` | The ID of the category this expense belongs to. |
| `amount` | `NUMERIC(10, 2)` | `NOT NULL`, `CHECK (amount > 0)` | The amount of the expense. |
| `description` | `TEXT` | | An optional description of the expense. |
| `date` | `TIMESTAMP` | `NOT NULL` | The date and time of the expense transaction. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of when the record was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | The timestamp of the last update to the record. |

*Table 5: `expenses` Table Schema*

## 5. API Specification

### 5.1. Base URL & Authentication

-   **Base URL:** `https://expense.yourdomain.com`
-   **Authentication:** All protected API endpoints (those under `/api/*`) will require a valid session cookie, which is set by the Better Auth library upon successful login. The backend middleware will verify this cookie for each request to a protected route.

### 5.2. Authentication Endpoints (Better Auth)

These endpoints are provided and managed by the Better Auth library. The frontend will interact with them to perform authentication actions.

#### 5.2.1. `POST /auth/sign-in`

-   **Description:** Authenticates a user with their email and password.
-   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "userpassword"
    }
    ```
-   **Response (Success - 200 OK):**
    -   Sets a secure session cookie.
    -   Returns user data (excluding password).
    ```json
    {
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "created_at": "2025-11-24T10:00:00Z"
      }
    }
    ```
-   **Response (Error - 401 Unauthorized):**
    ```json
    {
      "error": "Invalid email or password"
    }
    ```

#### 5.2.2. `POST /auth/sign-out`

-   **Description:** Signs out the current user by clearing the session cookie.
-   **Request Body:** None.
-   **Response (Success - 200 OK):**
    -   Clears the session cookie.
    ```json
    {
      "message": "Signed out successfully"
    }
    ```

### 5.3. Income Management Endpoints

#### 5.3.1. `GET /api/incomes`

-   **Description:** Retrieves a list of all income entries for the authenticated user.
-   **Query Parameters:**
    -   `start_date` (optional): Filter incomes from this date (ISO 8601 format).
    -   `end_date` (optional): Filter incomes until this date (ISO 8601 format).
-   **Response (Success - 200 OK):**
    ```json
    {
      "incomes": [
        {
          "id": 1,
          "amount": 5000.00,
          "description": "Monthly Salary",
          "date": "2025-11-01T09:00:00Z",
          "category": {
            "id": 1,
            "name": "Salary"
          }
        }
      ]
    }
    ```

#### 5.3.2. `POST /api/incomes`

-   **Description:** Creates a new income entry for the authenticated user.
-   **Request Body:**
    ```json
    {
      "amount": 250.00,
      "category_id": 2,
      "description": "Freelance project payment",
      "date": "2025-11-24T14:30:00Z"
    }
    ```
-   **Response (Success - 201 Created):**
    ```json
    {
      "id": 2,
      "amount": 250.00,
      "description": "Freelance project payment",
      "date": "2025-11-24T14:30:00Z",
      "category": {
        "id": 2,
        "name": "Freelance"
      }
    }
    ```

### 5.4. Expense Management Endpoints

#### 5.4.1. `GET /api/expenses`

-   **Description:** Retrieves a list of all expense entries for the authenticated user.
-   **Query Parameters:**
    -   `start_date` (optional): Filter expenses from this date (ISO 8601 format).
    -   `end_date` (optional): Filter expenses until this date (ISO 8601 format).
-   **Response (Success - 200 OK):**
    ```json
    {
      "expenses": [
        {
          "id": 1,
          "amount": 50.75,
          "description": "Weekly groceries",
          "date": "2025-11-23T11:00:00Z",
          "category": {
            "id": 5,
            "name": "Groceries"
          }
        }
      ]
    }
    ```

#### 5.4.2. `POST /api/expenses`

-   **Description:** Creates a new expense entry for the authenticated user.
-   **Request Body:**
    ```json
    {
      "amount": 12.50,
      "category_id": 8,
      "description": "Coffee and pastry",
      "date": "2025-11-24T08:15:00Z"
    }
    ```
-   **Response (Success - 201 Created):**
    ```json
    {
      "id": 2,
      "amount": 12.50,
      "description": "Coffee and pastry",
      "date": "2025-11-24T08:15:00Z",
      "category": {
        "id": 8,
        "name": "Food/Restaurant"
      }
    }
    ```

### 5.5. Category Management Endpoints

#### 5.5.1. `GET /api/categories`

-   **Description:** Retrieves the list of all predefined categories, for both income and expenses.
-   **Response (Success - 200 OK):**
    ```json
    {
      "categories": [
        { "id": 1, "name": "Salary", "type": "income" },
        { "id": 2, "name": "Freelance", "type": "income" },
        { "id": 3, "name": "Gift", "type": "income" },
        { "id": 4, "name": "Rent", "type": "expense" },
        { "id": 5, "name": "Groceries", "type": "expense" },
        { "id": 6, "name": "Utilities", "type": "expense" }
      ]
    }
    ```

## 6. Frontend Application Structure & Routes

### 6.1. Recommended Project File Structure

A well-organized file structure is crucial for maintainability and scalability. The following structure is recommended, separating the frontend and backend code into distinct directories within a monorepo.

```
expense-tracker/
├── apps/
│   ├── web/                    # Frontend React application (Vite)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components (Shadcn)
│   │   │   ├── lib/            # Utility functions, API clients
│   │   │   ├── routes/         # TanStack Router route definitions
│   │   │   │   ├── __root.tsx  # Root route layout
│   │   │   │   ├── index.tsx   # Dashboard route (/)
│   │   │   │   ├── login.tsx   # Login route (/login)
│   │   │   │   ├── income.tsx  # Income route (/income)
│   │   │   │   └── expense.tsx # Expense route (/expense)
│   │   │   ├── main.tsx        # Application entry point
│   │   │   └── router.tsx      # Router configuration
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/                 # Backend Hono.js application
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   │   ├── incomes.ts
│       │   │   ├── expenses.ts
│       │   │   └── categories.ts
│       │   ├── index.ts        # Server entry point
│       │   └── lib/            # Backend utilities
│       ├── package.json
│       └── tsconfig.json
├── packages/                   # Shared packages
│   ├── auth/                   # Authentication logic (Better Auth)
│   ├── db/                     # Database schema and client (Drizzle)
│   └── config/                 # Shared configuration
├── docker-compose.yml          # For local database
└── README.md
```

### 6.2. Route Definitions (TanStack Router)

TanStack Router uses a file-based routing system. The structure within the `src/routes/` directory will automatically generate the application's routes.

#### 6.2.1. Public Routes

-   **`/login`**: The login page. This route should not be protected and should redirect to the dashboard if the user is already authenticated.

#### 6.2.2. Authenticated Routes

-   **`/`**: The main dashboard page. This is the primary landing page after login.
-   **`/income`**: The page for managing income entries.
-   **`/expense`**: The page for managing expense entries.

All authenticated routes will be wrapped in a layout component that checks for a valid session. If no session is found, the user will be redirected to the `/login` page.

### 6.3. Page Components

Each route will have a corresponding page component that serves as the main container for that view.

#### 6.3.1. Login Page

This page will contain a simple form with email and password fields. It will use the `better-auth` client library to make a request to the `POST /auth/sign-in` endpoint. Upon success, it will redirect to the dashboard. It will be styled using Shadcn UI components like `Card`, `Input`, and `Button`.

#### 6.3.2. Dashboard Page

This is the most complex page, serving as the central hub of the application. It will:
-   Fetch summary data (total income, expenses, net balance) for the selected time period.
-   Fetch data for the income vs. expense chart.
-   Fetch data for the expense breakdown chart.
-   Fetch a list of recent transactions.
It will use Recharts to render the charts and Shadcn UI components like `Card` and `Tabs` for layout and filtering.

#### 6.3.3. Income Page

This page will feature a form to add new income entries and a table or list displaying all historical income. The form will include fields for amount, category (dropdown populated from `/api/categories`), description, and date. The submission will make a `POST` request to `/api/incomes`. The list of incomes will be fetched from `GET /api/incomes`.

#### 6.3.4. Expense Page

This page will be structurally identical to the income page but will be dedicated to managing expenses. It will have a form for adding new expenses (posting to `/api/expenses`) and a list of all past expenses (fetched from `GET /api/expenses`). The category dropdown will be filtered to show only expense-type categories.

## 7. UI/UX Design & Data Visualization

### 7.1. Design System (Shadcn UI & Tailwind CSS)

The application's UI will be built upon the **Shadcn UI** design system, which is in turn built with **Tailwind CSS**. This combination provides a set of beautifully designed, accessible, and customizable components that can be easily integrated into the project. The primary benefits of this approach are:
-   **Speed:** No need to build common UI elements like buttons, forms, modals, and cards from scratch.
-   **Consistency:** All components follow a consistent design language, ensuring a cohesive and professional look and feel across the entire application.
-   **Accessibility:** Shadcn UI components are built on top of Radix UI, which prioritizes accessibility (a11y) out of the box.
-   **Customization:** Since the component code is copied directly into the project, it can be easily modified to fit specific needs without being constrained by the limitations of a traditional npm package.

The overall aesthetic will be clean, modern, and minimalist, focusing on clarity and ease of use. A light color theme will be used by default to ensure excellent readability of financial data.

### 7.2. Dashboard Visualizations (Recharts)

The dashboard will be the centerpiece of the application, providing users with immediate insights into their financial health through interactive charts built with **Recharts**.

#### 7.2.1. Summary Cards

At the top of the dashboard, a row of summary cards will display the most critical metrics for the selected time period:
-   **Total Income:** Displayed in a prominent green color.
-   **Total Expenses:** Displayed in a prominent red color.
-   **Net Balance:** Calculated as (Total Income - Total Expenses). The color (green for positive, red for negative) will provide an immediate visual cue of the user's financial status.

#### 7.2.2. Income vs. Expense Bar/Line Chart

A large, central chart will visualize the trend of income versus expenses over time. This chart will be dynamic based on the selected filter:
-   **Weekly View:** A bar chart showing daily income and expenses for the current week.
-   **Monthly View:** A line chart showing the cumulative income and expenses for each day of the current month.
-   **Yearly View:** A bar chart showing total income and expenses for each month of the current year.

This visualization will help users quickly identify patterns, such as months where expenses consistently outpace income.

#### 7.2.3. Expense Breakdown by Category (Pie/Donut Chart)

To provide insight into spending habits, a pie or donut chart will display the proportion of total expenses attributed to each category for the selected time period. For example, a user might see that "Rent" accounts for 40% of their monthly expenses, while "Groceries" accounts for 15%. This is crucial for identifying areas where spending could potentially be reduced. Each segment of the chart will be colored distinctly for clarity.

### 7.3. Forms for Data Entry

The forms for adding new income and expenses will be designed for speed and simplicity, allowing users to log transactions in seconds.

#### 7.3.1. Income Form

The income form will be a clean, card-based layout using Shadcn UI components. It will include:
-   **Amount:** A number input field.
-   **Category:** A searchable dropdown populated with income categories from the database.
-   **Description:** A text area for an optional note.
-   **Date/Time:** A date-time picker component, defaulting to the current time but allowing for historical entries.
-   **Submit Button:** A clear call-to-action.

#### 7.3.2. Expense Form

The expense form will be identical in structure and design to the income form, ensuring a consistent user experience. The only difference will be the list of categories available in the dropdown, which will be filtered to show only expense types. Upon successful submission, the form will clear, and the new entry will appear in the transaction list below without a full page refresh, providing immediate feedback to the user.

## 8. Non-Functional Requirements

### 8.1. Performance

-   **Frontend:** The application must be highly responsive. Vite's fast HMR and optimized builds, combined with React's efficient rendering, will ensure a smooth user experience. Code-splitting via TanStack Router will be used to load only the necessary JavaScript for the current page, reducing initial load times.
-   **Backend:** The Hono.js backend is designed for high performance. API endpoints must respond quickly (ideally under 200ms for simple queries). Database queries will be optimized, and indexes will be added to frequently queried columns (e.g., `user_id`, `date`) in the `incomes` and `expenses` tables.
-   **Database:** PostgreSQL will be configured with appropriate connection pooling to handle requests efficiently.

### 8.2. Security

-   **Authentication:** All authentication will be handled by the **Better Auth** library, which implements industry-standard security practices, including secure password hashing (e.g., Argon2) and session management.
-   **Authorization:** All API routes (except `/auth/*`) will be protected by middleware that verifies the user's session cookie before allowing access to any data. Users can only read or modify their own data, enforced by filtering all database queries by the authenticated `user_id`.
-   **Data Transmission:** The application will be served over **HTTPS** to encrypt all data transmitted between the client and server. This will be configured on the VPS using Nginx and a free SSL certificate from Let's Encrypt.
-   **Input Validation:** All data received from the client (both in forms and API requests) will be validated on the server-side to prevent SQL injection and other malicious attacks.

### 8.3. Maintainability

-   **Code Quality:** The entire codebase will be written in **TypeScript**, which provides static typing and helps catch errors early in the development process.
-   **Modularity:** The application will be structured into clear, modular components (frontend) and route handlers (backend), making the code easier to understand, test, and modify.
-   **Documentation:** This PRD serves as the primary documentation. Additionally, the code itself will be self-documenting where possible, with clear variable and function names.
-   **Dependencies:** The use of modern, well-maintained libraries (React, Hono, Better Auth, etc.) ensures long-term support and a large community for troubleshooting.

### 8.4. Scalability

While the application is designed for a single user, the architecture is built on principles that would allow for future scaling if needed.
-   **Stateless Backend:** The Hono.js backend is stateless, meaning any server instance can handle any request. This makes it easy to scale horizontally by adding more server instances behind a load balancer.
-   **Database:** PostgreSQL is a highly scalable database. If the user base were to grow, the database could be scaled vertically (more powerful hardware) or horizontally (read replicas, sharding).
-   **Frontend:** The frontend is a static application that can be served from a CDN, which can handle a large number of concurrent users with high availability.

## 9. Development & Deployment Plan

### 9.1. Initial Setup & Configuration

1.  **Project Initialization:**
    -   Create a new directory for the project.
    -   Initialize a `package.json` with workspaces for the `web` (frontend) and `server` (backend) apps.
    -   Set up Git repository for version control.
2.  **Frontend Setup:**
    -   Use `npm create vite@latest` to scaffold the React + TypeScript + Tailwind CSS project in `apps/web`.
    -   Install TanStack Router and configure the file-based routing.
    -   Install and set up Shadcn UI.
3.  **Backend Setup:**
    -   Initialize a new Node.js project with TypeScript in `apps/server`.
    -   Install Hono.js and its dependencies.
    -   Set up the PostgreSQL database, either locally with Docker or on the VPS.
    -   Install and configure a database client (e.g., `drizzle-orm`).
4.  **Environment Configuration:**
    -   Create `.env` files for both frontend and backend to store configuration like API URLs and database connection strings.

### 9.2. Development Phases

The development will be broken down into five distinct phases to ensure a structured and efficient workflow.

| Phase | Title | Key Tasks | Estimated Duration |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend & Database Setup** | - Define the database schema and create tables.<br>- Set up the Hono.js server with basic middleware.<br>- Create the database connection and client.<br>- Implement the `GET /api/categories` endpoint. | 1 Day |
| **Phase 2** | **Authentication Implementation** | - Install and configure Better Auth on the backend.<br>- Create the `/auth/sign-in` and `/auth/sign-out` API routes.<br>- Build the frontend login page.<br>- Implement the frontend authentication logic (login, logout, session handling).<br>- Create a protected route wrapper for authenticated pages. | 1 Day |
| **Phase 3** | **Core Feature Development (Income/Expense)** | - Implement `GET /api/incomes`, `POST /api/incomes` backend endpoints.<br>- Build the `/income` frontend page with the form and list.<br>- Implement `GET /api/expenses`, `POST /api/expenses` backend endpoints.<br>- Build the `/expense` frontend page with the form and list.<br>- Integrate with category dropdowns. | 1-2 Days |
| **Phase 4** | **Dashboard & Visualizations** | - Implement backend logic to aggregate data for the dashboard (summaries, chart data).<br>- Create the `/` dashboard page.<br>- Integrate Recharts to display the income vs. expense and category breakdown charts.<br>- Add filtering functionality (weekly, monthly, yearly). | 1-2 Days |
| **Phase 5** | **Deployment & Testing** | - Set up the VPS with Dokploy.<br>- Configure the production database.<br>- Set up environment variables for production.<br>- Deploy the backend and frontend applications.<br>- Perform end-to-end testing on the live site. | 1 Day |

*Table 6: Development Phases Plan*

### 9.3. Dependencies & Constraints

-   **Primary Constraint:** The main constraint is the **time-to-market**, as the goal is to build and deploy the application quickly. This has heavily influenced the choice of technologies that prioritize developer speed (Vite, Shadcn, Better Auth).
-   **Single User:** The application is designed for a single user. This simplifies many aspects of the design, such as multi-tenancy, user roles, and complex authorization logic. However, it also means that features like user registration are not a priority and can be handled manually if a new user is ever needed.
-   **Self-Hosted:** The reliance on a self-hosted VPS and Dokploy means that the developer is responsible for server management, security, and maintenance. This provides control but also adds an operational overhead.
-   **Technology Lock-in:** While the chosen stack is modern and popular, there is a degree of lock-in. Migrating to different frameworks or libraries in the future would require significant effort. However, the modular architecture mitigates this risk to some extent.

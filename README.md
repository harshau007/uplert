# Uplert Web App

Uplert is a modern monitoring application designed to track website uptime and provide real-time alerts to ensure your services remain reliable and accessible. With Uplert, you can monitor websites effectively using a sleek, user-friendly interface and stay updated with instant notifications whenever an issue arises.

---

## Features

- **Website Monitoring**: Track the uptime and downtime of websites in real-time.
- **WebSocket Integration**: Live updates for monitored websites, ensuring instant notifications.
- **User-Friendly Dashboard**: Interactive dashboard built with Next.js, TailwindCSS, and Shadcn UI.
- **Alerts**: Get notified when a website goes down or experiences issues.
- **Historical Data**: View uptime statistics over time.
- **Responsive Design**: Fully responsive interface, optimized for all devices.

---

## Tech Stack

### Backend

- **Java Spring Boot**: Core backend logic and API development.
- **WebSocket**: Real-time communication for instant updates.

### Frontend

- **Next.js**: Server-side rendering and frontend development.
- **TailwindCSS**: Customizable, utility-first CSS framework for styling.
- **Shadcn UI**: Modern and accessible UI components.

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Java Development Kit (JDK)** (version 17 or higher)
- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Maven** or **Gradle** (for Spring Boot backend)

---

## Tracking/TODO

The following features are planned but not yet implemented:

- [ ] **Pause & Resume Functionality**: Enable users to pause and resume monitoring with proper state handling.
- [ ] **Validation for Website Dialog**: Prevent duplicate endpoints when creating monitoring entries.
- [ ] **Backend Validation**: Validate website URLs at the backend and send validation results to the frontend.
- [ ] **Session Close Handling**: Properly handle session closure for established connections.
- [ ] **Incident Response**: Integrate notifications via Email, Slack, Discord, SMS, etc.
- [ ] **Email Integration**: Implement emailing functionality using Mailhog or other tools.

Currently implemented features:

### Frontend

- [x] **Data Streaming**: Use data from `/ws/{projectId}/log` to populate the dashboard.
- [x] **Real-time Updates**: Ensure data updates correctly from the WebSocket endpoint.
- [x] **Delete Functionality**: Handle deletion with proper state management.
- [x] **Manual Ping**: Allow users to manually check website status.
- [x] **Duplicate Logs Handling**: Prevent duplicate logs and stats from being displayed.

### Backend

- [x] **Log Route**: Implement a separate route for logs and related details.
- [x] **Persistence**: Store dashboard data to maintain records.
- [x] **Manual Ping**: Support manual pings from the backend.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/harshau007/uplert.git
cd uplert
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the Spring Boot application:
   ```bash
   ./mvnw clean install
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
4. The backend server will be available at `http://localhost:8080`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The frontend application will be available at `http://localhost:3000`.

---

## Usage

1. Open the frontend in your browser: `http://localhost:3000`.
2. Add websites to monitor via the dashboard.
3. View real-time website uptime status.
4. Receive alerts for any downtime or issues.

---

## Project Structure

```plaintext
uplert/
├── backend/        # Java Spring Boot backend
│   ├── src/        # Source code for backend
│   ├── pom.xml     # Maven configuration
│   └── ...
├── frontend/       # Next.js frontend
│   └── src/
│       ├── app/        # Next.js app
│       ├── components/ # UI components built with Shadcn and TailwindCSS   # Public assets
│       └── ...
└── README.md       # Project documentation
```

---

## Contributing

We welcome contributions to enhance Uplert! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push the branch:
   ```bash
   git push origin feature-name
   ```
4. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For inquiries, suggestions, or feedback, please contact:

- **GitHub**: [github.com/harshau007](https://github.com/harshau007)

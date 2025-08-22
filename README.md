# SecureScan360 - AI-Powered Website Audit Tool

![SiteSecure360 Dashboard](https://i.imgur.com/your-screenshot-url.png) 
*Note: You should replace the image URL above with a real screenshot of your application's dashboard.*

**SiteSecure360** is a comprehensive website auditing platform that evaluates a website for security vulnerabilities, performance bottlenecks, SEO issues, and accessibility compliance. It acts as a digital health check, scanning a website thoroughly and producing clear, actionable reports with AI-powered solutions from Google's Gemini.

---

## ✨ Key Features

* **Comprehensive Audits:** Scans for critical issues across four key categories:
    * **Security:** Checks for essential security headers (HSTS, CSP) and SSL certificate validity.
    * **Performance:** Analyzes loading speed, image optimization, and render-blocking resources using Google Lighthouse.
    * **SEO:** Validates meta tags, headers, and other on-page SEO factors using Google Lighthouse.
    * **Accessibility:** Tests for WCAG compliance to ensure your site is usable by everyone, powered by Google Lighthouse.
* **AI-Powered Solutions:** Integrated with **Google's Gemini AI** to provide:
    * **Action Plans:** Generates a prioritized, step-by-step guide to fix identified issues.
    * **Live AI Analyst:** An interactive chat assistant that can answer follow-up questions about your report.
* **Data Visualization:**
    * **Radar Chart:** Compares your site's scores against industry benchmarks.
    * **Historical Trends:** Tracks your audit scores over time to visualize your progress.
* **Professional Reporting:**
    * **Detailed Breakdowns:** Lists every issue with priority levels (Critical, Medium, Low) and clear recommendations.
    * **PDF Exports:** Download your full audit report or the Gemini-generated action plan as a PDF.
* **Audit History:** Automatically saves your past audits to local storage for easy review.

---

## 🛠️ Tech Stack

### Frontend
* **HTML5 & CSS3:** Core structure and styling.
* **Tailwind CSS:** A utility-first CSS framework for rapid and responsive UI development.
* **JavaScript (ES6+):** Powers all client-side interactivity and API communication.
* **Chart.js:** For rendering the Radar and Historical Trends charts.
* **Lucide Icons:** For a clean and modern icon set.
* **jsPDF & html2canvas:** For client-side PDF generation.

### Backend
* **Node.js:** A JavaScript runtime for the server.
* **Express.js:** A web application framework for Node.js, used to build the API.
* **Google Lighthouse:** The core engine for Performance, SEO, and Accessibility audits.
* **Chrome Launcher:** To run a headless instance of Google Chrome for Lighthouse.
* **CORS:** Middleware to handle cross-origin requests from the frontend.

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

* **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
* **Gemini API Key:**
    1.  Go to the [Google AI Studio](https://aistudio.google.com/app/apikey) to get a free API key.
    2.  You will need to add this key to the frontend `index.html` file.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/sitesecure360.git](https://github.com/your-username/sitesecure360.git)
    cd sitesecure360
    ```

2.  **Set up the Backend:**
    * Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    * Install the necessary npm packages:
        ```bash
        npm install express cors lighthouse chrome-launcher
        ```

3.  **Set up the Frontend:**
    * Open the `frontend/index.html` file in your code editor.
    * Find the `generateAIReport` function and the `handleAssistantChat` function.
    * In both functions, locate the line `const apiKey = "";` and paste your Gemini API key between the quotes.

### Running the Application

1.  **Start the Backend Server:**
    * In your terminal, make sure you are in the `backend` directory.
    * Run the following command:
        ```bash
        node server.js
        ```
    * The server should now be running at `http://localhost:3000`.

2.  **Run the Frontend Application:**
    * Open the `frontend/index.html` file in your web browser.
    * It is **highly recommended** to use a live server extension (like "Live Server" in VS Code) to avoid any browser security issues.

---

## 📂 Project Structure

The project is organized into two main folders:


/
├── frontend/
│   └── index.html      # The main application file
│
└── backend/
├── server.js       # The Node.js/Express server
├── package.json    # Project dependencies
└── ...


---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

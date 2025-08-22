# SecureScan360

**SecureScan360** is a web-based application designed to provide **comprehensive security, performance, SEO, and accessibility scanning** for websites.  
💡 **The standout feature of this project is its integration with Google's Gemini AI**, which transforms raw audit data into actionable insights, giving you a **smart, prioritized, step-by-step plan** to improve your website.

---

## 🚀 Key Features

### 🔒 Security Checks
- SSL/TLS Configuration
- HTTP Strict Transport Security (HSTS)
- Content Security Policy (CSP)
- Clickjacking Protection (X-Frame-Options)
- Insecure Cookies

### ⚡ Performance Checks
- Image Optimization
- Render-Blocking Resources
- Browser Caching Policies
- Server Response Time
- Content Delivery Network (CDN) Usage

### 🔍 SEO Checks
- Meta Tags (Title & Description)
- Header Tags (H1, H2)
- Robots.txt & Sitemap
- Broken Link Analysis
- Mobile-Friendliness

### ♿ Accessibility Checks
- Image Alt Attributes
- Text Contrast Ratios
- Descriptive Link Text
- Keyboard Navigation
- ARIA Landmark Roles

### 🤖 **Gemini AI Integration (Core Feature)**
**Gemini AI** transforms your audit results into **expert-level, actionable recommendations**:  
- Analyzes all identified issues and priorities.  
- Provides a **personalized action plan** in the **"Gemini Solution" tab** of your report.  
- Helps you understand **what to fix first and why**, making website optimization faster and smarter.

---

## 📄 Report Export
- **ODF Download** – Export your audit report for offline use.  
- **Test Results Download** – Save raw scan results for detailed review.

---

## 🛠 Technologies Used
- **HTML & JavaScript** – Frontend structure and interactivity  
- **Node.js & Express** – Backend for scan orchestration  
- **Lighthouse** – Website auditing engine  
- **Cors & Chrome Launcher** – Enable scanning and server interaction

---

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, etc.)  
- Node.js and npm installed  
- Optional: Local server setup

### Installation
```bash
git clone https://github.com/ASHOKABHAT69/SecureScan360.git
cd SecureScan360
npm install
npm init -y
npm install express cors lighthouse chrome-launcher

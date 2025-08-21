// server.js

// 1. Import necessary libraries
const express = require('express');
const cors = require('cors');
const https = require('https');
// NOTE: Lighthouse is now imported dynamically inside its function
const chromeLauncher = require('chrome-launcher');

// 2. Initialize the Express application
const app = express();
const PORT = 3000;

// 3. Apply middleware
app.use(cors());
app.use(express.json());

// --- Main API Endpoint for Website Audit ---
app.post('/api/audit', async (req, res) => {
    const { url } = req.body;
    console.log(`Received audit request for: ${url}`);

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'A valid URL is required.' });
    }

    let chrome;
    try {
        // Launch a headless Chrome instance
        chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
        console.log('Chrome launched successfully.');

        // Run all scans in parallel for efficiency
        const [lighthouseResults, securityResults] = await Promise.all([
            runLighthouseScan(url, chrome.port),
            runSecurityScan(url)
        ]);

        // Combine results into the final report format
        const finalReport = {
            security: securityResults,
            performance: lighthouseResults.performance,
            seo: lighthouseResults.seo,
            accessibility: lighthouseResults.accessibility,
        };

        res.json(finalReport);

    } catch (error) {
        console.error('An error occurred during the audit:', error);
        res.status(500).json({ error: 'Failed to complete the audit. The URL may be invalid or the server is down.' });
    } finally {
        // Ensure Chrome is closed even if errors occur
        if (chrome) {
            await chrome.kill();
            console.log('Chrome instance killed.');
        }
    }
});

// 4. Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// --- Lighthouse Scanning Function ---
async function runLighthouseScan(url, port) {
    console.log(`Running Lighthouse for ${url}...`);
    
    // **FIX APPLIED HERE**
    // Dynamically import the lighthouse ES Module
    const lighthouse = (await import('lighthouse')).default;

    const runnerResult = await lighthouse(url, {
        port,
        output: 'json',
        onlyCategories: ['performance', 'seo', 'accessibility'],
        logLevel: 'info',
    });

    const report = runnerResult.lhr;

    // Helper function to map Lighthouse audits to our issue format
    const mapAuditsToIssues = (auditRefs) => {
        return auditRefs
            .map(ref => report.audits[ref.id])
            .filter(audit => audit.score !== 1 && audit.score !== null) // Filter for failed audits
            .map(audit => {
                let priority = 'low';
                if (audit.score < 0.5) priority = 'medium';
                if (audit.score === 0) priority = 'critical';
                
                // Extract a more useful recommendation
                let recommendation = 'See Lighthouse report for details.';
                if (audit.details && audit.details.overallSavingsMs) {
                    recommendation = `Optimizing this could save up to ${Math.round(audit.details.overallSavingsMs / 1000)}s.`;
                } else if (audit.description) {
                    // Remove markdown links from descriptions for cleaner recommendations
                    recommendation = audit.description.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                }

                return {
                    title: audit.title,
                    priority: priority,
                    description: audit.description.replace(/\[(.*?)\]\(.*?\)/g, '$1'), // Clean markdown
                    recommendation: recommendation
                };
            });
    };

    return {
        performance: {
            title: 'Performance',
            icon: 'zap',
            score: Math.round(report.categories.performance.score * 100),
            issues: mapAuditsToIssues(report.categories.performance.auditRefs),
        },
        seo: {
            title: 'SEO',
            icon: 'trending-up',
            score: Math.round(report.categories.seo.score * 100),
            issues: mapAuditsToIssues(report.categories.seo.auditRefs),
        },
        accessibility: {
            title: 'Accessibility',
            icon: 'person-standing',
            score: Math.round(report.categories.accessibility.score * 100),
            issues: mapAuditsToIssues(report.categories.accessibility.auditRefs),
        },
    };
}


// --- Security Scanning Function ---
async function runSecurityScan(url) {
    console.log(`Running security checks for ${url}...`);
    const issues = [];
    let score = 100;

    return new Promise((resolve) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname,
            method: 'GET',
            agent: new https.Agent({ rejectUnauthorized: false }) // Handle self-signed certs gracefully
        };

        const req = https.request(options, (res) => {
            // 1. Check for HSTS Header
            if (!res.headers['strict-transport-security']) {
                issues.push({ title: 'HTTP Strict Transport Security (HSTS) Not Enabled', priority: 'critical', description: 'HSTS header is missing, leaving the site vulnerable to protocol downgrade attacks and cookie hijacking.', recommendation: 'Implement the HSTS header to force browsers to always use HTTPS.' });
                score -= 25;
            }

            // 2. Check for Content Security Policy
            if (!res.headers['content-security-policy']) {
                issues.push({ title: 'Content Security Policy (CSP) Not Found', priority: 'medium', description: 'CSP header is not configured, increasing the risk of Cross-Site Scripting (XSS) attacks.', recommendation: 'Implement a strict CSP to control which resources can be loaded and executed.' });
                score -= 20;
            }
            
            // 3. Check for X-Frame-Options (Clickjacking)
            if (!res.headers['x-frame-options']) {
                issues.push({ title: 'Clickjacking Protection Missing', priority: 'medium', description: 'The X-Frame-Options header is not set, which could allow an attacker to embed your site in a malicious one.', recommendation: 'Set the X-Frame-Options header to "DENY" or "SAMEORIGIN" to prevent clickjacking.' });
                score -= 20;
            }

            // 4. Check SSL Certificate
            const certificate = res.socket.getPeerCertificate();
            if (certificate && certificate.valid_to) {
                const expiryDate = new Date(certificate.valid_to);
                const daysUntilExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24);
                if (daysUntilExpiry < 0) {
                     issues.push({ title: 'SSL Certificate Expired', priority: 'critical', description: 'The SSL/TLS certificate has expired, which will cause browsers to show security warnings to users.', recommendation: 'Renew the SSL certificate immediately to restore trust and security.' });
                     score = 0; // Critical failure
                } else if (daysUntilExpiry < 30) {
                     issues.push({ title: 'SSL Certificate Expiring Soon', priority: 'low', description: `The SSL/TLS certificate expires in ${Math.floor(daysUntilExpiry)} days.`, recommendation: 'Renew the SSL certificate soon to avoid service interruption and security warnings.' });
                     score -= 10;
                }
            } else {
                 issues.push({ title: 'SSL Certificate Invalid', priority: 'critical', description: 'Could not validate the SSL/TLS certificate. This will cause major browser warnings.', recommendation: 'Ensure a valid, trusted SSL certificate is installed correctly on the server.' });
                 score = 0;
            }

            resolve({
                title: 'Security',
                icon: 'shield',
                score: Math.max(0, score),
                issues: issues
            });
        });

        req.on('error', (e) => {
            console.error(`Security scan error: ${e.message}`);
            resolve({
                title: 'Security',
                icon: 'shield',
                score: 0,
                issues: [{ title: 'Could Not Connect for Security Scan', priority: 'critical', description: `Failed to perform security scan. Could not connect to the host at ${parsedUrl.hostname}. This could be a firewall issue or the server is down.`, recommendation: 'Ensure the domain is correct and the server is accessible over HTTPS (port 443).' }]
            });
        });

        req.end();
    });
}

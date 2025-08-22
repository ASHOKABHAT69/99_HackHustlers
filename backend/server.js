// server.js
const express = require('express');
const cors = require('cors');
// We will import lighthouse dynamically inside the async function
const chromeLauncher = require('chrome-launcher');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Main audit endpoint
app.post('/api/audit', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Starting audit for: ${url}`);
    let chrome;
    try {
        // Dynamically import the lighthouse module
        const { default: lighthouse } = await import('lighthouse');

        // Launch a headless Chrome instance
        chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
        
        const options = {
            logLevel: 'info',
            output: 'json',
            port: chrome.port,
            onlyCategories: ['performance', 'accessibility', 'seo'],
        };

        // Run Lighthouse audit
        const runnerResult = await lighthouse(url, options);
        const report = runnerResult.lhr;

        // --- Custom Security & Privacy Checks ---
        const securityReport = await checkSecurity(url);
        const privacyReport = await checkPrivacy(url);
        const techStack = await detectTechStack(url);

        // --- Structure the final report ---
        const finalReport = {
            performance: {
                title: 'Performance',
                icon: 'zap',
                score: Math.round(report.categories.performance.score * 100),
                issues: report.audits['speed-index']?.details?.items.map(i => ({ title: 'Speed Index', description: `Speed index is ${i.timing}ms`, recommendation: 'Improve server response times and reduce render-blocking resources.', priority: 'medium', status: 'todo' })) || []
            },
            accessibility: {
                title: 'Accessibility',
                icon: 'person-standing',
                score: Math.round(report.categories.accessibility.score * 100),
                issues: report.audits['color-contrast']?.details?.items.map(i => ({ title: 'Color Contrast', description: i.node.snippet, recommendation: 'Increase the contrast between foreground and background colors.', priority: 'medium', status: 'todo' })) || []
            },
            seo: {
                title: 'SEO',
                icon: 'trending-up',
                score: Math.round(report.categories.seo.score * 100),
                issues: report.audits['meta-description']?.details?.items.map(i => ({ title: 'Meta Description', description: 'Ensure meta descriptions are unique and descriptive.', recommendation: 'Add a unique meta description to this page.', priority: 'low', status: 'todo' })) || []
            },
            security: securityReport,
            privacy: privacyReport,
            techStack: techStack
        };

        console.log(`Audit finished for: ${url}`);
        res.json(finalReport);

    } catch (error) {
        console.error('Error during audit:', error);
        res.status(500).json({ error: 'Failed to complete the audit.', details: error.message });
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
});

// --- Helper function for Security Checks ---
async function checkSecurity(url) {
    let issues = [];
    let score = 100;
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'SiteSecure360-Audit-Tool/1.0' } });
        const headers = response.headers;

        // Check for HTTPS
        if (!url.startsWith('https://')) {
            issues.push({ title: 'No HTTPS', description: 'The site is not served over a secure connection.', recommendation: 'Install an SSL certificate.', priority: 'critical', status: 'todo' });
            score -= 40;
        }

        // Check for HSTS header
        if (!headers['strict-transport-security']) {
            issues.push({ title: 'HSTS Header Missing', description: 'HTTP Strict Transport Security header is not set.', recommendation: 'Add the HSTS header to enforce secure connections.', priority: 'medium', status: 'todo' });
            score -= 20;
        }

        // Check for CSP header
        if (!headers['content-security-policy']) {
            issues.push({ title: 'CSP Header Missing', description: 'Content Security Policy header is not set, increasing risk of XSS attacks.', recommendation: 'Implement a strong Content Security Policy.', priority: 'medium', status: 'todo' });
            score -= 20;
        }
    } catch (error) {
        issues.push({ title: 'Could not fetch site', description: `Error fetching the site for security checks: ${error.message}`, priority: 'critical', status: 'todo' });
        score = 0;
    }
    return { title: 'Security', icon: 'shield', score: Math.max(0, score), issues };
}

// --- Helper function for Privacy Checks ---
async function checkPrivacy(url) {
    let issues = [];
    let score = 100;
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'SiteSecure360-Audit-Tool/1.0' } });
        const $ = cheerio.load(data);

        // Check for a link to a privacy policy (more robust, case-insensitive check)
        let privacyLinkFound = false;
        $('a').each(function () {
            const linkText = $(this).text().toLowerCase();
            const linkHref = $(this).attr('href')?.toLowerCase() || '';
            if (linkText.includes('privacy') || linkText.includes('legal') || linkHref.includes('privacy') || linkHref.includes('policy')) {
                privacyLinkFound = true;
                return false; // exit .each loop
            }
        });

        if (!privacyLinkFound) {
            issues.push({ title: 'No Privacy Policy Link', description: 'A link to a privacy policy page was not found.', recommendation: 'Add a clear link to your privacy policy in the footer.', priority: 'medium', status: 'todo' });
            score -= 50;
        }
        
        // Basic check for cookie banner
        const bodyText = $('body').text().toLowerCase();
        if (!bodyText.includes('cookie') && !$('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]').length) {
            issues.push({ title: 'Cookie Banner Not Detected', description: 'Could not detect a cookie consent banner on the page.', recommendation: 'Ensure you have a GDPR/CCPA compliant cookie consent banner if you use tracking cookies.', priority: 'low', status: 'todo' });
            score -= 25;
        }

    } catch (error) {
        issues.push({ title: 'Could not fetch site', description: `Error fetching the site for privacy checks: ${error.message}`, priority: 'critical', status: 'todo' });
        score = 0;
    }
    return { title: 'Privacy & Compliance', icon: 'lock', score: Math.max(0, score), issues };
}

// --- Helper function for Tech Stack Detection ---
async function detectTechStack(url) {
    const tech = new Set(); // Use a Set to avoid duplicates
    try {
        const { data, headers } = await axios.get(url, { headers: { 'User-Agent': 'SiteSecure360-Audit-Tool/1.0' } });
        
        // Header checks
        if (headers['server']?.toLowerCase().includes('cloudflare')) tech.add('Cloudflare');
        if (headers['x-powered-by']?.toLowerCase().includes('express')) tech.add('Express.js');
        if (headers['x-powered-by']?.toLowerCase().includes('next.js')) tech.add('Next.js');
        
        // Body content checks
        if (data.includes('wp-content') || data.includes('wp-json')) tech.add('WordPress');
        if (data.includes('__NEXT_DATA__')) tech.add('Next.js');
        if (data.includes('react-root') || data.includes('data-reactroot')) tech.add('React');
        if (data.includes('Shopify')) tech.add('Shopify');
        if (data.includes('content="Squarespace"')) tech.add('Squarespace');

    } catch (error) {
        // Ignore errors for this non-critical feature
    }
    return tech.size > 0 ? Array.from(tech) : ['Not Detected'];
}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

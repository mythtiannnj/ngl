const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ========== NGL SPAMMER API ==========
app.get('/nglspam', async (req, res) => {
    const { username, amount, message } = req.query;

    if (!username || !amount || !message) {
        return res.status(400).json({
            success: false,
            error: "Missing required parameters",
            message: "Please provide 'username', 'amount', and 'message'.",
            exampleUsage: "/nglspam?username=exampleuser&amount=5&message=hello"
        });
    }

    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount > 40 || parsedAmount < 1) {
        return res.status(400).json({ success: false, error: "Amount must be between 1 and 40." });
    }

    const headers = {
        referer: `https://ngl.link/${username}`,
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
    };

    const data = {
        username,
        question: message,
        deviceId: "ea356443-ab18-4a49-b590-bd8f96b994ee",
        gameSlug: "",
        referrer: ""
    };

    try {
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < parsedAmount; i++) {
            try {
                await axios.post("https://ngl.link/api/submit", data, { headers });
                successCount++;
            } catch (err) {
                errorCount++;
            }
        }

        res.json({
            success: true,
            message: `Successfully sent ${successCount} messages to ${username}.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`,
            sent: successCount,
            failed: errorCount,
            total: parsedAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ===== SERVE HOME =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ===== 500 HANDLER =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

// ===== START =====
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    NGL SPAMMER SERVER                         ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Server running on port: ${PORT}                              ║
║  🌐 Home:            http://localhost:${PORT}/                  ║
║  📌 API:             http://localhost:${PORT}/nglspam          ║
║  📊 Health:          http://localhost:${PORT}/api/health       ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
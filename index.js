const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./db');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/startups', async (req, res) => {
    try {
        const db = getDb();
        const startups = await db.collection('startups').find({}).toArray();
        res.json(startups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/startups/:name', async (req, res) => {
    try {
        const db = getDb();
        const name = req.params.name;
        const startup = await db.collection('startups').findOne({ name: name });
        if (startup) {
            res.json(startup);
        } else {
            res.status(404).json({ message: 'Startup not found' });
    }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/investor-analysis', async (req, res) => {
    try {
        const db = getDb();
        const startups = await db.collection('startups').find({}).toArray();
        const investorAnalysis = {};
        let biggestStartup = null;
        let fieldAnalysis = {};

        startups.forEach(startup => {
            const totalFunding = startup.funding_stages.reduce((sum, stage) => sum + parseFloat(stage.amount.replace('$', '').replace(' Million', '')), 0);

            // Find the biggest startup by total funding
            if (!biggestStartup || totalFunding > biggestStartup.totalFunding) {
                biggestStartup = {
                    name: startup.name,
                    totalFunding: totalFunding,
                    field: startup.field
                };
            }

            // Analyze fields
            if (!fieldAnalysis[startup.field]) {
                fieldAnalysis[startup.field] = { count: 0, totalFunding: 0 };
            }
            fieldAnalysis[startup.field].count++;
            fieldAnalysis[startup.field].totalFunding += totalFunding;

            // Analyze investors
            startup.investors.forEach(investor => {
                if (!investorAnalysis[investor]) {
                    investorAnalysis[investor] = { totalInvestments: 0, fields: {} };
                }
                investorAnalysis[investor].totalInvestments++;
               
                if (!investorAnalysis[investor].fields[startup.field]) {
                    investorAnalysis[investor].fields[startup.field] = 0;
                }
                investorAnalysis[investor].fields[startup.field]++;
            });
        });

        // Convert to array and sort by total investments
        const sortedInvestorAnalysis = Object.entries(investorAnalysis)
            .map(([investor, data]) => ({
                investor,
                totalInvestments: data.totalInvestments,
                fields: Object.entries(data.fields)
                    .sort((a, b) => b[1] - a[1])
                    .map(([field, count]) => ({ field, count }))
            }))
            .sort((a, b) => b.totalInvestments - a.totalInvestments);

        // Sort field analysis
        const sortedFieldAnalysis = Object.entries(fieldAnalysis)
            .map(([field, data]) => ({
                field,
                count: data.count,
                totalFunding: data.totalFunding
            }))
            .sort((a, b) => b.count - a.count);

        res.json({
            sortedInvestorAnalysis,
            biggestStartup,
            biggestField: sortedFieldAnalysis[0],
            fieldAnalysis: sortedFieldAnalysis
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/alumni', async (req, res) => {
    try {
        const db = getDb();
        const startups = await db.collection('internship').find({}).toArray();
        res.json(startups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/alumni/:name', async (req, res) => {
    try {
        const db = getDb();
        const name = req.params.name;
        const startup = await db.collection('internship').findOne({ Name: name });
        if (startup) {
            res.json(startup);
        } else {
            res.status(404).json({ message: 'Alumni not found' });
    }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

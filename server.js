require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Models
require('./models/user');
require('./models/Log');

// Routes
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scanRoutes = require('./routes/scanRoutes');
const ttsRoute = require('./routes/Ttsroute');

const app = express();

// CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/logs', logRoutes);
app.use('/ai', aiRoutes);
app.use('/scan', scanRoutes);
app.use('/api', ttsRoute);

// Test route
app.get('/', (req, res) => {
    res.send('Krishi Mitra Backend Running 🚀');
});

// Port
const PORT = process.env.PORT || 5000;

// Start server after DB connection
sequelize.sync()
.then(() => {
    console.log("✅ MySQL Connected");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on ${PORT}`);
    });
})
.catch(err => console.log("❌ DB Error:", err));
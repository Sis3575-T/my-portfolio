const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../middleware/auth');

const startTime = Date.now();

router.get('/status', protect, adminOnly, async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({
      success: true,
      database: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
      server: 'running',
      uptime,
      apiResponseTime: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/usage', protect, adminOnly, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    let storageUsed = 0;
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        try {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) storageUsed += stat.size;
        } catch {}
      }
    }
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsed = Math.round((1 - freeMem / totalMem) * 100);
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }
    const cpuUsage = Math.round(100 - (totalIdle / totalTick) * 100);

    res.json({
      success: true,
      storage: {
        used: Math.round(storageUsed / (1024 * 1024)),
        total: 1024,
        unit: 'MB',
      },
      memory: {
        used: memoryUsed,
        total: 100,
        unit: '%',
      },
      cpu: cpuUsage,
      requestsLastMinute: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

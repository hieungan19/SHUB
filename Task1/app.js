const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const app = express();

const uploadDir = 'uploads/'; // Directory for storing uploads

// Middleware to handle file upload
const upload = multer({ dest: uploadDir });

// API to upload .xlsx file
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!file.originalname.endsWith('.xlsx')) {
    return res
      .status(400)
      .json({ error: 'Invalid file format. Only .xlsx files are allowed.' });
  }

  res.status(200).json({ message: 'File uploaded and saved successfully' });
});

// Helper function to load transactions from the latest uploaded file

function loadTransactionsFromFile() {
  const uploadDir = 'uploads/';
  const files = fs.readdirSync(uploadDir);
  if (files.length === 0) {
    throw new Error('No files uploaded yet.');
  }

  // Get the most recent file based on modified time
  const recentFile = files.reduce(
    (latest, file) => {
      const currentFile = path.join(uploadDir, file);
      const currentStat = fs.statSync(currentFile);
      return currentStat.mtime > latest.mtime
        ? { file: currentFile, mtime: currentStat.mtime }
        : latest;
    },
    { file: '', mtime: 0 }
  );

  if (!recentFile.file) {
    throw new Error('No valid files found in the upload directory.');
  }

  const workbook = xlsx.readFile(recentFile.file);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { range: 7 }); // Skip first 8 rows
  return data.map((row) => {
    const totalValue = row['Thành tiền (VNĐ)'];
    return {
      date: row['Ngày'],
      time: row['Giờ'],
      total: totalValue ? totalValue : 0, // Safeguard against undefined
    };
  });
}

// API to query transactions based on a time range from the most recent file
app.get('/api/transactions', (req, res) => {
  const { startTime, endTime } = req.query;

  // Validate query parameters
  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ error: 'Both startTime and endTime must be provided' });
  }

  const start = moment(startTime, 'YYYY-MM-DD HH:mm:ss');
  const end = moment(endTime, 'YYYY-MM-DD HH:mm:ss');

  if (!start.isValid() || !end.isValid()) {
    return res
      .status(400)
      .json({ error: 'Invalid date format. Use YYYY-MM-DD HH:mm:ss' });
  }

  try {
    // Load transactions from the latest uploaded file
    const transactions = loadTransactionsFromFile();

    // Filter transactions within the given time range
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionTime = moment(
        `${transaction.date} ${transaction.time}`,
        'DD/MM/YYYY HH:mm:ss'
      );
      return transactionTime.isBetween(start, end, null, '[)');
    });

    const totalAmount = filteredTransactions.reduce(
      (sum, t) => sum + t.total,
      0
    );

    res.status(200).json({
      transactions: filteredTransactions,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

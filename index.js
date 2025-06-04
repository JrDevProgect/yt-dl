const express = require('express');
const cors = require('cors');
const path = require('path');
const searchRouter = require('./routes/search');
const downloadRouter = require('./routes/download');
const suggestionsRouter = require('./routes/suggestions');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/search', searchRouter);
app.use('/api/download', downloadRouter);
app.use('/api/suggestions', suggestionsRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
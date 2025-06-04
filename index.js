const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const searchRouter = require('./routes/search');
const downloadRouter = require('./routes/download');
const suggestionsRouter = require('./routes/suggestions');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/api/search', searchRouter);
app.use('/api/download', downloadRouter);
app.use('/api/suggestions', suggestionsRouter);

app.get('/', (req, res) => res.render('index'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
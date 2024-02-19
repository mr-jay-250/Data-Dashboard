const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/dashboard', {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
});

const dataSchema = new mongoose.Schema({
    end_year: Number,
    intensity: Number,
    sector: String,
    topic: String,
    insight: String,
    url: String,
    region: String,
    start_year: String,
    impact: String,
    added: String,
    published: String,
    country: String,
    relevance: Number,
    pestle: String,
    source: String,
    title: String,
    likelihood: Number
});

const DataModel = mongoose.model('Data', dataSchema);

app.get('/api/data', async (req, res) => {
    try {
        const filters = req.query;

        const filterObject = {};
        for (const key in filters) {
            if (filters.hasOwnProperty(key)) {
                const field = key.endsWith('[value]') ? key.replace('[value]', '') : key;
                // Special handling for end_year to parse the date and extract the year
                if (field === 'end_year') {
                    filterObject[field] = new Date(filters[key]).getFullYear();
                } else {
                    filterObject[field] = filters[key];
                }

                if (typeof filterObject[field] === 'object' && filterObject[field].hasOwnProperty('value')) {
                    filterObject[field] = filterObject[field].value;
                }
            }
        }
        const data = await DataModel.find(filterObject);

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

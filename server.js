const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set the views directory
app.set('views', path.join(__dirname, 'public', 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/donationDB');

const donationSchema = new mongoose.Schema({
    item: String,
    description: String,
    quantity: Number
});

const Donation = mongoose.model('Donation', donationSchema);

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/donate.html'));
});

app.post('/donate', (req, res) => {
    const newDonation = new Donation({
        item: req.body.item,
        description: req.body.description,
        quantity: req.body.quantity
    });

    newDonation.save()
        .then(() => {
            res.redirect('/view');
        })
        .catch(err => {
            console.error('Error saving donation:', err);
            res.status(500).send('Error saving donation');
        });
});


app.get('/view', (req, res) => {
    Donation.find({})
        .then(donations => {
            res.render('view', { donations: donations });
        })
        .catch(err => {
            console.error('Error retrieving donations:', err);
            res.status(500).send('Error retrieving donations: ' + err.message); // Send detailed error message to the client
        });
});



app.post('/delete/:id', (req, res) => {
    Donation.findByIdAndDelete(req.params.id)
        .then(result => {
            // Check if the result is null, meaning no document was found with that ID
            if (!result) {
                return res.status(404).send('Donation not found');
            }
            res.redirect('/view');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error deleting donation');
        });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

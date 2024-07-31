const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const port = 3000;

// Set the views directory
app.set('views', path.join(__dirname, 'public', 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use(express.static('public'));
app.use(flash());
// Make flash messages available to views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/donationDB');

// User model
const User = mongoose.model('User', { email: String, password: String, username: String });

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Attempting to find user in the database:', email);
        const user = await User.findOne({ email: email, password: password });

        if (!user) {
            console.log('User not found or invalid credentials:', email);
            return res.json({ success: false, message: 'Invalid email or password. Signup if you do not have an account.' });
        }

        console.log('User found in the database:', user.email);

        req.session.user = { id: user._id, username: user.username };
        console.log('Session user assigned:', req.session.user);

        if (email === 'admin@admin.com' && password === 'admin1234') {
            console.log('Admin login detected');
            return res.json({ success: true, isAdmin: true, username: 'Admin' });
        } else {
            console.log('Regular user login detected');
            return res.json({ success: true, isAdmin: false, username: user.username });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});


app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.json({ success: false, message: 'Passwords do not match' });
    }
    const user = new User({ email, password, username });
    try {
        await user.save();
        req.session.user = { id: user._id, username: user.username };
        return res.json({ success: true, message: 'Signup successful' });
    } catch (err) {
        console.error('Error during signup:', err);
        return res.json({ success: false, message: 'Error during signup' });
    }
});

app.get('/fetchUsername', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, username: req.session.user.username });
    } else {
        res.json({ success: false, username: null });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Donation schema and model
const donationSchema = new mongoose.Schema({
    item: String,
    description: String,
    quantity: Number
});

const Donation = mongoose.model('Donation', donationSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'donate.html'));
});

app.post('/donate', async (req, res) => {
    const newDonation = new Donation({
        item: req.body.item,
        description: req.body.description,
        quantity: req.body.quantity
    });

    try {
        await newDonation.save();
        if (req.session.user && req.session.user.username === 'Admin') {
            res.redirect('/view');
        } else {
            res.redirect('/norm_user');
        }
    } catch (err) {
        console.error('Error saving donation:', err);
        res.status(500).send('Error saving donation');
    }
});

app.get('/view', async (req, res) => {
    console.log('GET /view route hit');
    try {
        const donations = await Donation.find({});
        console.log('Donations retrieved:', donations);
        if (req.session.user && req.session.user.username === 'Admin') {
            res.render('view', { donations: donations });
        } else {
            res.render('norm_user', { donations: donations });
        }
    } catch (err) {
        console.error('Error retrieving donations:', err);
        res.status(500).send('Error retrieving donations: ' + err.message);
    }
});

app.get('/norm_user', async(req, res) => {
    try {
        const donations = await Donation.find(); // Fetch all donations from the database
        res.render('norm_user', { donations, messages: {} }); // Pass donations and empty messages to the view
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).send('Error fetching donations');
    }
});

app.get('/item', (req, res) => {
    res.render('item'); 
});

app.post('/delete/:id', async (req, res) => {
    try {
        const result = await Donation.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send('Donation not found');
        }
        res.redirect('/view');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting donation');
    }
});
app.post('/get_item/:id', async (req, res) => {
    try {
        const result = await Donation.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send('Donation not found');
        }
        res.redirect('/item');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting donation');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


// FOR ADMIN USE username:Admin mail:admin@admin.com password:admin1234
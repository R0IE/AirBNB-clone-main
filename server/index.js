const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.post('/api/houses/:id/unavailable-dates', (req, res) => {
    try {
        console.log('POST unavailable date request:', req.params.id, req.body);
        const { id } = req.params;
        const { date, reason = 'blocked' } = req.body;
        
        db.addUnavailableDate(parseInt(id), date, reason);
        console.log('Added unavailable date:', id, date, reason);
        res.json({ data: { success: true } });
    } catch (error) {
        console.error('Error adding unavailable date:', error);
        res.status(500).json({ error: 'Failed to add unavailable date' });
    }
});
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = db.createUser(email, passwordHash);
        
        res.status(201).json({ 
            message: 'User created successfully',
            user: { id: result.lastInsertRowid, email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/signout', authenticateToken, (req, res) => {
    res.json({ message: 'Signed out successfully' });
});


app.get('/api/houses', (req, res) => {
    try {
        const { checkIn, checkOut, guests, location } = req.query;
        
        console.log('Search params:', { checkIn, checkOut, guests, location });
        
        if (checkIn && checkOut && guests) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
            
            if (checkInDate >= checkOutDate) {
                return res.status(400).json({ error: 'Check-out date must be after check-in date' });
            }
            
            const guestCount = parseInt(guests);
            if (guestCount < 1) {
                return res.status(400).json({ error: 'Guest count must be at least 1' });
            }
            
            const availableHouses = db.getAvailableHouses(
                checkIn, 
                checkOut, 
                guestCount, 
                location
            );
            
            console.log(`Found ${availableHouses.length} available houses`);
            res.json(availableHouses);
        } else {
            console.log('Getting all houses from database...');
            const houses = db.getAllHouses();
            console.log(`Returning ${houses.length} houses`);
            console.log('First house:', houses[0]);
            res.json(houses);
        }
    } catch (error) {
        console.error('Get houses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/houses/:id', (req, res) => {
    try {
        console.log('GET house by ID:', req.params.id);
        const house = db.getHouseById(req.params.id);
        if (!house) {
            console.log('House not found for ID:', req.params.id);
            console.log('Available house IDs in database:');
            const allHouses = db.getAllHouses();
            console.log(allHouses.map(h => h.id).join(', '));
            return res.status(404).json({ error: 'House not found' });
        }
        console.log('Returning house:', house.title || house.name);
        res.json(house);
    } catch (error) {
        console.error('Get house error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/houses/:id/check-availability', (req, res) => {
    try {
        console.log('Checking availability for house:', req.params.id);
        console.log('Request body:', req.body);
        
        const { checkIn, checkOut } = req.body;
        const houseId = req.params.id;
        
        if (!checkIn || !checkOut) {
            console.log('Missing dates - checkIn:', checkIn, 'checkOut:', checkOut);
            return res.status(400).json({ error: 'Check-in and check-out dates are required' });
        }
        
        const house = db.getHouseById(houseId);
        if (!house) {
            console.log('House not found for ID:', houseId);
            return res.status(404).json({ error: 'House not found' });
        }
        
        const isAvailable = db.isHouseAvailable(houseId, checkIn, checkOut);
        console.log('Availability result:', isAvailable);
        
        res.json({ 
            available: isAvailable,
            houseId: houseId,
            checkIn: checkIn,
            checkOut: checkOut
        });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upload-images', upload.array('images', 10), (req, res) => {
    try {
        console.log('Upload request received, files:', req.files ? req.files.length : 0);
        
        if (!req.files || req.files.length === 0) {
            console.log('No files in request');
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const imageUrls = req.files.map(file => {
            console.log('Uploaded file:', file.filename);
            return `http://localhost:${PORT}/uploads/${file.filename}`;
        });

        console.log('Upload successful, returning URLs:', imageUrls);
        res.json({ 
            success: true, 
            imageUrls: imageUrls,
            count: req.files.length
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

app.get('/api/users/:userId/houses', authenticateToken, (req, res) => {
    try {
        if (req.user.userId !== parseInt(req.params.userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const houses = db.getHousesByUserId(req.params.userId);
        res.json(houses);
    } catch (error) {
        console.error('Get user houses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/my-houses', authenticateToken, (req, res) => {
    try {
        console.log('Getting houses for user ID:', req.user.userId);
        const houses = db.getHousesByUserId(req.user.userId);
        console.log('Found', houses.length, 'houses for user');
        res.json(houses);
    } catch (error) {
        console.error('Get my houses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/houses', authenticateToken, (req, res) => {
    try {
        const houseData = {
            ...req.body,
            user_id: req.user.userId
        };

        const result = db.createHouse(houseData);
        const newHouse = db.getHouseById(result.lastInsertRowid);
        
        res.status(201).json(newHouse);
    } catch (error) {
        console.error('Create house error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/houses/:id', authenticateToken, (req, res) => {
    try {
        const house = db.getHouseById(req.params.id);
        if (!house) {
            return res.status(404).json({ error: 'House not found' });
        }

        if (house.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.updateHouse(req.params.id, req.body);
        const updatedHouse = db.getHouseById(req.params.id);
        
        res.json(updatedHouse);
    } catch (error) {
        console.error('Update house error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/houses/:id', authenticateToken, (req, res) => {
    try {
        const house = db.getHouseById(req.params.id);
        if (!house) {
            return res.status(404).json({ error: 'House not found' });
        }

        if (house.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.deleteHouse(req.params.id);
        res.json({ message: 'House deleted successfully' });
    } catch (error) {
        console.error('Delete house error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/bookings', (req, res) => {
    try {
        console.log('GET all bookings');
        const bookings = db.getAllBookings();
        console.log('Retrieved bookings:', bookings.length);
        res.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/bookings', authenticateToken, (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            user_id: req.user.userId
        };

        const result = db.createBooking(bookingData);
        
        res.status(201).json({ 
            id: result.lastInsertRowid,
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/houses/:houseId/bookings', (req, res) => {
    try {
        console.log('GET bookings for house:', req.params.houseId);
        const house = db.getHouseById(req.params.houseId);
        if (!house) {
            console.log('House not found:', req.params.houseId);
            return res.status(404).json({ error: 'House not found' });
        }

        const bookings = db.getBookingsByHouseId(req.params.houseId);
        console.log('Found bookings:', bookings);
        res.json(bookings);
    } catch (error) {
        console.error('Get house bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users/:userId/bookings', authenticateToken, (req, res) => {
    try {
        if (req.user.userId !== parseInt(req.params.userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const bookings = db.getBookingsByUserId(req.params.userId);
        res.json(bookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/my-bookings', authenticateToken, (req, res) => {
    try {
        console.log('Getting bookings for user ID:', req.user.userId);
        const bookings = db.getBookingsByUserId(req.user.userId);
        console.log('Found', bookings.length, 'bookings for user');
        res.json(bookings);
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/houses/:id/unavailable-dates', (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.query;
        
        const unavailableDates = db.getUnavailableDates(
            parseInt(id), 
            start_date, 
            end_date
        );
        
        res.json({ data: unavailableDates });
    } catch (error) {
        console.error('Error fetching unavailable dates:', error);
        res.status(500).json({ error: 'Failed to fetch unavailable dates' });
    }
});

app.post('/api/houses/unavailable-dates/bulk', (req, res) => {
    try {
        const { house_ids, start_date, end_date } = req.body;
        
        if (!house_ids || !Array.isArray(house_ids)) {
            return res.status(400).json({ error: 'house_ids array is required' });
        }
        
        const unavailableByHouse = db.getUnavailableDatesForHouses(
            house_ids.map(id => parseInt(id)), 
            start_date, 
            end_date
        );
        
        res.json({ data: unavailableByHouse });
    } catch (error) {
        console.error('Error fetching bulk unavailable dates:', error);
        res.status(500).json({ error: 'Failed to fetch unavailable dates' });
    }
});

app.post('/api/houses/:id/unavailable-dates', (req, res) => {
    try {
        const { id } = req.params;
        const { date, reason = 'blocked' } = req.body;
        
        const house = db.getHouseById(parseInt(id));
        if (!house || house.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const result = db.addUnavailableDate(parseInt(id), date, reason);
        res.json({ data: { success: true, changes: result.changes } });
    } catch (error) {
        console.error('Error adding unavailable date:', error);
        res.status(500).json({ error: 'Failed to add unavailable date' });
    }
});

app.post('/api/houses/:id/unavailable-dates/range', (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date, reason = 'blocked' } = req.body;

        const house = db.getHouseById(parseInt(id));
        if (!house || house.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        db.addUnavailableDateRange(parseInt(id), start_date, end_date, reason);
        res.json({ data: { success: true } });
    } catch (error) {
        console.error('Error adding unavailable date range:', error);
        res.status(500).json({ error: 'Failed to add unavailable date range' });
    }
});

app.delete('/api/houses/:id/unavailable-dates/:date', (req, res) => {
    try {
        console.log('DELETE unavailable date request:', req.params.id, req.params.date);
        const { id, date } = req.params;
        
        db.removeUnavailableDate(parseInt(id), date);
        console.log('Removed unavailable date:', id, date);
        res.json({ data: { success: true } });
    } catch (error) {
        console.error('Error removing unavailable date:', error);
        res.status(500).json({ error: 'Failed to remove unavailable date' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    try {
        db.deleteExpiredSessions();
        console.log('Cleaned up expired sessions');
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
    }
});


process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});

module.exports = app;
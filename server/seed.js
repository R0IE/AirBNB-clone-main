const db = require('./database');
const bcrypt = require('bcryptjs');

async function createSampleData() {
    try {
        let userId;
        const existingUser = db.getUserByEmail('test@example.com');
        
        if (existingUser) {
            userId = existingUser.id;
            console.log(`Using existing test user with ID: ${userId}`);
        } else {
            const testPassword = await bcrypt.hash('password123', 10);
            const userResult = db.createUser('test@example.com', testPassword);
            userId = userResult.lastInsertRowid;
            console.log(`Created test user with ID: ${userId}`);
        }
        
        const sampleBookings = [
            {
                house_id: 4, 
                user_id: userId,
                check_in: '2025-10-15',
                check_out: '2025-10-17',
                guests: 2,
                total_price: 240,
                status: 'confirmed'
            },
            {
                house_id: 5, 
                user_id: userId,
                check_in: '2025-11-20',
                check_out: '2025-11-25',
                guests: 4,
                total_price: 1250,
                status: 'pending'
            }
        ];

        sampleBookings.forEach((booking, index) => {
            try {
                const result = db.createBooking(booking);
                console.log(`Created booking ${index + 1} with ID: ${result.lastInsertRowid}`);
            } catch (error) {
                console.log(`Booking ${index + 1} might already exist or house doesn't exist`);
            }
        });

        const sampleHouses = [
            {
                user_id: userId,
                title: 'Cozy Downtown Apartment',
                description: 'A beautiful 2-bedroom apartment in the heart of the city',
                price: 120,
                location: 'Downtown, New York',
                bedrooms: 2,
                bathrooms: 1,
                max_guests: 4,
                amenities: ['WiFi', 'Kitchen', 'Air conditioning'],
                images: ['/src/Images/Upcoming.avif'],
                latitude: 40.7128,
                longitude: -74.0060
            },
            {
                user_id: userId,
                title: 'Modern Beach House',
                description: 'Stunning oceanfront property with amazing views',
                price: 250,
                location: 'Malibu, California',
                bedrooms: 3,
                bathrooms: 2,
                max_guests: 6,
                amenities: ['WiFi', 'Pool', 'Beach access', 'Kitchen'],
                images: ['/src/Images/Upcoming.avif'],
                latitude: 34.0259,
                longitude: -118.7798
            },
            {
                user_id: userId,
                title: 'Mountain Cabin Retreat',
                description: 'Peaceful cabin surrounded by nature',
                price: 95,
                location: 'Aspen, Colorado',
                bedrooms: 1,
                bathrooms: 1,
                max_guests: 2,
                amenities: ['WiFi', 'Fireplace', 'Hiking trails'],
                images: ['/src/Images/Upcoming.avif'],
                latitude: 39.1911,
                longitude: -106.8175
            }
        ];
        
        sampleHouses.forEach((house, index) => {
            const result = db.createHouse(house);
            console.log(`Created house ${index + 1} with ID: ${result.lastInsertRowid}`);
        });
        
        console.log('Sample data created successfully!');
        console.log('Test user credentials: test@example.com / password123');
        
    } catch (error) {
        console.error('Error creating sample data:', error);
    } finally {
        db.close();
    }
}

createSampleData();
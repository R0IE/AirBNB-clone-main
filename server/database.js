const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseService {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        const dbPath = path.join(__dirname, 'airbnb.db');
        this.db = new Database(dbPath);

        this.db.exec('PRAGMA foreign_keys = ON');
        
        this.initSchema();
    }

    initSchema() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
    }

    createUser(email, passwordHash) {
        const stmt = this.db.prepare(`
            INSERT INTO users (email, password_hash) 
            VALUES (?, ?)
        `);
        return stmt.run(email, passwordHash);
    }

    getUserByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    }

    getUserById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    createHouse(houseData) {
        const stmt = this.db.prepare(`
            INSERT INTO houses (user_id, title, description, price, location, bedrooms, bathrooms, max_guests, amenities, images, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            houseData.user_id,
            houseData.title,
            houseData.description,
            houseData.price,
            houseData.location,
            houseData.bedrooms || 1,
            houseData.bathrooms || 1,
            houseData.max_guests || 2,
            JSON.stringify(houseData.amenities || []),
            JSON.stringify(houseData.images || []),
            houseData.latitude,
            houseData.longitude
        );
    }

    getAllHouses() {
        console.log('getAllHouses called');
        const stmt = this.db.prepare(`
            SELECT h.*, u.email as owner_email 
            FROM houses h 
            LEFT JOIN users u ON h.user_id = u.id 
            ORDER BY h.created_at DESC
        `);
        const houses = stmt.all();
        console.log(`Raw houses from DB: ${houses.length}`);
        
        const parsedHouses = houses.map(house => ({
            ...house,
            amenities: house.amenities ? JSON.parse(house.amenities) : [],
            images: house.images ? JSON.parse(house.images) : []
        }));
        console.log(`Parsed houses: ${parsedHouses.length}`);
        return parsedHouses;
    }

    getHouseById(id) {
        const stmt = this.db.prepare(`
            SELECT h.*, u.email as owner_email 
            FROM houses h 
            LEFT JOIN users u ON h.user_id = u.id 
            WHERE h.id = ?
        `);
        const house = stmt.get(id);
        
        if (house) {
            house.amenities = house.amenities ? JSON.parse(house.amenities) : [];
            house.images = house.images ? JSON.parse(house.images) : [];
        }
        
        return house;
    }

    getHousesByUserId(userId) {
        const stmt = this.db.prepare(`
            SELECT * FROM houses 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `);
        const houses = stmt.all(userId);
        
        return houses.map(house => ({
            ...house,
            amenities: house.amenities ? JSON.parse(house.amenities) : [],
            images: house.images ? JSON.parse(house.images) : []
        }));
    }

    updateHouse(id, houseData) {
        const stmt = this.db.prepare(`
            UPDATE houses 
            SET title = ?, description = ?, price = ?, location = ?, 
                bedrooms = ?, bathrooms = ?, max_guests = ?, 
                amenities = ?, images = ?, latitude = ?, longitude = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            houseData.title,
            houseData.description,
            houseData.price,
            houseData.location,
            houseData.bedrooms,
            houseData.bathrooms,
            houseData.max_guests,
            JSON.stringify(houseData.amenities || []),
            JSON.stringify(houseData.images || []),
            houseData.latitude,
            houseData.longitude,
            id
        );
    }

    deleteHouse(id) {
        const stmt = this.db.prepare('DELETE FROM houses WHERE id = ?');
        return stmt.run(id);
    }

    createBooking(bookingData) {
        const stmt = this.db.prepare(`
            INSERT INTO bookings (house_id, user_id, check_in, check_out, guests, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            bookingData.house_id,
            bookingData.user_id,
            bookingData.check_in,
            bookingData.check_out,
            bookingData.guests,
            bookingData.total_price,
            bookingData.status || 'pending'
        );

        if (result.lastInsertRowid) {
            this.addUnavailableDateRange(
                bookingData.house_id,
                bookingData.check_in,
                bookingData.check_out,
                'booked',
                result.lastInsertRowid
            );
        }

        return result;
    }

    getBookingsByHouseId(houseId) {
        const stmt = this.db.prepare(`
            SELECT b.*, u.email as guest_email 
            FROM bookings b 
            LEFT JOIN users u ON b.user_id = u.id 
            WHERE b.house_id = ?
            ORDER BY b.check_in DESC
        `);
        return stmt.all(houseId);
    }

    getBookingsByUserId(userId) {
        const stmt = this.db.prepare(`
            SELECT b.*, h.title as house_title, h.location as house_location 
            FROM bookings b 
            LEFT JOIN houses h ON b.house_id = h.id 
            WHERE b.user_id = ?
            ORDER BY b.check_in DESC
        `);
        return stmt.all(userId);
    }

    getAllBookings() {
        const stmt = this.db.prepare(`
            SELECT b.*, h.title as house_title, h.location as house_location, u.email as guest_email 
            FROM bookings b 
            LEFT JOIN houses h ON b.house_id = h.id 
            LEFT JOIN users u ON b.user_id = u.id 
            ORDER BY b.check_in DESC
        `);
        return stmt.all();
    }

    createSession(userId, tokenHash, expiresAt) {
        const stmt = this.db.prepare(`
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
        `);
        return stmt.run(userId, tokenHash, expiresAt);
    }

    getSessionByToken(tokenHash) {
        const stmt = this.db.prepare(`
            SELECT s.*, u.email 
            FROM sessions s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.token_hash = ? AND s.expires_at > datetime('now')
        `);
        return stmt.get(tokenHash);
    }

    deleteSession(tokenHash) {
        const stmt = this.db.prepare('DELETE FROM sessions WHERE token_hash = ?');
        return stmt.run(tokenHash);
    }

    deleteExpiredSessions() {
        const stmt = this.db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')");
        return stmt.run();
    }

    isHouseAvailable(houseId, checkIn, checkOut) {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as conflicts
            FROM bookings 
            WHERE house_id = ? 
            AND status IN ('confirmed', 'pending')
            AND (
                (check_in <= ? AND check_out > ?) OR
                (check_in < ? AND check_out >= ?) OR
                (check_in >= ? AND check_out <= ?)
            )
        `);
        const result = stmt.get(houseId, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut);
        return result.conflicts === 0;
    }
    getAvailableHouses(checkIn, checkOut, guests, location = null) {
        let baseQuery = `
            SELECT h.*, u.email as owner_email 
            FROM houses h 
            LEFT JOIN users u ON h.user_id = u.id 
            WHERE h.max_guests >= ?
        `;
        let params = [parseInt(guests)];

        if (location && location.trim()) {
            baseQuery += ` AND (h.location LIKE ? OR h.title LIKE ?)`;
            params.push(`%${location}%`, `%${location}%`);
        }

        baseQuery += ` ORDER BY h.created_at DESC`;

        const stmt = this.db.prepare(baseQuery);
        const allHouses = stmt.all(...params);

        const availableHouses = allHouses.filter(house => {
            const isAvailable = this.isHouseAvailable(house.id, checkIn, checkOut);
            return isAvailable;
        });

        return availableHouses.map(house => ({
            ...house,
            amenities: house.amenities ? JSON.parse(house.amenities) : [],
            images: house.images ? JSON.parse(house.images) : [],
            available: true,
            searchDates: { checkIn, checkOut },
            maxGuests: house.max_guests
        }));
    }

    addUnavailableDate(houseId, date, reason = 'booked', bookingId = null) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO unavailable_dates (house_id, date, reason, booking_id)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(houseId, date, reason, bookingId);
    }

    addUnavailableDateRange(houseId, startDate, endDate, reason = 'booked', bookingId = null) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO unavailable_dates (house_id, date, reason, booking_id)
            VALUES (?, ?, ?, ?)
        `);

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            try {
                stmt.run(houseId, dateStr, reason, bookingId);
            } catch (err) {
                if (!err.message.includes('UNIQUE constraint failed')) {
                    throw err;
                }
            }
        }
    }

    removeUnavailableDate(houseId, date) {
        const stmt = this.db.prepare(`
            DELETE FROM unavailable_dates 
            WHERE house_id = ? AND date = ? AND reason != 'booked'
        `);
        return stmt.run(houseId, date);
    }

    getUnavailableDates(houseId, startDate = null, endDate = null) {
        let query = `
            SELECT date, reason, booking_id 
            FROM unavailable_dates 
            WHERE house_id = ?
        `;
        const params = [houseId];

        if (startDate && endDate) {
            query += ` AND date >= ? AND date < ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ` AND date >= ?`;
            params.push(startDate);
        }

        query += ` ORDER BY date ASC`;

        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    removeUnavailableDates(houseId, bookingId) {
        const stmt = this.db.prepare(`
            DELETE FROM unavailable_dates 
            WHERE house_id = ? AND booking_id = ?
        `);
        return stmt.run(houseId, bookingId);
    }

    getUnavailableDatesForHouses(houseIds, startDate = null, endDate = null) {
        if (!houseIds || houseIds.length === 0) return {};

        const placeholders = houseIds.map(() => '?').join(',');
        let query = `
            SELECT house_id, date, reason 
            FROM unavailable_dates 
            WHERE house_id IN (${placeholders})
        `;
        const params = [...houseIds];

        if (startDate && endDate) {
            query += ` AND date >= ? AND date < ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY house_id, date ASC`;

        const stmt = this.db.prepare(query);
        const results = stmt.all(...params);

        const unavailableByHouse = {};
        results.forEach(row => {
            if (!unavailableByHouse[row.house_id]) {
                unavailableByHouse[row.house_id] = [];
            }
            unavailableByHouse[row.house_id].push({
                date: row.date,
                reason: row.reason
            });
        });

        return unavailableByHouse;
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = new DatabaseService();
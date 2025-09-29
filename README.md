## MVP

- Simple user accounts (email + hashed password).
- Hosts can add houses with pictures and basic details.
- Guests can browse houses, filter by number of guests and location, and open a house page.
- Basic booking flow: pick check-in/check-out, guests, and create a booking.
- The app blocks dates that are already booked so two people can't book the same night.
- There's a seed script (`server/seed.js`) that makes a test user and some sample houses/bookings so you can try things quickly.

The front-end code is in `src/` Vue and the server is in `server/`.

## Database

I used SQLite (with `better-sqlite3`) because it's easy for a small project. The SQL is in `server/schema.sql` and the JS wrapper is `server/database.js`.

Tables and what they do:

1) `users` — stores user accounts
- id, email, password_hash (bcrypt), created_at, updated_at

2) `houses` — property listings
- id, user_id (owner), title, description, price, location
- bedrooms, bathrooms, max_guests
- amenities (saved as a JSON string), images (saved as a JSON array)
- latitude, longitude, created_at, updated_at

3) `bookings` — reservations
- id, house_id, user_id, check_in, check_out, guests, total_price, status, timestamps

4) `sessions` — simple session/token storage
- id, user_id, token_hash, expires_at, created_at

5) `unavailable_dates` — single-day blocks for houses
- id, house_id, date, reason (default 'booked'), booking_id, created_at

Notes about the DB:
- `amenities` and `images` are stored as JSON text in the `houses` table and converted to arrays in `server/database.js`.
- When a booking is created the server adds one row per night to `unavailable_dates` so availability checks are easy.
- There are indexes on common fields (owner, location, booking dates, session tokens, etc.) to make queries faster.

1) Install node packages:

```powershell
npm install
```

2) Seed the DB:

```powershell
node server/seed.js
```

3) Start the backend server:

```powershell
node server/index.js
```

4) Start the front-end dev server:

```powershell
npm run dev
```

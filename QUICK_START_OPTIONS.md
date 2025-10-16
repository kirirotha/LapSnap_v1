# Quick Start Without Database

Since you want to test the RFID functionality quickly, here's how to run the API without database dependencies:

## Option 1: Wait for Docker (30 seconds)

Docker Desktop is starting. Once it's ready:

```bash
# Run MySQL container
docker run --name lapsnap-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=lapsnap_dev -p 3306:3306 -d mysql:8

# Wait 10 seconds for MySQL to start, then:
cd services/core-api
npx prisma generate
npx prisma db push
npm run dev
```

## Option 2: Test Frontend Only (NOW)

Your frontend works standalone! The Scan Test has simulation built-in.

Just open: `http://localhost:3000` (if frontend is running)
- Go to Races → Scan Test
- Click Connect (uses simulation)
- Click Start Scanning
- See simulated RFID tags appear!

## Option 3: Minimal API (Quick Fix)

I can create a minimal version of the API that skips database initialization and just handles RFID. This would work in 2 minutes.

Which would you like to try?
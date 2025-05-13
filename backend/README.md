# Backend for Notes Sync App

This is the backend server for the Notes Offline Sync application. It provides a RESTful API for note management, real-time updates using Socket.IO, and integrates with a PostgreSQL/MySQL database using Sequelize ORM.

## Features

- RESTful API for note management
- Real-time sync updates using Socket.IO
- Data persistence using Sequelize ORM with PostgreSQL or MySQL
- Offline sync support with batch processing
- CORS enabled for mobile clients
- Request validation using express-validator

## Prerequisites

- Node.js (>= 14.x)
- PostgreSQL (or MySQL) database
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

5. Update the environment variables in the `.env` file according to your setup.

## Database Setup

1. Make sure PostgreSQL is running on your system
2. Create a PostgreSQL database for the application:

   ```bash
   # Using psql command line
   psql -U your_username
   CREATE DATABASE notes_app_dev;
   ```

   Or use pgAdmin to create the database graphically

3. Update the database configuration in `config/config.json` with your PostgreSQL credentials:

   ```json
   "development": {
     "username": "your_username", // Replace with your actual PostgreSQL username
     "password": "your_password",
     "database": "notes_app_dev",
     "host": "127.0.0.1",
     "dialect": "postgres"
   }
   ```

4. If you encounter "role does not exist" errors, make sure to use the correct PostgreSQL username that exists on your system

## Running the Server

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

## API Endpoints

### Get all notes

```
GET /notes
```

Response:

```json
[
  {
    "id": "uuid-string",
    "title": "Note Title",
    "content": "Note Content",
    "uuid": "unique-identifier",
    "synced": true,
    "createdAt": "2025-05-10T10:00:00Z",
    "updatedAt": "2025-05-10T10:00:00Z"
  }
]
```

### Create a new note

```
POST /notes
```

Request body:

```json
{
  "title": "Note Title",
  "content": "Note Content",
  "uuid": "unique-identifier"
}
```

Response:

```json
{
  "id": "uuid-string",
  "title": "Note Title",
  "content": "Note Content",
  "uuid": "unique-identifier",
  "synced": true,
  "createdAt": "2025-05-10T10:00:00Z",
  "updatedAt": "2025-05-10T10:00:00Z"
}
```

### Batch process notes (for offline sync)

```
POST /notes/batch
```

Request body:

```json
{
  "notes": [
    {
      "title": "Note 1",
      "content": "Content 1",
      "uuid": "unique-id-1",
      "createdAt": "2025-05-10T10:00:00Z",
      "updatedAt": "2025-05-10T10:00:00Z"
    },
    {
      "title": "Note 2",
      "content": "Content 2",
      "uuid": "unique-id-2",
      "createdAt": "2025-05-10T11:00:00Z",
      "updatedAt": "2025-05-10T11:00:00Z"
    }
  ]
}
```

Response:

```json
{
  "results": [
    { "uuid": "unique-id-1", "status": "created" },
    { "uuid": "unique-id-2", "status": "created" }
  ]
}
```

## Testing with Postman

1. Install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Create a new collection in Postman for "Notes Sync API"
3. Set up your environment:
   - Create a variable `base_url` with value `http://localhost:3000`
4. Test the following endpoints:
   - GET `{{base_url}}/notes` - Fetch all notes
   - POST `{{base_url}}/notes` - Create a new note
   - POST `{{base_url}}/notes/batch` - Batch upload notes
5. For Socket.IO testing, use a tool like [Socket.IO tester](https://github.com/socketio/socket.io-tester)

## Socket.IO Events

### Server to Client

- `note:created` - Emitted when a new note is created
- `note:synced` - Emitted when a note is synced/updated

## Troubleshooting

### Common Issues

1. **Database Connection Error**:

   - Check your PostgreSQL username and password in `config/config.json`
   - Ensure PostgreSQL service is running
   - Verify the database exists

2. **"Role does not exist" Error**:

   - Update the username in `config/config.json` to match your actual PostgreSQL username
   - Or create the missing role with: `CREATE ROLE postgres WITH LOGIN PASSWORD 'your_password' SUPERUSER;`

3. **Port Already in Use**:
   - Change the port in your `.env` file or use `PORT=3001 npm start`

## Docker Support

A Dockerfile and docker-compose.yml are included for containerization:

### Build and run with Docker:

```bash
docker build -t notes-sync-backend .
docker run -p 3000:3000 notes-sync-backend
```

### Run with Docker Compose:

```bash
docker-compose up
```

## License

MIT

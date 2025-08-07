# Selecta - Bi-Directional Playlist Sync & Backup Service

A comprehensive music library management platform that keeps your playlists synchronized across multiple streaming services and provides complete backup capabilities.

## Features

### 🎵 Multi-Platform Support
- **Spotify Integration**: Full OAuth integration with playlist management
- **Apple Music Support**: Complete Apple Music API integration
- **Extensible Architecture**: Built on Ultrasonics foundation for easy service additions

### 🔄 Bi-Directional Sync
- **Real-time Synchronization**: Keep playlists in sync across all platforms
- **Conflict Resolution**: Smart handling of playlist changes and conflicts
- **Selective Sync**: Choose which playlists to sync and in which direction

### 🤖 AI-Powered Matching
- **ISRC + Album Matching**: Highest accuracy using industry standard identifiers
- **Exact Metadata Matching**: Precise title, artist, and duration matching
- **Fuzzy Matching**: Advanced similarity algorithms for close matches
- **OpenAI Fallback**: AI-powered matching for ambiguous cases
- **Manual Review**: User approval system for uncertain matches

### 💾 Complete Library Backup
- **Full Export**: JSON and CSV format exports of entire music libraries
- **Cloud Storage**: Automatic uploads to Google Drive, Dropbox, or S3
- **Scheduled Backups**: Automated daily/weekly backup jobs
- **Version History**: Track and restore from previous backup snapshots

### ⚡ Background Processing
- **Queue System**: Redis-based job processing with Upstash
- **Progress Tracking**: Real-time sync and backup progress monitoring
- **Error Handling**: Robust retry logic with exponential backoff
- **Webhook Support**: Integration with streaming service webhooks

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL via Supabase
- **Cache & Jobs**: Upstash Redis + BullMQ
- **AI**: OpenAI API for intelligent track matching
- **Authentication**: OAuth 2.0 for all streaming services
- **Storage**: Multi-cloud support (S3, Google Drive, Dropbox)
- **Deployment**: Vercel with automatic CI/CD

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Redis instance (Upstash recommended)
- Streaming service API credentials

### Environment Variables
\`\`\`env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Streaming Services
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# AI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### Installation

1. **Clone and Install**
\`\`\`bash
git clone <repository-url>
cd selecta-sync-service
npm install
\`\`\`

2. **Database Setup**
\`\`\`bash
# Run the database schema
psql -d your_database < scripts/database-schema.sql
\`\`\`

3. **Start Development**
\`\`\`bash
# Start the Next.js app
npm run dev

# Start the background worker (in another terminal)
npm run worker
\`\`\`

4. **Access the Application**
- Web App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

## API Endpoints

### Authentication
- `GET /api/auth/[service]` - OAuth flow initiation and callback
- `POST /api/auth/refresh` - Refresh access tokens

### Playlists
- `GET /api/playlists` - List user playlists across services
- `GET /api/playlists/[id]` - Get specific playlist details

### Sync Operations
- `POST /api/sync` - Create new sync job
- `GET /api/sync/[jobId]/status` - Get sync job status
- `PUT /api/match/[matchId]/resolve` - Approve/reject AI matches

### Backup Operations
- `POST /api/backup` - Create backup job
- `GET /api/backup/[jobId]/status` - Get backup job status
- `GET /api/backup/[jobId]/download` - Download backup file

## Architecture

### Core Components

1. **Matcher Engine** (`lib/matcher.ts`)
   - Multi-stage track matching algorithm
   - ISRC code validation and album matching
   - Fuzzy string matching with confidence scoring
   - OpenAI integration for complex cases

2. **Backup System** (`lib/backup.ts`)
   - Complete library export functionality
   - Multiple format support (JSON, CSV)
   - Cloud storage integration
   - Incremental backup capabilities

3. **Queue Processor** (`scripts/queue-processor.js`)
   - Background job processing
   - Sync and backup job workers
   - Progress tracking and error handling
   - Retry logic with exponential backoff

### Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

- **users**: User accounts with OAuth tokens
- **playlists**: Playlist metadata across services
- **tracks**: Individual track information with ISRC codes
- **track_matches**: AI matching results and user decisions
- **sync_jobs**: Background sync job tracking
- **backup_jobs**: Backup operation management
- **backup_files**: File storage references

## Testing

\`\`\`bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
\`\`\`

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on the [Ultrasonics](https://github.com/XDGFX/ultrasonics) foundation
- Integrates [ultrasonics-apple-music-plugin](https://github.com/McLainCronin/ultrasonics-apple-music-plugin)
- Powered by OpenAI for intelligent track matching
- Uses shadcn/ui for beautiful, accessible components

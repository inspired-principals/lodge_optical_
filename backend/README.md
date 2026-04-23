# Lodge Optical Backend

A sovereign FastAPI backend system for Lodge Optical triage and patient management.

## Features

- **Sovereign Architecture**: No external dependencies (Firebase, Docker)
- **FastAPI Framework**: Modern, fast, and well-documented API
- **PostgreSQL Database**: Reliable, scalable data persistence
- **Hybrid Authentication**: JWT + database session validation for security
- **Triage Engine**: Intelligent medical triage with configurable rules
- **Comprehensive Audit**: Full audit trails for compliance
- **Rate Limiting**: Protection against abuse
- **Role-Based Access**: Granular permission system

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip or pipenv

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Initialize database**
   ```bash
   python scripts/init_db.py
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=sqlite:///./backend/lodge_optical.db
JWT_SECRET=change-this-before-production
ENVIRONMENT=development
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SIGNATURE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Development will boot with internal fallback defaults, but production should always provide explicit secrets and provider credentials.

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE lodge_optical;
   CREATE USER lodge_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE lodge_optical TO lodge_user;
   ```

2. **Run initialization script**
   ```bash
   python scripts/init_db.py
   ```

This creates:
- Database tables
- Default roles (admin, staff, viewer)
- System flags for kill switches
- Default admin user
- Default triage rules

### Default Credentials

After initialization, use these credentials to log in:
- **Email**: `admin@lodgeoptical.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout current session
- `GET /api/v1/auth/me` - Get current user info

#### Patients
- `GET /api/v1/patients` - List patients (with pagination/search)
- `POST /api/v1/patients` - Create new patient
- `GET /api/v1/patients/{id}` - Get patient details
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient

#### Triage
- `POST /api/v1/triage` - Process triage assessment
- `GET /api/v1/triage/sessions/{id}` - Get triage session
- `GET /api/v1/triage/patients/{id}/history` - Patient triage history

#### Health Check
- `GET /api/v1/health` - System health status

## Architecture

### Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/                   # Core utilities and configuration
│   │   ├── config.py           # Environment configuration
│   │   ├── database.py         # Database connection
│   │   ├── security.py         # Authentication utilities
│   │   ├── logging.py          # Structured logging
│   │   └── exceptions.py       # Custom exceptions
│   ├── modules/                # Business modules
│   │   ├── auth/               # Authentication & authorization
│   │   ├── patient/            # Patient management
│   │   ├── triage/             # Triage operations
│   │   └── audit/              # Audit logging
│   ├── engine/                 # Triage decision engine
│   │   ├── decision_engine.py  # Main orchestration
│   │   ├── rules.py            # Rules evaluation
│   │   ├── scoring.py          # Risk scoring
│   │   └── schemas.py          # Engine data models
│   ├── middleware/             # HTTP middleware
│   │   ├── auth.py             # Authentication middleware
│   │   ├── audit.py            # Request logging
│   │   ├── rate_limit.py       # Rate limiting
│   │   └── cors.py             # CORS configuration
│   └── api/                    # API routing
├── migrations/                 # Database migrations
├── scripts/                    # Utility scripts
└── tests/                      # Test suite
```

### Security Features

#### Hybrid Authentication
- Short-lived JWT tokens (5-10 minutes)
- Database session validation as source of truth
- Refresh token rotation
- Instant session invalidation capability
- Device and IP tracking

#### Rate Limiting
- Endpoint-specific limits
- Progressive rate limiting for failed logins
- Account lockout protection

#### Audit System
- Comprehensive request logging
- State change tracking with diffs
- Tamper-evident audit trails
- Forensic investigation capabilities

### Triage Engine

#### Rule-Based System
- Configurable rules stored in database
- JSON-based condition/action format
- Priority-based rule evaluation
- Real-time rule activation/deactivation

#### Scoring Algorithm
- Multi-factor risk assessment
- Symptom severity weighting
- Vital signs analysis
- Medical history consideration
- Confidence scoring

#### Example Triage Request
```json
{
  "patient_id": 123,
  "symptoms": ["chest_pain", "shortness_of_breath"],
  "vital_signs": {
    "blood_pressure": "140/90",
    "heart_rate": 95,
    "temperature": 98.6,
    "pain_level": 7
  },
  "medical_history": ["hypertension"],
  "current_medications": ["lisinopril"]
}
```

## Development

### Running Tests
```bash
pytest tests/
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Adding New Admin User
```bash
python scripts/create_admin.py
```

### Code Style
- Follow PEP 8
- Use type hints
- Document functions and classes
- Keep functions focused and small

## Deployment

### Production Checklist

1. **Environment Configuration**
   - Set `ENVIRONMENT=production`
   - Use strong JWT secret
   - Configure production database URL

2. **Database Setup**
   - Use PostgreSQL with SSL
   - Set up regular backups
   - Configure connection pooling

3. **Security Hardening**
   - Change default admin password
   - Configure CORS for production domains
   - Set up HTTPS/TLS
   - Review rate limiting settings

4. **Monitoring**
   - Set up log aggregation
   - Configure health check monitoring
   - Set up performance monitoring

### Production Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists and user has permissions

2. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check if admin user exists
   - Ensure system_enabled flag is True

3. **Import Errors**
   - Activate virtual environment
   - Install all requirements
   - Check Python path configuration

### Logs

Structured JSON logs are written to stdout. Key log fields:
- `timestamp`: ISO format timestamp
- `level`: Log level (INFO, WARNING, ERROR)
- `message`: Log message
- `request_id`: Request correlation ID
- `module`: Source module

### Health Checks

Monitor the `/api/v1/health` endpoint:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

Proprietary - Lodge Optical Internal Use Only

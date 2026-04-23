# Requirements Document

## Introduction

This document outlines the requirements for refactoring the existing Lodge Optical project from its current Node.js/Firebase architecture to a sovereign backend system. The refactor will implement a FastAPI (Python) backend with PostgreSQL database, REST API architecture, and complete removal of Docker and Firebase dependencies. The goal is to create a domain-driven, self-contained system that reduces external dependencies, improves auditability, and can be deployed on private infrastructure while preserving core triage engine capabilities and establishing a foundation for future system evolution.

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to remove all external cloud dependencies (Firebase, Docker), so that the system can operate independently on private infrastructure.

#### Acceptance Criteria

1. WHEN the system is deployed THEN it SHALL NOT require any Firebase services or configurations
2. WHEN the system is deployed THEN it SHALL NOT require Docker or docker-compose
3. WHEN Firebase dependencies are removed THEN the system SHALL maintain all existing authentication and data storage functionality through custom backend implementation
4. WHEN Docker dependencies are removed THEN the system SHALL run directly on the host system with standard Python/PostgreSQL installation

### Requirement 2

**User Story:** As a developer, I want a clean FastAPI backend architecture, so that the system follows modern Python web development best practices and is maintainable.

#### Acceptance Criteria

1. WHEN the backend is implemented THEN it SHALL use FastAPI as the web framework
2. WHEN the backend is structured THEN it SHALL follow domain-driven design principles with clear module separation
3. WHEN the backend is organized THEN it SHALL separate concerns into distinct layers: API controllers, business services, and data models
4. WHEN the backend handles requests THEN it SHALL use Pydantic for input validation and serialization
5. WHEN the backend is deployed THEN it SHALL use uvicorn as the ASGI server

### Requirement 3

**User Story:** As a system administrator, I want PostgreSQL as the primary database, so that the system has reliable, scalable data persistence without external dependencies.

#### Acceptance Criteria

1. WHEN the database is configured THEN it SHALL use PostgreSQL as the primary database system
2. WHEN database connections are established THEN it SHALL use SQLAlchemy for ORM functionality
3. WHEN database credentials are managed THEN it SHALL use environment variables for configuration
4. WHEN the database schema is defined THEN it SHALL support all existing data models (users, patients, triage sessions, results)
5. WHEN database operations are performed THEN it SHALL maintain ACID compliance and data integrity

### Requirement 4

**User Story:** As a healthcare professional, I want the triage engine to continue functioning with the same intelligence and accuracy, so that patient assessment capabilities are preserved during the architectural transition.

#### Acceptance Criteria

1. WHEN triage assessments are performed THEN the system SHALL accept structured patient input data
2. WHEN triage logic is executed THEN the system SHALL return computed scores, risk levels, and recommendations
3. WHEN triage rules are applied THEN the system SHALL use the existing decision engine logic and scoring algorithms
4. WHEN triage results are generated THEN the system SHALL store raw input, computed scores, classifications, and timestamps
5. WHEN the triage engine operates THEN it SHALL remain independent from the API layer for modularity

### Requirement 5

**User Story:** As a frontend developer, I want REST API endpoints that replace Firebase functionality, so that the frontend can continue operating with minimal changes.

#### Acceptance Criteria

1. WHEN API endpoints are created THEN the system SHALL provide REST endpoints for triage operations (POST /triage)
2. WHEN authentication is required THEN the system SHALL provide REST endpoints for login and token handling (POST /auth/login)
3. WHEN patient data is managed THEN the system SHALL provide CRUD endpoints for patient operations (/patients)
4. WHEN administrative functions are needed THEN the system SHALL provide restricted admin endpoints (/admin)
5. WHEN API responses are returned THEN they SHALL follow consistent JSON structure and HTTP status codes

### Requirement 6

**User Story:** As a security administrator, I want robust authentication and authorization, so that the system maintains security standards without Firebase Auth.

#### Acceptance Criteria

1. WHEN users authenticate THEN the system SHALL implement JWT-based authentication
2. WHEN authentication tokens are managed THEN the system SHALL use HTTP-only cookies for secure token storage
3. WHEN user permissions are enforced THEN the system SHALL implement role-based access control (admin, staff)
4. WHEN security headers are set THEN the system SHALL include appropriate CORS restrictions and secure headers
5. WHEN user sessions are managed THEN the system SHALL handle token expiration and refresh mechanisms

### Requirement 7

**User Story:** As a system administrator, I want comprehensive input validation and security measures, so that the system is protected against common web vulnerabilities.

#### Acceptance Criteria

1. WHEN API requests are received THEN the system SHALL validate all input using Pydantic schemas
2. WHEN rate limiting is applied THEN the system SHALL prevent abuse through configurable rate limits
3. WHEN CORS is configured THEN the system SHALL restrict cross-origin requests to authorized domains
4. WHEN security headers are applied THEN the system SHALL include headers for XSS protection, content type validation, and HTTPS enforcement
5. WHEN error handling occurs THEN the system SHALL not expose sensitive information in error responses

### Requirement 8

**User Story:** As a frontend developer, I want seamless integration between the new backend and existing frontend, so that user experience is maintained during the transition.

#### Acceptance Criteria

1. WHEN the frontend connects to the backend THEN it SHALL use environment-based API URLs for different deployment environments
2. WHEN Firebase calls are replaced THEN all existing Firebase authentication calls SHALL be replaced with REST API requests
3. WHEN Firebase data calls are replaced THEN all existing Firebase database calls SHALL be replaced with REST API requests
4. WHEN the integration is complete THEN the frontend SHALL maintain all existing functionality and user workflows
5. WHEN API communication occurs THEN the system SHALL handle errors gracefully and provide appropriate user feedback

### Requirement 9

**User Story:** As a deployment engineer, I want the system to be ready for private server deployment, so that it can be hosted on controlled infrastructure.

#### Acceptance Criteria

1. WHEN the system is deployed THEN it SHALL run locally with FastAPI and connect to PostgreSQL
2. WHEN the system is configured THEN it SHALL use environment variables for all deployment-specific settings
3. WHEN the system is packaged THEN it SHALL include all necessary dependencies and configuration files
4. WHEN the system is started THEN it SHALL provide clear startup logs and health check endpoints
5. WHEN the system is deployed THEN it SHALL be ready for production deployment on private servers without external dependencies

### Requirement 10

**User Story:** As a system administrator, I want full traceability of all system actions, so that I can maintain accountability and investigate issues when they occur.

#### Acceptance Criteria

1. WHEN critical actions are performed THEN the system SHALL log all authentication attempts, triage operations, and administrative actions
2. WHEN audit logs are created THEN they SHALL include user ID, timestamp, action type, and payload summary without exposing sensitive raw data
3. WHEN audit logs are stored THEN they SHALL be queryable by authorized administrators
4. WHEN audit data is accessed THEN the system SHALL maintain log integrity and prevent tampering
5. WHEN compliance is required THEN the system SHALL provide audit trails for regulatory review

### Requirement 11

**User Story:** As a developer, I want comprehensive system observability, so that I can monitor performance and troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN API requests are processed THEN the system SHALL log all requests with response times and status codes
2. WHEN errors occur THEN the system SHALL track errors centrally with stack traces and context
3. WHEN system health is checked THEN the system SHALL expose /health endpoint with database connectivity and service status
4. WHEN performance monitoring is needed THEN the system SHALL support integration with monitoring tools
5. WHEN debugging is required THEN the system SHALL provide structured logging with appropriate log levels

### Requirement 12

**User Story:** As a healthcare system, I want the triage engine to be adaptable and improvable over time, so that decision accuracy can evolve with new medical knowledge and data insights.

#### Acceptance Criteria

1. WHEN triage operations are performed THEN inputs and outputs SHALL be stored for analysis and improvement
2. WHEN triage rules need updates THEN the system SHALL support rule modifications without breaking the API contract
3. WHEN the decision engine is modified THEN it SHALL remain modular and replaceable without system-wide changes
4. WHEN future enhancements are needed THEN the system SHALL support ML/AI integration without requiring architectural refactor
5. WHEN triage accuracy is evaluated THEN the system SHALL provide data for outcome analysis and rule refinement

### Requirement 13

**User Story:** As a security administrator, I want hardened authentication mechanisms, so that the system is protected against common authentication attacks and session vulnerabilities.

#### Acceptance Criteria

1. WHEN refresh tokens are used THEN they SHALL rotate on each use to prevent replay attacks
2. WHEN user sessions are managed THEN they SHALL be revocable by administrators and automatically expire
3. WHEN login attempts fail THEN the system SHALL implement progressive rate limiting and account lockout protection
4. WHEN passwords are stored THEN they SHALL be hashed using bcrypt or Argon2 with appropriate salt rounds
5. WHEN authentication tokens are issued THEN they SHALL include appropriate claims and be signed with rotating secrets
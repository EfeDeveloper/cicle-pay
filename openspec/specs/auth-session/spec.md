# auth-session

## Purpose

Session and route access. Protected app routes require a Firebase session; auth screens are guest-only.

## Requirements

### Requirement: Protected app routes require a session

Routes that use the authenticated app shell SHALL require a signed-in Firebase user. Unauthenticated navigation SHALL redirect to login.

#### Scenario: Anonymous user hits the dashboard

- **GIVEN** no Firebase session
- **WHEN** the user opens `/` or another protected route
- **THEN** they are redirected to `/auth/login`
- **AND** a safe relative `redirect` query may be preserved

### Requirement: Guest-only auth routes

Login, register, and forgot-password SHALL be reachable only without a session. A signed-in user SHALL be sent to a safe in-app path (default `/`).

#### Scenario: Signed-in user opens login

- **GIVEN** an authenticated user
- **WHEN** they open `/auth/login`
- **THEN** they are redirected into the app, not left on the auth screen

### Requirement: Sign-in methods

The system SHALL support email/password sign-in and registration, Google popup sign-in, password reset email, and sign-out. Open-redirect values in `redirect` SHALL be ignored (only same-origin relative paths starting with a single `/`).

#### Scenario: External redirect is ignored

- **WHEN** `redirect` is `https://evil.example` or `//evil.example`
- **THEN** the post-login destination is `/`

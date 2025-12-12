# CDN Line Management Specification

## ADDED Requirements

### Requirement: CDN Provider Management
The system SHALL provide functionality to manage CDN providers, including creating, reading, updating, and deleting provider records.

#### Scenario: Create CDN Provider
- **WHEN** a user provides provider name and code
- **THEN** the system SHALL create a new CDN provider record
- **AND** return the created provider with generated ID and timestamps

#### Scenario: List CDN Providers
- **WHEN** a user requests the list of CDN providers
- **THEN** the system SHALL return all CDN providers
- **AND** include provider ID, name, code, and timestamps

#### Scenario: Get CDN Provider Details
- **WHEN** a user requests a specific CDN provider by ID
- **THEN** the system SHALL return the provider details
- **AND** return 404 if the provider does not exist

#### Scenario: Update CDN Provider
- **WHEN** a user updates provider information
- **THEN** the system SHALL update the provider record
- **AND** update the updated_at timestamp
- **AND** return 404 if the provider does not exist

#### Scenario: Delete CDN Provider
- **WHEN** a user deletes a CDN provider
- **THEN** the system SHALL remove the provider record
- **AND** handle associated CDN lines (either prevent deletion or cascade delete)
- **AND** return 404 if the provider does not exist

### Requirement: CDN Line Management
The system SHALL provide functionality to manage CDN lines, including creating, reading, updating, and deleting line records. Each line MUST be associated with a CDN provider.

#### Scenario: Create CDN Line
- **WHEN** a user provides line name, display name, and provider ID
- **THEN** the system SHALL create a new CDN line record
- **AND** validate that the provider exists
- **AND** return 400 if the provider does not exist
- **AND** return the created line with generated ID and timestamps

#### Scenario: List CDN Lines
- **WHEN** a user requests the list of CDN lines
- **THEN** the system SHALL return all CDN lines
- **AND** include line ID, provider information, name, display name, and timestamps
- **AND** optionally filter by provider ID

#### Scenario: Get CDN Lines by Provider
- **WHEN** a user requests lines for a specific provider
- **THEN** the system SHALL return all lines associated with that provider
- **AND** return empty list if provider has no lines
- **AND** return 404 if the provider does not exist

#### Scenario: Get CDN Line Details
- **WHEN** a user requests a specific CDN line by ID
- **THEN** the system SHALL return the line details including provider information
- **AND** return 404 if the line does not exist

#### Scenario: Update CDN Line
- **WHEN** a user updates line information
- **THEN** the system SHALL update the line record
- **AND** validate that the provider exists if provider_id is changed
- **AND** update the updated_at timestamp
- **AND** return 404 if the line does not exist
- **AND** return 400 if the new provider does not exist

#### Scenario: Delete CDN Line
- **WHEN** a user deletes a CDN line
- **THEN** the system SHALL remove the line record
- **AND** return 404 if the line does not exist
- **AND** check if line is used by video stream endpoints (prevent deletion if in use)

### Requirement: Data Validation
The system SHALL validate all input data for CDN providers and lines.

#### Scenario: Validate Provider Name
- **WHEN** creating or updating a provider
- **THEN** the system SHALL require a non-empty name
- **AND** return 400 if name is empty or exceeds maximum length

#### Scenario: Validate Provider Code
- **WHEN** creating or updating a provider
- **THEN** the system SHALL require a unique code
- **AND** return 400 if code is empty, duplicate, or invalid format

#### Scenario: Validate Line Name
- **WHEN** creating or updating a line
- **THEN** the system SHALL require a non-empty name
- **AND** return 400 if name is empty or exceeds maximum length

#### Scenario: Validate Line Display Name
- **WHEN** creating or updating a line
- **THEN** the system SHALL require a non-empty display name
- **AND** return 400 if display name is empty or exceeds maximum length

#### Scenario: Validate Provider Association
- **WHEN** creating or updating a line
- **THEN** the system SHALL require a valid provider ID
- **AND** return 400 if provider ID is missing or invalid
- **AND** return 404 if provider does not exist

### Requirement: User Interface
The system SHALL provide a web-based user interface for managing CDN providers and lines.

#### Scenario: Provider List View
- **WHEN** a user navigates to the CDN providers page
- **THEN** the system SHALL display a table of all providers
- **AND** show provider name, code, and creation time
- **AND** provide actions to create, edit, and delete providers

#### Scenario: Provider Form
- **WHEN** a user creates or edits a provider
- **THEN** the system SHALL display a form with name and code fields
- **AND** validate input before submission
- **AND** show error messages for invalid input

#### Scenario: Line List View
- **WHEN** a user navigates to the CDN lines page
- **THEN** the system SHALL display a table of all lines
- **AND** show line name, display name, associated provider, and creation time
- **AND** provide actions to create, edit, and delete lines
- **AND** allow filtering by provider

#### Scenario: Line Form
- **WHEN** a user creates or edits a line
- **THEN** the system SHALL display a form with name, display name, and provider selection
- **AND** validate input before submission
- **AND** show error messages for invalid input
- **AND** load available providers for selection

#### Scenario: Delete Confirmation
- **WHEN** a user attempts to delete a provider or line
- **THEN** the system SHALL show a confirmation dialog
- **AND** prevent accidental deletion
- **AND** show warning if deletion would affect related data


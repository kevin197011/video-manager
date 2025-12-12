# Video Stream Endpoints Management Specification

## ADDED Requirements

### Requirement: Domain Management
The system SHALL provide functionality to manage domains, including creating, reading, updating, and deleting domain records.

#### Scenario: Create Domain
- **WHEN** a user provides domain name (e.g., a.com, b.com)
- **THEN** the system SHALL create a new domain record
- **AND** validate that the domain format is valid
- **AND** return the created domain with generated ID and timestamps

#### Scenario: List Domains
- **WHEN** a user requests the list of domains
- **THEN** the system SHALL return all domains
- **AND** include domain ID, name, and timestamps

#### Scenario: Update Domain
- **WHEN** a user updates domain information
- **THEN** the system SHALL update the domain record
- **AND** update the updated_at timestamp
- **AND** return 404 if the domain does not exist

#### Scenario: Delete Domain
- **WHEN** a user deletes a domain
- **THEN** the system SHALL remove the domain record
- **AND** prevent deletion if the domain is used by video stream endpoints
- **AND** return 404 if the domain does not exist

### Requirement: Stream Management
The system SHALL provide functionality to manage video stream categories (e.g., kkw, eu2, eu3), including creating, reading, updating, and deleting stream records.

#### Scenario: Create Stream
- **WHEN** a user provides stream name and code (e.g., kkw, eu2, eu3)
- **THEN** the system SHALL create a new stream record
- **AND** return the created stream with generated ID and timestamps

#### Scenario: List Streams
- **WHEN** a user requests the list of streams
- **THEN** the system SHALL return all streams
- **AND** include stream ID, name, code, and timestamps

#### Scenario: Update Stream
- **WHEN** a user updates stream information
- **THEN** the system SHALL update the stream record
- **AND** update the updated_at timestamp
- **AND** return 404 if the stream does not exist

#### Scenario: Delete Stream
- **WHEN** a user deletes a stream
- **THEN** the system SHALL remove the stream record
- **AND** prevent deletion if the stream is used by video stream endpoints
- **AND** return 404 if the stream does not exist

### Requirement: Stream Path Management
The system SHALL provide functionality to manage stream paths (e.g., k03/k001, e203/e201), including creating, reading, updating, and deleting stream path records. Each path MUST be associated with a stream.

#### Scenario: Create Stream Path
- **WHEN** a user provides path name, full path, and stream ID
- **THEN** the system SHALL create a new stream path record
- **AND** validate that the stream exists
- **AND** return 400 if the stream does not exist
- **AND** return the created path with generated ID and timestamps

#### Scenario: List Stream Paths
- **WHEN** a user requests the list of stream paths
- **THEN** the system SHALL return all stream paths
- **AND** include path ID, name, full path, associated stream information, and timestamps
- **AND** optionally filter by stream ID

#### Scenario: Update Stream Path
- **WHEN** a user updates stream path information
- **THEN** the system SHALL update the path record
- **AND** validate that the stream exists if stream_id is changed
- **AND** update the updated_at timestamp
- **AND** return 404 if the path does not exist
- **AND** return 400 if the new stream does not exist

#### Scenario: Delete Stream Path
- **WHEN** a user deletes a stream path
- **THEN** the system SHALL remove the path record
- **AND** return 404 if the path does not exist
- **AND** prevent deletion if the path is used by video stream endpoints

### Requirement: Video Stream Endpoint Management
The system SHALL provide functionality to manage video stream endpoints, including creating, reading, updating, and deleting endpoint records. Each endpoint MUST be associated with a CDN line, domain, stream, and stream path.

#### Scenario: Create Video Stream Endpoint
- **WHEN** a user provides line_id, domain_id, stream_id, and stream_path_id
- **THEN** the system SHALL create a new video stream endpoint record
- **AND** automatically generate the full URL using the pattern: `https://{line_display_name}.{domain}/{stream_path}.flv`
- **AND** validate that all referenced entities exist
- **AND** return 400 if any referenced entity does not exist
- **AND** return the created endpoint with generated ID, full URL, and timestamps

#### Scenario: List Video Stream Endpoints
- **WHEN** a user requests the list of video stream endpoints
- **THEN** the system SHALL return all endpoints
- **AND** include endpoint ID, full URL, associated line, domain, stream, path information, status, and timestamps
- **AND** optionally filter by line_id, domain_id, stream_id, or status

#### Scenario: Get Video Stream Endpoint Details
- **WHEN** a user requests a specific endpoint by ID
- **THEN** the system SHALL return the endpoint details including all associated information
- **AND** return 404 if the endpoint does not exist

#### Scenario: Update Video Stream Endpoint
- **WHEN** a user updates endpoint information
- **THEN** the system SHALL update the endpoint record
- **AND** automatically regenerate the full URL if any referenced entity changes
- **AND** validate that all referenced entities exist
- **AND** update the updated_at timestamp
- **AND** return 404 if the endpoint does not exist
- **AND** return 400 if any new referenced entity does not exist

#### Scenario: Delete Video Stream Endpoint
- **WHEN** a user deletes a video stream endpoint
- **THEN** the system SHALL remove the endpoint record
- **AND** return 404 if the endpoint does not exist

#### Scenario: Toggle Endpoint Status
- **WHEN** a user toggles the status of an endpoint (enable/disable)
- **THEN** the system SHALL update the status field
- **AND** return 404 if the endpoint does not exist

### Requirement: URL Generation
The system SHALL automatically generate video stream endpoint URLs according to a defined pattern.

#### Scenario: Generate URL from Components
- **WHEN** creating or updating a video stream endpoint
- **THEN** the system SHALL generate the full URL using: `https://{line_display_name}.{domain}/{stream_path}.flv`
- **WHERE** line_display_name comes from cdn_lines.display_name
- **AND** domain comes from domains.name
- **AND** stream_path comes from stream_paths.full_path
- **AND** the suffix is always `.flv`

#### Scenario: Regenerate URL on Update
- **WHEN** any component of a video stream endpoint is updated (line, domain, or path)
- **THEN** the system SHALL automatically regenerate the full URL
- **AND** update the full_url field in the database

### Requirement: Batch Endpoint Generation
The system SHALL support batch generation of video stream endpoints from combinations of lines, domains, streams, and paths.

#### Scenario: Generate Endpoints for Stream
- **WHEN** a user requests batch generation for a specific stream
- **THEN** the system SHALL generate endpoints for all combinations of:
  - All CDN lines associated with the stream's provider
  - All domains
  - All paths associated with the stream
- **AND** create endpoint records for each valid combination
- **AND** skip combinations that already exist

#### Scenario: Generate Endpoints for Line
- **WHEN** a user requests batch generation for a specific CDN line
- **THEN** the system SHALL generate endpoints for all combinations of:
  - The specified line
  - All domains
  - All streams and their associated paths
- **AND** create endpoint records for each valid combination

### Requirement: Data Validation
The system SHALL validate all input data for domains, streams, stream paths, and video stream endpoints.

#### Scenario: Validate Domain Name
- **WHEN** creating or updating a domain
- **THEN** the system SHALL require a valid domain format
- **AND** return 400 if domain format is invalid
- **AND** ensure domain name is unique

#### Scenario: Validate Stream Code
- **WHEN** creating or updating a stream
- **THEN** the system SHALL require a unique code
- **AND** return 400 if code is empty, duplicate, or invalid format

#### Scenario: Validate Stream Path
- **WHEN** creating or updating a stream path
- **THEN** the system SHALL require a valid path format
- **AND** return 400 if path is empty or invalid format
- **AND** ensure the path is associated with a valid stream

#### Scenario: Validate Endpoint References
- **WHEN** creating or updating a video stream endpoint
- **THEN** the system SHALL validate that all referenced entities exist
- **AND** return 400 if any referenced entity is missing or invalid

### Requirement: User Interface
The system SHALL provide a web-based user interface for managing domains, streams, stream paths, and video stream endpoints.

#### Scenario: Domain List View
- **WHEN** a user navigates to the domains page
- **THEN** the system SHALL display a table of all domains
- **AND** show domain name and creation time
- **AND** provide actions to create, edit, and delete domains

#### Scenario: Stream List View
- **WHEN** a user navigates to the streams page
- **THEN** the system SHALL display a table of all streams
- **AND** show stream name, code, and creation time
- **AND** provide actions to create, edit, and delete streams

#### Scenario: Stream Path List View
- **WHEN** a user navigates to the stream paths page
- **THEN** the system SHALL display a table of all paths
- **AND** show path name, full path, associated stream, and creation time
- **AND** provide actions to create, edit, and delete paths
- **AND** allow filtering by stream

#### Scenario: Endpoint List View
- **WHEN** a user navigates to the video stream endpoints page
- **THEN** the system SHALL display a table of all endpoints
- **AND** show endpoint ID, full URL, associated line, domain, stream, path, status, and creation time
- **AND** provide actions to create, edit, delete, and toggle status
- **AND** allow filtering by line, domain, stream, or status
- **AND** provide search functionality

#### Scenario: Batch Generation UI
- **WHEN** a user accesses the batch generation feature
- **THEN** the system SHALL display a form to select:
  - CDN line(s) or stream(s)
  - Domain(s)
  - Stream path(s) or stream(s) for automatic path selection
- **AND** show a preview of endpoints that will be generated
- **AND** allow the user to confirm and generate all endpoints

#### Scenario: Endpoint Details View
- **WHEN** a user views endpoint details
- **THEN** the system SHALL display all endpoint information
- **AND** show the full URL in a clickable format
- **AND** display all associated entities (line, domain, stream, path)
- **AND** allow editing from the details view


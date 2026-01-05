## MODIFIED Requirements

### Requirement: Video Stream Endpoint Management
The system SHALL provide functionality to manage video stream endpoints, including creating, reading, updating, and deleting endpoint records. Each endpoint MUST be associated with a CDN line, domain, stream, and stream path. Each endpoint SHALL automatically detect and store resolution information.

#### Scenario: Create Video Stream Endpoint with Resolution Detection
- **WHEN** a user provides line_id, domain_id, stream_id, and stream_path_id
- **THEN** the system SHALL create a new video stream endpoint record
- **AND** automatically generate the full URL using the pattern: `https://{line_display_name}.{domain}/{stream_path}.flv`
- **AND** automatically detect resolution from the stream path (full_path)
- **AND** set resolution to "普清" (SD), "高清" (HD), or "超清" (UHD) based on path content
- **AND** default to "普清" if resolution cannot be detected
- **AND** validate that all referenced entities exist
- **AND** return 400 if any referenced entity does not exist
- **AND** return the created endpoint with generated ID, full URL, resolution, and timestamps

#### Scenario: List Video Stream Endpoints with Resolution
- **WHEN** a user requests the list of video stream endpoints
- **THEN** the system SHALL return all endpoints
- **AND** include endpoint ID, full URL, resolution, associated line, domain, stream, path information, status, and timestamps
- **AND** optionally filter by line_id, domain_id, stream_id, status, or resolution
- **AND** support filtering by resolution values: "普清", "高清", "超清"

#### Scenario: Update Video Stream Endpoint with Resolution Re-detection
- **WHEN** a user updates endpoint information
- **THEN** the system SHALL update the endpoint record
- **AND** automatically regenerate the full URL if any referenced entity changes
- **AND** automatically re-detect resolution from the updated stream path
- **AND** update the resolution field if the path has changed
- **AND** validate that all referenced entities exist
- **AND** update the updated_at timestamp
- **AND** return 404 if the endpoint does not exist
- **AND** return 400 if any new referenced entity does not exist

#### Scenario: Batch Generate Endpoints with Resolution Detection
- **WHEN** the system generates video stream endpoints in batch
- **THEN** the system SHALL automatically detect resolution for each generated endpoint
- **AND** set resolution based on the stream path (full_path) of each endpoint
- **AND** ensure all generated endpoints have a resolution value

## ADDED Requirements

### Requirement: Resolution Detection
The system SHALL automatically detect video stream resolution from stream paths and store it in the endpoint record.

#### Scenario: Detect Standard Definition (SD) Resolution
- **WHEN** a stream path contains "SD" or "sd" (case-insensitive)
- **THEN** the system SHALL set resolution to "普清"
- **AND** store the value in the endpoint record

#### Scenario: Detect High Definition (HD) Resolution
- **WHEN** a stream path contains "HD" or "hd" (case-insensitive)
- **THEN** the system SHALL set resolution to "高清"
- **AND** store the value in the endpoint record

#### Scenario: Detect Ultra High Definition (UHD) Resolution
- **WHEN** a stream path contains "UHD", "uhd", "4K", or "4k" (case-insensitive)
- **THEN** the system SHALL set resolution to "超清"
- **AND** store the value in the endpoint record

#### Scenario: Default Resolution for Unrecognized Paths
- **WHEN** a stream path does not contain any recognized resolution identifier
- **THEN** the system SHALL set resolution to "普清" (default)
- **AND** store the value in the endpoint record

#### Scenario: Resolution Priority (Multiple Identifiers)
- **WHEN** a stream path contains multiple resolution identifiers (e.g., both "HD" and "UHD")
- **THEN** the system SHALL prioritize in order: UHD > HD > SD
- **AND** set resolution to the highest priority identifier found

### Requirement: Resolution Filtering
The system SHALL support filtering video stream endpoints by resolution.

#### Scenario: Filter by Resolution
- **WHEN** a user requests endpoints filtered by resolution
- **THEN** the system SHALL return only endpoints matching the specified resolution
- **AND** support filter values: "普清", "高清", "超清"
- **AND** return empty list if no endpoints match the filter

### Requirement: Resolution Display
The system SHALL display resolution information in the user interface.

#### Scenario: Display Resolution in Endpoint List
- **WHEN** a user views the video stream endpoints list
- **THEN** the system SHALL display resolution for each endpoint
- **AND** use visual indicators (e.g., badges or colors) to distinguish resolutions
- **AND** make resolution information clearly visible

#### Scenario: Filter Endpoints by Resolution in UI
- **WHEN** a user selects a resolution filter in the UI
- **THEN** the system SHALL filter the displayed endpoints
- **AND** update the list to show only matching endpoints
- **AND** provide option to clear filter and show all endpoints

### Requirement: Test Playback and Resolution Detection
The system SHALL provide functionality to test video stream playback and detect actual resolution from the stream.

#### Scenario: Test Resolution via API
- **WHEN** a user requests to test resolution for a specific endpoint via API
- **THEN** the system SHALL access the video stream URL
- **AND** detect the actual resolution from the video stream
- **AND** update the endpoint's resolution field with the detected value
- **AND** return the detected resolution
- **AND** handle timeout errors (e.g., 10 seconds)
- **AND** handle stream access errors (e.g., 404, network errors)
- **AND** return 404 if the endpoint does not exist

#### Scenario: Test Resolution from UI
- **WHEN** a user clicks the "分辨率检测" (Resolution Detection) button in the actions column for an endpoint
- **THEN** the system SHALL call the test resolution API
- **AND** display a loading state (button shows loading spinner, or "检测中..." message)
- **AND** disable the button to prevent duplicate clicks during detection
- **AND** access the video stream URL and detect actual resolution
- **AND** update the endpoint's resolution field in the database
- **AND** display a success message showing the detected resolution (e.g., "已更新为：高清")
- **AND** automatically refresh the endpoint list to show the updated resolution value
- **AND** show error message if detection fails (timeout, network error, unsupported format, etc.)
- **AND** restore button state after detection completes (success or failure)

#### Scenario: Detect Resolution from Video Stream
- **WHEN** testing resolution from an actual video stream
- **THEN** the system SHALL use lal library to access the stream
- **AND** support multiple protocols (HTTP-FLV, HLS, RTMP, etc.)
- **AND** parse the video stream to extract SPS (Sequence Parameter Set)
- **AND** extract the video resolution (width x height) from SPS
- **AND** classify resolution based on width:
  - Width ≤ 720px → "普清"
  - 720px < Width ≤ 1080px → "高清"
  - Width > 1080px → "超清" (including 1920px and higher)
- **AND** set timeout to prevent long waits (default 10 seconds)
- **AND** handle cases where stream is not accessible, format is unsupported, or protocol is not supported
- **AND** properly release resources (close connections, clean up buffers)


## ADDED Requirements

### Requirement: Receipt scanning action for manual expenses

The system SHALL provide an option within the «Agregar gasto adicional» control on the Gastos view to initiate receipt scanning via image capture or upload. The control SHALL remain accessible on the same desktop toolbar row alongside search and the due-day calendar trigger.

#### Scenario: User chooses to scan receipt from the expense action menu
- **GIVEN** the user is on the Gastos view
- **WHEN** the user opens the «Agregar gasto adicional» menu and selects the receipt scanning option
- **THEN** the system presents the image acquisition interface (file picker or mobile capture options)

#### Scenario: User chooses manual entry from the expense action menu
- **GIVEN** the user is on the Gastos view
- **WHEN** the user opens the «Agregar gasto adicional» menu and selects «Ingreso manual»
- **THEN** the system opens the standard empty «ManualExpenseFormSheet»

### Requirement: Dual image capture for desktop and mobile devices

The system SHALL support image acquisition adapted to the device context: on desktop environments, it SHALL open a file selection dialog filtered to supported image formats (PNG, JPG, JPEG, WEBP); on mobile devices, it SHALL offer options to capture a photo directly using the device camera (`capture="environment"`) or select an existing image from the device gallery.

#### Scenario: Desktop image upload
- **GIVEN** the user is using a desktop browser
- **WHEN** the user initiates receipt scanning
- **THEN** the browser file selector prompts for a supported image file (PNG, JPG, JPEG, WEBP) up to 10 MB

#### Scenario: Mobile camera capture
- **GIVEN** the user is using a mobile browser
- **WHEN** the user selects «Tomar foto»
- **THEN** the device opens the camera interface to take a picture of the physical receipt

#### Scenario: Mobile gallery selection
- **GIVEN** the user is using a mobile browser
- **WHEN** the user selects «Elegir de galería»
- **THEN** the device photo library or file picker is displayed to select an existing receipt image

### Requirement: Optical Character Recognition and AI extraction

When a receipt image is selected, the system SHALL send the image to the OCR extraction endpoint (`POST /api/v1/ocr/extract-text`) and, upon receiving legible text (`has_text: true`), submit the extracted text and current period to the AI structuring endpoint (`POST /api/v1/ai/extract-expense`). During processing, the system SHALL display visual feedback indicating the current progress stage (OCR and AI inference).

#### Scenario: Successful receipt extraction
- **GIVEN** a valid receipt image containing legible expense data
- **WHEN** the image is processed through the OCR and AI endpoints
- **THEN** the system receives structured expense fields (`name`, `amount`, `category`, `dueDay`, `periodKey`, `status`, `description`) conforming to `CreateManualExpenseInput`

#### Scenario: OCR detects no legible text
- **GIVEN** an image with no recognizable text or a blank photo
- **WHEN** the OCR endpoint returns `has_text: false`
- **THEN** the system notifies the user that no legible text was found
- **AND** the system does not call the AI extraction endpoint
- **AND** provides an option to retry with another image or fill the form manually

#### Scenario: Backend service unavailable or timeout
- **GIVEN** the backend server or AI model is unreachable, returns 503, or times out
- **WHEN** the scanning process encounters the network or server error
- **THEN** the system shows an error notification with a retry action and allows the user to open the manual entry form directly

### Requirement: Pre-filled review before saving scanned expenses

Upon successful OCR and AI extraction, the system SHALL open `ManualExpenseFormSheet` pre-populated with the inferred values. The system SHALL NOT persist the expense to Firestore without explicit user confirmation via the «Guardar gasto» action.

#### Scenario: Reviewing pre-filled expense data
- **GIVEN** the AI extraction returned an expense with name "Supermercado", amount 45000, and category "Alimentación"
- **WHEN** the extraction completes successfully
- **THEN** `ManualExpenseFormSheet` opens with the fields populated with those values
- **AND** the user can edit any field before submitting

#### Scenario: Saving a verified scanned expense
- **GIVEN** `ManualExpenseFormSheet` is open with pre-filled scanned data
- **WHEN** the user clicks «Guardar gasto»
- **THEN** the expense is persisted under `payment_cycles/{uid}/expenses/{periodKey}/items/*` with `source: 'manual'` and `templateId: null`
- **AND** the sheet closes and the expense appears in the current period list

# Lilly Technical Challenge Documentation

## Approach

I started by getting the project running locally and understanding the existing code before making any changes.

1. **Environment & backend setup**  
   - Cloned the repository and used the provided `start.bat` script on Windows to create/activate the virtual environment and start the FastAPI backend with Uvicorn.  
   - Verified the backend was working by calling:
     - `http://localhost:8000/medicines` in the browser to inspect the JSON structure.
     - `http://localhost:8000/medicines/{name}` for individual medicines.

2. **Understanding the API & data**  
   - Looked through `main.py` and `data.json` to understand:
     - What endpoints already existed (`/medicines`, `/medicines/{name}`, `/create`, `/update`, `/delete`).
     - The shape of each medicine object and where invalid or missing data might appear.
   - Noted that the “write” endpoints expect `Form` data rather than JSON, which influenced how I sent data from the frontend.

3. **Frontend planning**  
   - Decided to build a simple, single-page UI that:
     - Lists all medicines in a table.
     - Provides forms for create/update/delete actions.
     - Shows a status bar for feedback (success/error/info).
   - Kept the HTML structure minimal and handled most of the logic in `script.js` with some basic styling in `style.css`.

4. **Implementation order**  
   I deliberately followed this order to make sure I always had something working:
   1. Fetch and display data from `/medicines`.
   2. Add safe rendering and handling of missing/invalid data.
   3. Implement create, update and delete from the frontend.
   4. Implement the optional “average price” endpoint in the backend, then expose it in the UI.
   5. Improve the layout and UX with CSS.

5. **Use of external resources**  
   - Used the FastAPI docs and MDN Web Docs (JavaScript `fetch`, `URLSearchParams`, basic DOM APIs) as references.
   - I treated the internet as a reference only; all code and decisions were adapted to this specific challenge.

---

## Objectives - Innovative Solutions

### Fetching data and displaying it

- Implemented a `fetchAndRenderMedicines` function in `script.js` that:
  - Calls `GET /medicines`.
  - Extracts `data.medicines` and passes it to a `renderMedicines` function.
- Medicines are displayed in a simple table with columns for name and price.
- I added a reusable `showStatus(message, type)` helper to give immediate feedback (e.g. “Loaded X medicines”, “Failed to load medicines”).

### Handling missing/invalid data safely

One of the requirements was to handle gaps or invalid data in the database without the frontend crashing. To address this:

- In `renderMedicines`, I used defensive checks:
  - If `name` is missing or empty, I display `"Unknown name"` instead of relying on it blindly.
  - For `price`, I:
    - Check if it exists.
    - Attempt to convert it to a number.
    - If conversion fails, I show `"N/A"` rather than formatting it or throwing an error.
- This means that even if `data.json` contains nulls or unexpected values, the UI remains stable and readable.

### User-friendly create, update, and delete

To make the backend endpoints easier to use:

- I added three separate forms in `index.html`:
  - **Create medicine**: name + price.
  - **Update medicine price**: name + new price.
  - **Delete medicine**: name only.
- Each form has a corresponding handler in `script.js`:
  - Converts the form inputs into `URLSearchParams` so they are sent as `application/x-www-form-urlencoded`, matching FastAPI’s `Form(...)` expectations.
  - Calls the appropriate endpoint (`/create`, `/update`, `/delete`).
  - Parses the JSON response and updates the status bar with success or error messages.
  - Re-fetches the medicines list after successful operations to keep the UI in sync.
- This makes the API usable by non-technical users without needing tools like Postman.

### Optional objective: average price endpoint

For the optional backend objective:

- I added a new endpoint in `main.py` at `/medicines/average-price`.
- The function:
  - Reads `data.json`.
  - Iterates over the `medicines` list.
  - Attempts to convert each `price` to a float, ignoring any missing, null, or invalid values.
  - If there are no valid prices, it returns an object with `average_price = None`, `count = 0`, and a message such as `"No valid prices found"`.
  - Otherwise, it calculates the average by summing valid prices and dividing by the count, and returns:
    - `average_price`: the computed average.
    - `count`: how many medicines were included in the calculation.
- On the frontend, I added a “Show Average Price” button that:
  - Calls `GET /medicines/average-price`.
  - Displays a rounded `average_price` and the `count` of medicines used.
  - Shows an informative message if there are no valid prices.

This demonstrates how I can extend the backend to support new reporting requirements and expose them in the UI.

### UX and design improvements

- Reworked the layout so that:
  - The left panel shows the current medicines table and status messages.
  - The right panel groups all management forms (create, update, delete) with clear headings.
- Added basic styling in `style.css` to:
  - Use card-like panels with shadows and padding.
  - Make the table readable with alternating row backgrounds.
  - Color-code status messages (info, success, error).
  - Ensure the layout becomes a single-column layout on smaller screens.
- The goal was to keep the design clean and easy to scan while staying within the suggested 30–60 minute time budget.

---

## Problems Faced

1. **Initial script execution on Windows (`start.ps1` vs `start.bat`)**  
   - I initially tried to run `./start.ps1` from Command Prompt and received:  
     `'.' is not recognized as an internal or external command...`  
   - I realised that `.ps1` is a PowerShell script and I was in `cmd.exe`. The fix was either:
     - Run `start.bat` instead from Command Prompt (which I did), or
     - Use PowerShell to run the `.ps1` script.
   - Once I ran `start.bat`, the virtual environment activated correctly and Uvicorn started without issues.

2. **Understanding how data is returned from `/medicines`**  
   - At first I wasn’t sure if the endpoint returned an array or an object. Inspecting the JSON and reading `main.py` clarified that it returns an object with a `medicines` property.
   - I adjusted the frontend code accordingly, accessing `data.medicines` and falling back to an empty array if it was missing.

3. **Form encoding vs JSON in POST/DELETE requests**  
   - FastAPI’s `Form(...)` parameters expect form-encoded data, not JSON.
   - My first instinct was to send JSON from the frontend, but this would not bind correctly to `name: str = Form(...)`.
   - I fixed this by using `URLSearchParams` and setting the `Content-Type` to `application/x-www-form-urlencoded`, which worked as expected.

4. **Handling potential invalid data gracefully**  
   - While building the rendering logic, I had to think about how to handle undefined, null, or non-numeric values for `price` so the UI wouldn’t break.
   - I addressed this with small helpers and type-checks, and verified that the page continues to work even if some data entries are incomplete.

---

## Evaluation

Overall, I found the challenge well-structured and realistic: it mirrors a common scenario of working with an existing backend and a barebones frontend and then improving both.

- **What went well**
  - Getting the backend running and understanding the API from `main.py` was straightforward.
  - The basic fetch + render loop came together quickly once I understood the shape of the data.
  - Adding the average price endpoint was a good opportunity to show backend extension and defensive coding around invalid data.

- **What was more challenging**
  - Being disciplined about error handling and not assuming the data was always clean took a bit more thought.
  - I had to be careful with how the frontend sent data so it matched FastAPI’s `Form(...)` expectations.

- **If I had more time, I would:**
  - Add **search and filtering** on the frontend (e.g. filter medicines by name or by price range).
  - Add **sorting** (e.g. by price ascending/descending).
  - Improve validation and feedback for the forms (e.g. inline validation messages, disabling submit buttons while a request is in progress).
  - Add basic automated tests for the backend (e.g. testing the average price logic and CRUD operations).
  - Consider splitting the frontend JS into smaller modules (e.g. API client, UI rendering, state management) as the app grows.

In summary, I focused on meeting the core objectives first (fetching data, safe rendering, CRUD operations, and a cleaner UI), then used the optional average price feature to demonstrate how I’d extend and use the backend for reporting.

# Setup Google Sheets for Client Inquiries Storage

This guide explains how to connect your portfolio website to a Google Sheet so that client inquiries are automatically saved into Google Sheets and loaded into your private `/admin` dashboard.

---

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it **Portfolio Inquiries**.
3. In the first row (Row 1), add these headers:
   - **A1**: `ID`
   - **B1**: `Date Received`
   - **C1**: `Name`
   - **D1**: `Email`
   - **E1**: `Service`
   - **F1**: `Shoot Date`
   - **G1**: `Location`
   - **H1**: `Budget`
   - **I1**: `Details`

---

### Step 2: Add Google Apps Script
1. In the top menu of your Google Sheet, click **Extensions** &rarr; **Apps Script**.
2. Delete any code in the editor and paste the following code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var item = data.data || data;

    sheet.appendRow([
      item.id || Utilities.getUuid(),
      item.created_at || new Date().toISOString(),
      item.name || '',
      item.email || '',
      item.service || '',
      item.event_date || '',
      item.location || '',
      item.budget || '',
      item.details || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var inquiries = [];

    // Row 0 is headers, data starts from Row 1
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row[0] && !row[2]) continue; // Skip empty rows

      inquiries.push({
        id: String(row[0]),
        created_at: String(row[1]),
        name: String(row[2]),
        email: String(row[3]),
        service: String(row[4]),
        event_date: String(row[5]),
        location: String(row[6]),
        budget: String(row[7]),
        details: String(row[8])
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, inquiries: inquiries }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Step 3: Deploy as Web App
1. In Apps Script, click the blue **Deploy** button (top right) &rarr; **New deployment**.
2. Click the gear icon (&gear;) next to "Select type" and choose **Web app**.
3. Set the following options:
   - **Description**: `Portfolio Inquiry Webhook`
   - **Execute as**: `Me` (your Google Account)
   - **Who has access**: `Anyone` (this allows your serverless function to write to the sheet)
4. Click **Deploy**, authorize permissions if prompted.
5. Copy the **Web App URL** (it looks like `https://script.google.com/macros/s/.../exec`).

---

### Step 4: Add Environment Variables in Vercel
In your Vercel Project Settings &rarr; **Environment Variables**, add:
- `GOOGLE_SHEETS_WEBHOOK_URL`: *(Your Web App URL from Step 3)*
- `ADMIN_USERNAME`: `your_admin_username`
- `ADMIN_PASSWORD`: `your_admin_password`
- `ADMIN_SESSION_SECRET`: `any_random_32_character_secret_string`
- `CONTACT_EMAIL`: `your_email@gmail.com`
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `your_email@gmail.com`
- `SMTP_PASSWORD`: `your_gmail_app_password`

Now, whenever a client submits a form, it goes directly to your Google Sheet and sends you an email alert. When you log into `/admin.html`, it reads and lists all inquiries directly from the Google Sheet!

import { google } from 'googleapis';

export async function getGoogleSheetData(spreadsheetId, range) {
    try {
      const auth = new google.auth.GoogleAuth({
        // keyFile: path.join(process.cwd(), '/etc/secrets/google-service-account-file.json'), // 認証情報ファイルへのパス
        scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      });
  
      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: 'v4', auth: client });
      const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
  
      return response.data.values;
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw error;
    }
}

/**
 * Writes data to a Google Sheet.
 * 
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} range The A1 notation of the range to update.
 * @param {Array<Array<string>>} values The data to write (2D array).
 */

export async function writeToGoogleSheet(spreadsheetId, range, values) {
  try {
    const auth = new google.auth.GoogleAuth({
      // Depending on your environment, you might need to specify credentials here
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    const response = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    console.log(response.data); // Log the response for debugging purposes
    return response.data; // You might want to return something more specific here
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    throw error; // Re-throw the error for upstream handling
  }
}

  
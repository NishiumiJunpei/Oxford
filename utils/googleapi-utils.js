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


  
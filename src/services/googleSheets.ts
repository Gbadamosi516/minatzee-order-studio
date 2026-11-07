import { Order } from '../types/order';

const SPREADSHEET_TITLE = 'Minatzee Order Studio - Boutique Orders';
const SHEET_TAB_NAME = 'Orders';

const HEADERS = [
  'Order ID',
  'Order Date',
  'Customer Name',
  'Phone Number',
  'WhatsApp Contact',
  'Product Category',
  'Product Description',
  'Size',
  'Quantity',
  'Order Amount (NGN)',
  'Amount Paid (NGN)',
  'Balance Due (NGN)',
  'Payment Status',
  'Order Stage',
  'Dispatch Date',
  'Notes',
  'Last Updated'
];

export interface SyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  count: number;
  syncedAt: string;
}

/**
 * Find existing Minatzee Orders spreadsheet or create a new one in Google Drive.
 */
export async function findOrCreateSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  // 1. Search Google Drive for existing spreadsheet
  const query = encodeURIComponent(
    `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  );
  
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const file = searchData.files[0];
      return {
        id: file.id,
        url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      };
    }
  }

  // 2. Not found, create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Apply luxury Burgundy styling to header row (row 0)
  try {
    const sheetId = created.sheets?.[0]?.properties?.sheetId ?? 0;
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.604, // #9A3442
                    green: 0.204,
                    blue: 0.259,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0,
                    },
                    bold: true,
                    fontSize: 10,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Could not apply header styling to spreadsheet:', styleErr);
  }

  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Synchronize all current orders into the Google Spreadsheet.
 */
export async function syncOrdersToSpreadsheet(
  accessToken: string,
  orders: Order[]
): Promise<SyncResult> {
  const { id: spreadsheetId, url: spreadsheetUrl } = await findOrCreateSpreadsheet(accessToken);

  // Clear existing values in the sheet to prevent orphaned rows
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TAB_NAME)}!A1:Z1000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Prepare data rows
  const rows = orders.map((o) => [
    o.id,
    o.orderDate || '',
    o.customerName || '',
    o.phoneNumber || '',
    o.whatsappContact || o.phoneNumber || '',
    o.productCategory || '',
    o.productDescription || '',
    o.size || '',
    o.quantity ?? 1,
    o.orderAmount ?? 0,
    o.amountPaid ?? 0,
    o.balanceDue ?? 0,
    o.paymentStatus || '',
    o.orderStage || '',
    o.dispatchDate || '—',
    o.notes || '',
    o.updatedAt || o.createdAt || new Date().toISOString(),
  ]);

  const allValues = [HEADERS, ...rows];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TAB_NAME)}!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to write order data to Google Sheets: ${errText}`);
  }

  const syncedAt = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Store spreadsheet link in localStorage for quick retrieval
  try {
    localStorage.setItem('minatzee_google_sheet_id', spreadsheetId);
    localStorage.setItem('minatzee_google_sheet_url', spreadsheetUrl);
    localStorage.setItem('minatzee_google_sheet_last_sync', syncedAt);
  } catch (e) {
    // ignore
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    count: orders.length,
    syncedAt,
  };
}

export function getCachedSheetInfo(): { spreadsheetUrl: string | null; lastSync: string | null } {
  try {
    return {
      spreadsheetUrl: localStorage.getItem('minatzee_google_sheet_url'),
      lastSync: localStorage.getItem('minatzee_google_sheet_last_sync'),
    };
  } catch {
    return { spreadsheetUrl: null, lastSync: null };
  }
}

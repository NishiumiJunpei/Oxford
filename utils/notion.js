import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_SECRET });

export async function getWordsFromNotion(databaseType = 'MY_WORD_LIST') {
  let databaseId = process.env.NOTION_DATABASE_ID_MY_WORD_LIST;

  if (databaseType == 'EIKENSUB1_WORD_LIST') databaseId = process.env.NOTION_DATABASE_ID_EIKENSUB1_WORD_LIST

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  return response.results;
}

export async function updateWordStatusInNotion(pageId, status) {
  const currentDateTime = new Date().toISOString();  // ← 現在の日時を取得

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Memorized": {
        type: "checkbox",
        checkbox: status == 1 ? true : false
      },
      "CheckDate": { date: { start: currentDateTime } }  // ← CheckDateカラムに現在の日時を設定

    }
  });
}

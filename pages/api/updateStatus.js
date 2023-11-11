import { updateWordStatusInNotion } from "../../utils/notion";

export default async function handler(req, res) {
  const { pageId, status } = req.query;

  await updateWordStatusInNotion(pageId, status);

  res.json({ success: true });
}

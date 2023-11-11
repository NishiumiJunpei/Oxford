// pages/api/userwordlist.js
import { getSession } from "next-auth/client"
import { createUserWordList, updateUserWordList } from "../../utils/prisma-utils"

export default async (req, res) => {
  const session = await getSession({ req })
  if (session) {
    const userId = session.user.id
    if (req.method === "POST") {
      const data = req.body
      data.userId = userId
      const newUserWordList = await createUserWordList(data)
      res.status(200).json(newUserWordList)
    } else if (req.method === "PUT") {
      const { id, ...data } = req.body
      data.userId = userId
      const updatedUserWordList = await updateUserWordList(id, data)
      res.status(200).json(updatedUserWordList)
    } else {
      res.status(405).send("Method Not Allowed")
    }
  } else {
    res.status(401).send("Unauthorized")
  }
}

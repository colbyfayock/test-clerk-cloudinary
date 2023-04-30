import { getAuth, clerkClient } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  const { role } = JSON.parse(req.body);
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      role
    }
  });

  res.status(200).json({
    status: 'Ok'
  })
}

import { reorderBlocks } from "@/lib/article-blocks.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function POST(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { blocks } = await request.json();
    await reorderBlocks(blocks);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

import { updateBlock, deleteBlock } from "@/lib/article-blocks.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function PUT(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { blockId } = await props.params;
    const { data } = await request.json();

    await updateBlock(blockId, data);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { blockId } = await props.params;
    await deleteBlock(blockId);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

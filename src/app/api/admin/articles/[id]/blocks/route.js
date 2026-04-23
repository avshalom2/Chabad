import { getArticleBlocks, createBlock } from "@/lib/article-blocks.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function GET(request, props) {
  try {
    const { id } = await props.params;
    const blocks = await getArticleBlocks(id);
    return Response.json(blocks);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const { block_type, data, sort_order } = await request.json();

    if (!block_type) return Response.json({ error: "block_type required" }, { status: 400 });

    const blockId = await createBlock(id, block_type, data || {}, sort_order || 0);
    return Response.json({ id: blockId }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

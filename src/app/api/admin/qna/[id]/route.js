import { getQnaSetById, updateQnaSet, deleteQnaSet } from "@/lib/qna.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function GET(request, props) {
  try {
    const { id } = await props.params;
    const qnaSet = await getQnaSetById(id);

    if (!qnaSet) {
      return Response.json({ error: "Q&A set not found" }, { status: 404 });
    }

    return Response.json(qnaSet);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();
    const { name, description } = body;

    const qnaSet = await updateQnaSet(id, { name, description });
    return Response.json(qnaSet);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    await deleteQnaSet(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

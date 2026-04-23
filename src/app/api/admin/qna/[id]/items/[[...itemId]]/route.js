import { addQnaItem, updateQnaItem, deleteQnaItem } from "@/lib/qna.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function POST(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();
    const { question, answer, itemOrder } = body;

    if (!question || !answer) {
      return Response.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const itemId = await addQnaItem(id, {
      question,
      answer,
      itemOrder: itemOrder || 0,
    });

    return Response.json({ id: itemId }, { status: 201 });
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

    const { id, itemId } = await props.params;
    const body = await request.json();
    const { question, answer, itemOrder } = body;

    await updateQnaItem(itemId, {
      question,
      answer,
      itemOrder,
    });

    return Response.json({ success: true });
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

    const { itemId } = await props.params;
    await deleteQnaItem(itemId);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

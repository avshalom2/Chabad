import { getFormById, updateForm, deleteForm, addFormField, deleteFormField } from "@/lib/forms.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function GET(request, props) {
  try {
    const { id } = await props.params;
    const form = await getFormById(id);

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    return Response.json(form);
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

    const form = await updateForm(id, { name, description });
    return Response.json(form);
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
    await deleteForm(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

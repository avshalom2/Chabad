import { addFormField, updateFormField, deleteFormField } from "@/lib/forms.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function POST(request, props) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();

    const {
      fieldName,
      fieldType,
      fieldLabel,
      placeholder,
      isRequired,
      fieldOrder,
      options,
    } = body;

    if (!fieldName || !fieldType) {
      return Response.json(
        { error: "Field name and type are required" },
        { status: 400 }
      );
    }

    const fieldId = await addFormField(id, {
      fieldName,
      fieldType,
      fieldLabel,
      placeholder,
      isRequired: isRequired ? 1 : 0,
      fieldOrder,
      options,
    });

    return Response.json({ id: fieldId }, { status: 201 });
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

    const { id, fieldId } = await props.params;
    const body = await request.json();

    const { fieldLabel, placeholder, isRequired, fieldOrder, options } = body;

    await updateFormField(fieldId, {
      fieldLabel,
      placeholder,
      isRequired: isRequired ? 1 : 0,
      fieldOrder,
      options,
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

    const { fieldId } = await props.params;
    await deleteFormField(fieldId);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

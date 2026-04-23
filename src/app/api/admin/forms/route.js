import { getForms, createForm, slugExists } from "@/lib/forms.js";
import { getCurrentUserSession } from "@/lib/auth-session.js";

export async function GET() {
  try {
    const forms = await getForms();
    return Response.json(forms);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUserSession();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ error: "Form name is required" }, { status: 400 });
    }

    // Generate slug from name
    let slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // Check if slug exists
    if (await slugExists(slug)) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await slugExists(newSlug)) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const form = await createForm({
      name,
      slug,
      description,
      createdBy: user.id,
    });

    return Response.json(form, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

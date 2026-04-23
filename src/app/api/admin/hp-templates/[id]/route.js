import { getTemplateById, updateTemplateHtml, updateTemplate, deleteTemplate, setActiveTemplate } from '@/lib/hp-templates.js';

// GET - Fetch single template
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const template = await getTemplateById(id);

    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update template HTML (edited version)
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = await Promise.resolve(params);
    console.log('PUT params object:', resolvedParams);
    const { id } = resolvedParams;
    console.log('Extracted ID from params:', id);
    const body = await request.json();
    const { homepageHtml } = body;

    if (!homepageHtml) {
      return Response.json({ error: 'Missing homepageHtml' }, { status: 400 });
    }

    console.log('Updating template ID:', id, 'HTML length:', homepageHtml.length);

    const success = await updateTemplateHtml(id, homepageHtml);

    if (!success) {
      console.error('Template not found for ID:', id);
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete template
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const success = await deleteTemplate(id);

    if (!success) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Set template as active
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const success = await setActiveTemplate(id);

    if (!success) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error setting active template:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

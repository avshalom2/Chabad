import { getAllTemplates, createTemplate, getActiveTemplate } from '@/lib/hp-templates.js';

export const dynamic = 'force-dynamic';

// GET - Fetch all templates and active template
export async function GET(request) {
  try {
    const templates = await getAllTemplates();
    const activeTemplate = await getActiveTemplate();
    
    return Response.json({
      templates,
      activeTemplate
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new template
export async function POST(request) {
  try {
    const body = await request.json();
    const { template_name, template_html } = body;

    if (!template_name || !template_html) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const templateId = await createTemplate({
      template_name,
      template_html,
      created_by: 1 // TODO: Get from authenticated session
    });

    return Response.json({ success: true, templateId }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

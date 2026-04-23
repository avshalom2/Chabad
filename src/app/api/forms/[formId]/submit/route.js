import { NextResponse } from 'next/server';
import { saveFormSubmission } from '@/lib/forms';

export async function POST(request, { params }) {
  try {
    const { formId } = await params;
    const body = await request.json();
    await saveFormSubmission(Number(formId), body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Form submission error:', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

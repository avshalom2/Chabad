'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import grapesjs from 'grapesjs';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';
import styles from './PageBuilder.module.css';

const PageBuilder = forwardRef(function PageBuilder({ initialHtml = '' }, ref) {
  const [editor, setEditor] = useState(null);
  const [forms, setForms] = useState([]);
  const [qnaSets, setQnaSets] = useState([]);
  const [selectionModal, setSelectionModal] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [imageModal, setImageModal] = useState(false);
  const [images, setImages] = useState([]);
  const [imageTarget, setImageTarget] = useState(null); // GrapesJS model to update
  const [templatePicker, setTemplatePicker] = useState(null); // { form, component }
  const [outlineMode, setOutlineMode] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [codeEditorValue, setCodeEditorValue] = useState('');

  useImperativeHandle(ref, () => ({
    getHtml: () => {
      if (!editor) return '';
      const css = editor.getCss();
      const html = editor.getHtml();
      return `<style>${css}</style>${html}`;
    },
  }), [editor]);

  // Load forms and Q&A sets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [formsRes, qnaRes] = await Promise.all([
          fetch('/api/admin/forms'),
          fetch('/api/admin/qna'),
        ]);
        const formsData = await formsRes.json();
        const qnaData = await qnaRes.json();
        setForms(Array.isArray(formsData) ? formsData : []);
        setQnaSets(Array.isArray(qnaData) ? qnaData : []);
      } catch (error) {
        console.error('Failed to load forms/Q&A:', error);
      }
    };
    loadData();
  }, []);

  // Initialize GrapesJS
  useEffect(() => {
    if (editor) return;

    // Create a temporary wrapper div with initial HTML
    const wrapper = document.createElement('div');
    if (initialHtml) {
      wrapper.innerHTML = initialHtml;
    } else {
      wrapper.innerHTML = `
        <div style="padding: 20px;">
          <h1>Page Title</h1>
          <p>Start building your page here...</p>
        </div>
      `;
    }

    const editorInstance = grapesjs.init({
      container: '#gjs',
      height: '800px',
      width: '100%',
      storageManager: false,
      components: wrapper.innerHTML,
      plugins: [grapesjsPresetWebpage],
      pluginsOpts: {
        [grapesjsPresetWebpage]: {},
      },
      codeViewerConfig: {
        editCode: false,
      },
      canvas: {
        styles: [
          // Force RTL inside the GrapesJS canvas iframe
          'data:text/css,body{direction:rtl;text-align:right;}',
        ],
      },
      panels: {
        defaults: [
          {
            id: 'layers',
            active: true,
            visible: true,
          },
          {
            id: 'options',
            active: true,
            visible: true,
            width: '250px',
          },
        ],
      },
    });

    setEditor(editorInstance);

    // Override open-code after GrapesJS fully loads (after preset plugin registers it)
    editorInstance.on('load', () => {
      editorInstance.Commands.add('open-code', {
        run(editor) {
          const openModal = () => {
            const existing = document.getElementById('gjs-custom-code-editor');
            if (existing) return;

            const modal = document.createElement('div');
            modal.id = 'gjs-custom-code-editor';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:10000;padding:20px;box-sizing:border-box;';

            const container = document.createElement('div');
            container.style.cssText = 'background:#2c2c2c;color:#fff;padding:20px;border-radius:8px;width:100%;max-width:1200px;height:90%;display:flex;flex-direction:column;';

            const header = document.createElement('div');
            header.style.cssText = 'margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;';
            header.innerHTML = '<h2 style="margin:0;">✏️ Edit HTML Code</h2>';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Close';
            closeBtn.style.cssText = 'padding:8px 16px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;';
            header.appendChild(closeBtn);

            const textarea = document.createElement('textarea');
            textarea.value = editor.getHtml();
            textarea.style.cssText = 'flex:1;padding:12px;background:#1e1e1e;color:#d4d4d4;border:1px solid #555;border-radius:4px;font-family:Courier New,monospace;font-size:13px;line-height:1.6;resize:none;margin-bottom:12px;';

            const saveBtn = document.createElement('button');
            saveBtn.textContent = '✔ Apply to Canvas';
            saveBtn.style.cssText = 'padding:10px 24px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;align-self:flex-start;';
            saveBtn.onclick = () => {
              try {
                editor.setComponents(textarea.value);
                document.body.removeChild(modal);
              } catch (err) {
                alert('Error: ' + err.message);
              }
            };

            const close = () => { if (modal.parentNode) document.body.removeChild(modal); };
            closeBtn.onclick = close;
            document.addEventListener('keydown', function esc(e) {
              if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
            });

            container.appendChild(header);
            container.appendChild(textarea);
            container.appendChild(saveBtn);
            modal.appendChild(container);
            document.body.appendChild(modal);
            textarea.focus();
          };

          openModal();
        },
      });
    });

    // Add link button to the Rich Text Editor
    editorInstance.RichTextEditor.add('link', {
      icon: '🔗',
      attributes: { title: 'Add Link' },
      result: (rte) => {
        const selected = rte.selection().toString();
        if (!selected) return;
        const url = prompt('Enter URL (e.g. /category/my-slug or https://example.com):', 'https://');
        if (url) rte.exec('createLink', url);
      },
    });

    editorInstance.RichTextEditor.add('unlink', {
      icon: '⛓️‍💥',
      attributes: { title: 'Remove Link' },
      result: (rte) => rte.exec('unlink'),
    });

    editorInstance.RichTextEditor.add('insertUnorderedList', {
      icon: '•',
      attributes: { title: 'Bullet List' },
      result: (rte) => rte.exec('insertUnorderedList'),
    });

    editorInstance.RichTextEditor.add('insertOrderedList', {
      icon: '1.',
      attributes: { title: 'Numbered List' },
      result: (rte) => rte.exec('insertOrderedList'),
    });

    // Cleanup
    return () => {
      // Don't destroy on unmount - keep the editor instance
    };
  }, [initialHtml]);

  // Register blocks after editor is created AND data is loaded
  useEffect(() => {
    if (!editor) return;

    // ── Simple Text Blocks ───────────────────────────────────────
    editor.BlockManager.add('text-h1', {
      label: 'H1 Heading',
      category: 'Text',
      content: '<h1>Heading 1</h1>',
    });

    editor.BlockManager.add('text-h2', {
      label: 'H2 Heading',
      category: 'Text',
      content: '<h2>Heading 2</h2>',
    });

    editor.BlockManager.add('text-h3', {
      label: 'H3 Heading',
      category: 'Text',
      content: '<h3>Heading 3</h3>',
    });

    editor.BlockManager.add('text-p', {
      label: 'Paragraph',
      category: 'Text',
      content: '<p>Add your text here</p>',
    });

    // Register custom form block
    editor.BlockManager.add('form-block', {
      label: '📋 Form',
      category: 'Custom',
      content: {
        type: 'form-component',
        attributes: { 'data-form-id': '', class: 'form-block' },
        style: { padding: '20px', border: '2px dashed #007bff', borderRadius: '8px', minHeight: '100px', backgroundColor: '#f0f7ff' },
        content: '<p style="color: #007bff; text-align: center; margin: 0;"><strong>📋 Form Block</strong></p>',
      },
    });

    editor.DomComponents.addType('form-component', {
      model: {
        defaults: {
          displayName: '📋 Form',
          tagName: 'div',
          draggable: true,
          droppable: false,
          editable: false,
          attributes: { 'data-form-id': '', class: 'form-block' },
          style: { padding: '20px', border: '2px dashed #007bff', borderRadius: '8px', minHeight: '100px', backgroundColor: '#f0f7ff' },
          content: '<p style="color: #007bff; text-align: center; margin: 0;"><strong>📋 Form Block - Double click to select</strong></p>',
        },
      },
      view: {
        events: {
          dblclick: 'openFormSelect',
        },
        openFormSelect() {
          setSelectedComponent(this.model);
          setSelectionModal({ type: 'form', items: forms });
        },
      },
    });

    // Register custom Q&A block
    editor.BlockManager.add('qna-block', {
      label: '❓ Q&A Set',
      category: 'Custom',
      content: {
        type: 'qna-component',
        attributes: { 'data-qna-id': '', class: 'qna-block' },
        style: { padding: '20px', border: '2px dashed #28a745', borderRadius: '8px', minHeight: '100px', backgroundColor: '#f0fff4' },
        content: '<p style="color: #28a745; text-align: center; margin: 0;"><strong>❓ Q&A Block</strong></p>',
      },
    });

    editor.DomComponents.addType('qna-component', {
      model: {
        defaults: {
          displayName: '❓ Q&A',
          tagName: 'div',
          draggable: true,
          droppable: false,
          editable: false,
          attributes: { 'data-qna-id': '', class: 'qna-block' },
          style: { padding: '20px', border: '2px dashed #28a745', borderRadius: '8px', minHeight: '100px', backgroundColor: '#f0fff4' },
          content: '<p style="color: #28a745; text-align: center; margin: 0;"><strong>❓ Q&A Block - Double click to select</strong></p>',
        },
      },
      view: {
        events: {
          dblclick: 'openQnaSelect',
        },
        openQnaSelect() {
          setSelectedComponent(this.model);
          setSelectionModal({ type: 'qna', items: qnaSets });
        },
      },
    });

    // Register Events block
    editor.BlockManager.add('events-block', {
      label: '📅 אירועים',
      category: 'Custom',
      content: {
        type: 'events-component',
        attributes: { 'data-chabadcomponent': 'events-box', class: 'events-block' },
        style: { padding: '20px', border: '2px dashed #d97706', borderRadius: '8px', minHeight: '120px', backgroundColor: '#fffbeb' },
        content: `<div style="text-align:center;color:#d97706;padding:16px;">
          <div style="font-size:2rem;margin-bottom:8px;">📅</div>
          <strong style="font-size:1rem;">בלוק אירועים קרובים</strong>
          <p style="margin:6px 0 0;font-size:0.85rem;color:#92400e;">יוצג כאן ברשימת האירועים הקרובים</p>
        </div>`,
      },
    });

    editor.DomComponents.addType('events-component', {
      model: {
        defaults: {
          displayName: 'EvntCtl',
          tagName: 'div',
          draggable: true,
          droppable: false,
          editable: false,
          selectable: false,
          attributes: { 'data-chabadcomponent': 'events-box', class: 'events-block' },
          style: { padding: '20px', border: '2px dashed #d97706', borderRadius: '8px', minHeight: '120px', backgroundColor: '#fffbeb' },
          content: `<div style="text-align:center;color:#d97706;padding:16px;">
            <div style="font-size:2rem;margin-bottom:8px;">📅</div>
            <strong style="font-size:1rem;">בלוק אירועים קרובים</strong>
            <p style="margin:6px 0 0;font-size:0.85rem;color:#92400e;">יוצג כאן ברשימת האירועים הקרובים</p>
          </div>`,
        },
      },
    });

    // Register Shabbat block
    editor.BlockManager.add('shabbat-block', {
      label: '🕯️ שבת ופרשה',
      category: 'Custom',
      content: {
        type: 'shabbat-component',
        attributes: { 'data-chabadcomponent': 'shabbat-box', class: 'shabbat-block' },
        style: { padding: '20px', border: '2px dashed #7c3aed', borderRadius: '8px', minHeight: '120px', backgroundColor: '#f5f3ff' },
        content: `<div style="text-align:center;color:#7c3aed;padding:16px;">
          <div style="font-size:2rem;margin-bottom:8px;">🕯️</div>
          <strong style="font-size:1rem;">פרשת השבוע וזמני שבת</strong>
          <p style="margin:6px 0 0;font-size:0.85rem;color:#5b21b6;">יוצגו כאן זמני כניסת שבת ופרשת השבוע</p>
        </div>`,
      },
    });

    editor.DomComponents.addType('shabbat-component', {
      model: {
        defaults: {
          displayName: '🕯️ Shabbat',
          tagName: 'div',
          draggable: true,
          droppable: false,
          editable: false,
          attributes: { 'data-chabadcomponent': 'shabbat-box', class: 'shabbat-block' },
          style: { padding: '20px', border: '2px dashed #7c3aed', borderRadius: '8px', minHeight: '120px', backgroundColor: '#f5f3ff' },
          content: `<div style="text-align:center;color:#7c3aed;padding:16px;">
            <div style="font-size:2rem;margin-bottom:8px;">🕯️</div>
            <strong style="font-size:1rem;">פרשת השבוע וזמני שבת</strong>
            <p style="margin:6px 0 0;font-size:0.85rem;color:#5b21b6;">יוצגו כאן זמני כניסת שבת ופרשת השבוע</p>
          </div>`,
        },
      },
    });

    // ── Grid / Layout blocks ──────────────────────────────────────
    // Register Weekly Prayers block
    editor.BlockManager.add('weekly-prayers-block', {
      label: 'Prayer Times',
      category: 'Custom',
      content: {
        type: 'weekly-prayers-component',
        attributes: { 'data-chabadcomponent': 'weekly-prayers-box', class: 'weekly-prayers-block' },
        style: { padding: '20px', border: '2px dashed #c8a04a', borderRadius: '8px', minHeight: '120px', backgroundColor: '#fffbeb' },
        content: `<div style="text-align:center;color:#9a6a00;padding:16px;">
          <div style="font-size:2rem;margin-bottom:8px;">🕐</div>
          <strong style="font-size:1rem;">Weekly Prayer Times</strong>
          <p style="margin:6px 0 0;font-size:0.85rem;color:#92400e;">Parasha, Shacharit, Mincha and Maariv times will render here</p>
        </div>`,
      },
    });

    editor.DomComponents.addType('weekly-prayers-component', {
      model: {
        defaults: {
          displayName: 'Prayer Times',
          tagName: 'div',
          draggable: true,
          droppable: false,
          editable: false,
          attributes: { 'data-chabadcomponent': 'weekly-prayers-box', class: 'weekly-prayers-block' },
          style: { padding: '20px', border: '2px dashed #c8a04a', borderRadius: '8px', minHeight: '120px', backgroundColor: '#fffbeb' },
          content: `<div style="text-align:center;color:#9a6a00;padding:16px;">
            <div style="font-size:2rem;margin-bottom:8px;">🕐</div>
            <strong style="font-size:1rem;">Weekly Prayer Times</strong>
            <p style="margin:6px 0 0;font-size:0.85rem;color:#92400e;">Parasha, Shacharit, Mincha and Maariv times will render here</p>
          </div>`,
        },
      },
    });

    // Register layout-column as a droppable component type
    editor.DomComponents.addType('layout-column', {
      model: {
        defaults: {
          displayName: 'Col',
          tagName: 'div',
          droppable: true,
          draggable: false,
          attributes: { 'data-layout-column': 'true' },
          style: {
            'min-height': '80px',
            padding: '12px',
            border: '1px dashed #cbd5e1',
            'box-sizing': 'border-box',
            position: 'relative',
          },
          content: '<p style="color:#94a3b8;font-size:12px;margin:0;pointer-events:none;">Drop here</p>',
        },
      },
    });

    // Helper: register a layout block with droppable columns
    const addLayoutBlock = (id, label, cols) => {
      const colWidth = Math.floor(100 / cols);
      const columnComponents = Array.from({ length: cols }, () => ({
        type: 'layout-column',
        style: { width: `${colWidth}%`, flex: '0 0 auto' },
      }));

      editor.BlockManager.add(id, {
        label,
        category: 'Layout',
        content: {
          type: 'div',
          tagName: 'div',
          style: {
            display: 'flex',
            'flex-wrap': 'wrap',
            gap: '0',
            width: '100%',
          },
          components: columnComponents,
        },
      });
    };

    addLayoutBlock('layout-1col', '⬜ 1 Column', 1);
    addLayoutBlock('layout-2col', '⬜⬜ 2 Columns', 2);
    addLayoutBlock('layout-3col', '⬜⬜⬜ 3 Columns', 3);
    addLayoutBlock('layout-4col', '⬜⬜⬜⬜ 4 Columns', 4);

    // 1/3 + 2/3 custom
    editor.BlockManager.add('layout-1-2', {
      label: '1/3 + 2/3',
      category: 'Layout',
      content: {
        type: 'div',
        tagName: 'div',
        style: { display: 'flex', 'flex-wrap': 'wrap', width: '100%' },
        components: [
          { type: 'layout-column', style: { width: '33%', flex: '0 0 auto' } },
          { type: 'layout-column', style: { width: '67%', flex: '0 0 auto' } },
        ],
      },
    });

    // 2/3 + 1/3 custom
    editor.BlockManager.add('layout-2-1', {
      label: '2/3 + 1/3',
      category: 'Layout',
      content: {
        type: 'div',
        tagName: 'div',
        style: { display: 'flex', 'flex-wrap': 'wrap', width: '100%' },
        components: [
          { type: 'layout-column', style: { width: '67%', flex: '0 0 auto' } },
          { type: 'layout-column', style: { width: '33%', flex: '0 0 auto' } },
        ],
      },
    });

    // Section (full-width container with padding)
    editor.BlockManager.add('layout-section', {
      label: '📦 Section',
      category: 'Layout',
      content: {
        tagName: 'section',
        droppable: true,
        style: {
          padding: '40px 20px',
          width: '100%',
          'box-sizing': 'border-box',
          'min-height': '100px',
          border: '1px dashed #cbd5e1',
        },
        content: '<p style="color:#94a3b8;font-size:12px;margin:0;pointer-events:none;">Drop content here</p>',
      },
    });

    // Register Image block
    editor.BlockManager.add('image-block', {
      label: '🖼️ Image',
      category: 'Basic',
      content: {
        type: 'image-picker',
        tagName: 'div',
        attributes: { 'data-image-picker': 'true' },
        style: {
          'min-height': '120px',
          'background-color': '#f3f4f6',
          border: '2px dashed #9ca3af',
          'border-radius': '8px',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          cursor: 'pointer',
          padding: '20px',
          'text-align': 'center',
        },
        content: '<p style="color:#9ca3af;margin:0;font-size:14px;">🖼️ Double-click to pick an image</p>',
      },
    });

    editor.DomComponents.addType('image-picker', {
      model: {
        defaults: {          displayName: '🖼️ Image',          tagName: 'div',
          draggable: true,
          droppable: false,
          attributes: { 'data-image-picker': 'true' },
          style: {
            'min-height': '120px',
            'background-color': '#f3f4f6',
            border: '2px dashed #9ca3af',
            'border-radius': '8px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            cursor: 'pointer',
            padding: '20px',
            'text-align': 'center',
          },
          content: '<p style="color:#9ca3af;margin:0;font-size:14px;">🖼️ Double-click to pick an image</p>',
        },
      },
      view: {
        events: { dblclick: 'openImagePicker' },
        openImagePicker() {
          setImageTarget(this.model);
          fetch('/api/admin/uploads')
            .then(r => r.json())
            .then(imgs => { setImages(imgs); setImageModal(true); })
            .catch(() => { setImages([]); setImageModal(true); });
        },
      },
    });

    // Register custom img element with editable traits (min-width, max-width, etc.)
    editor.DomComponents.addType('img', {
      model: {
        defaults: {
          displayName: 'Img',
          tagName: 'img',
          draggable: true,
          traits: [
            { name: 'src', label: 'SRC', type: 'text', changeProp: 1 },
            { name: 'alt', label: 'Alt', type: 'text', changeProp: 1 },
            { name: 'title', label: 'Title', type: 'text', changeProp: 1 },
            { name: 'width', label: 'Width', type: 'text', changeProp: 1 },
            { name: 'height', label: 'Height', type: 'text', changeProp: 1 },
          ],
        },
      },
    });

    // Allow editing of common size/spacing CSS properties for all components
    const tm = editor.TraitManager;
    tm.addType('customSelect', {
      createInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g., 100px, 50%, auto';
        return input;
      },
    });
  }, [editor, forms, qnaSets]);

  const buildFormHtml = (fullForm, templateStyle) => {
    const fieldsList = Array.isArray(fullForm.fields) ? fullForm.fields : [];

    const inputStyle = (tpl) => {
      if (tpl === 'professional') return 'width:100%;padding:10px 14px;border:2px solid #8b1a1a;border-radius:20px;font-size:14px;background:white;color:#333;box-sizing:border-box;outline:none;';
      if (tpl === 'minimal') return 'width:100%;padding:8px 0;border:none;border-bottom:2px solid #d1d5db;font-size:14px;background:transparent;color:#111;box-sizing:border-box;outline:none;';
      return 'width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;background:#f9fafb;color:#111827;box-sizing:border-box;outline:none;';
    };

    const labelStyle = (tpl) => {
      if (tpl === 'professional') return 'display:block;font-weight:700;font-size:13px;color:#5a1a1a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;';
      if (tpl === 'minimal') return 'display:block;font-weight:600;font-size:13px;color:#6b7280;margin-bottom:4px;';
      return 'display:block;font-weight:600;font-size:14px;color:#374151;margin-bottom:6px;';
    };

    const fieldsHtml = fieldsList.map(field => `
      <div style="margin-bottom:16px;">
        <label style="${labelStyle(templateStyle)}">${field.label || field.name || 'Field'}${field.required ? ' <span style="color:#dc2626;">*</span>' : ''}</label>
        <input type="${field.type || 'text'}" placeholder="${field.placeholder || ''}" style="${inputStyle(templateStyle)}" />
      </div>
    `).join('');

    if (templateStyle === 'professional') {
      return `<div style="background:linear-gradient(135deg,#fdf6f0 0%,#fff8f5 100%);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(139,26,26,0.12);font-family:inherit;">
        <div style="background:linear-gradient(135deg,#6b1a1a 0%,#8b2020 100%);padding:24px 28px;">
          <h3 style="margin:0;font-size:22px;font-weight:800;color:white;text-align:center;">${fullForm.name}</h3>
        </div>
        <div style="padding:28px;">
          ${fieldsHtml || '<p style="color:#888;">No fields in this form</p>'}
          <button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#e07b00,#f59e0b);color:white;border:none;border-radius:25px;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px;letter-spacing:0.03em;">שלח ✈</button>
        </div>
      </div>`;
    }

    if (templateStyle === 'minimal') {
      return `<div style="background:white;border-radius:4px;padding:32px;max-width:600px;margin:0 auto;font-family:inherit;">
        <h3 style="margin:0 0 28px;font-size:20px;font-weight:700;color:#111827;border-bottom:3px solid #111827;padding-bottom:12px;">${fullForm.name}</h3>
        ${fieldsHtml || '<p style="color:#888;">No fields in this form</p>'}
        <button type="submit" style="margin-top:8px;padding:12px 32px;background:#111827;color:white;border:none;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.05em;text-transform:uppercase;">Submit</button>
      </div>`;
    }

    if (templateStyle === 'columns') {
      // Split: textareas stay full-width, short inputs go into rows of 3
      const inputBase = 'width:100%;padding:10px 14px;border:2px solid #8b1a1a;border-radius:20px;font-size:14px;background:white;color:#333;box-sizing:border-box;outline:none;text-align:right;';
      const shortFields = [];
      let rowsHtml = '';
      fieldsList.forEach((field, i) => {
        const isLong = (field.type === 'textarea') || (field.placeholder && field.placeholder.length > 30);
        if (isLong) {
          // flush pending short fields first
          if (shortFields.length) {
            const cols = shortFields.length <= 2 ? shortFields.length : 3;
            rowsHtml += `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;margin-bottom:12px;">${shortFields.splice(0).map(f => `<input type="${f.type||'text'}" placeholder="${f.placeholder||f.label||f.name||''}" style="${inputBase}" />`).join('')}</div>`;
          }
          rowsHtml += `<textarea placeholder="${field.placeholder||field.label||field.name||''}" rows="3" style="${inputBase}border-radius:12px;width:100%;resize:vertical;margin-bottom:12px;"></textarea>`;
        } else {
          shortFields.push(field);
          if (shortFields.length === 3 || i === fieldsList.length - 1) {
            const cols = shortFields.length;
            rowsHtml += `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;margin-bottom:12px;">${shortFields.splice(0).map(f => `<input type="${f.type||'text'}" placeholder="${f.placeholder||f.label||f.name||''}" style="${inputBase}" />`).join('')}</div>`;
          }
        }
      });
      if (shortFields.length) {
        const cols = shortFields.length;
        rowsHtml += `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;margin-bottom:12px;">${shortFields.map(f => `<input type="${f.type||'text'}" placeholder="${f.placeholder||f.label||f.name||''}" style="${inputBase}" />`).join('')}</div>`;
      }
      return `<div style="background:linear-gradient(135deg,#faf5f0 0%,#f5ede6 100%);border-radius:20px;padding:36px 32px;font-family:inherit;box-shadow:0 6px 28px rgba(139,26,26,0.1);">
        <div style="text-align:center;margin-bottom:28px;">
          <span style="display:inline-block;background:linear-gradient(135deg,#6b1a1a,#8b2020);color:white;padding:10px 28px;border-radius:30px;font-size:20px;font-weight:800;">${fullForm.name}</span>
        </div>
        ${rowsHtml || '<p style="color:#888;">No fields in this form</p>'}
        <div style="text-align:center;margin-top:16px;">
          <button type="submit" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#e07b00,#f59e0b);color:white;border:none;border-radius:25px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:0.04em;">&#x2708; שליחה</button>
        </div>
      </div>`;
    }

    // Default: clean card
    return `<div style="background:white;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.1);overflow:hidden;font-family:inherit;">
      <div style="background:#1e40af;padding:20px 24px;">
        <h3 style="margin:0;font-size:20px;font-weight:700;color:white;">${fullForm.name}</h3>
      </div>
      <div style="padding:28px;">
        ${fieldsHtml || '<p style="color:#888;">No fields in this form</p>'}
        <button type="submit" style="width:100%;padding:13px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:4px;">Submit</button>
      </div>
    </div>`;
  };

  const handleApplyFormTemplate = (templateStyle) => {
    if (!templatePicker) return;
    const { form: fullForm, component } = templatePicker;
    const formHtml = buildFormHtml(fullForm, templateStyle);
    component.set('content', formHtml);
    component.setAttributes({ 'data-form-id': String(fullForm.id) });
    setTemplatePicker(null);
  };

  const handleSelectItem = async (item) => {
    if (!selectedComponent) return;

    if (selectionModal.type === 'form') {
      let fullForm = item;
      try {
        const res = await fetch(`/api/admin/forms/${item.id}`);
        if (res.ok) fullForm = await res.json();
      } catch (e) { /* use basic item */ }

      const component = selectedComponent;
      setSelectionModal(null);
      setSelectedComponent(null);
      setTemplatePicker({ form: fullForm, component });
      return;

    } else if (selectionModal.type === 'qna') {
      // Fetch full Q&A set with items
      let fullSet = item;
      try {
        const res = await fetch(`/api/admin/qna/${item.id}`);
        if (res.ok) fullSet = await res.json();
      } catch (e) { /* use basic item */ }

      const itemsList = fullSet.items || [];
      const questionsHtml = itemsList.map((q, idx) => `
        <div style="margin-bottom: 12px; padding: 12px; background: white; border-left: 3px solid #28a745; border-radius: 4px;">
          <strong style="color: #111827; display: block; margin-bottom: 6px;">Q${idx + 1}: ${q.question}</strong>
          <p style="color: #565656; margin: 0; font-size: 14px;">A: ${q.answer}</p>
        </div>
      `).join('');

      const qnaHtml = `<div style="padding: 15px; background: #f0fff4; border: 1px solid #28a745; border-radius: 8px;">
          <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 16px;">${fullSet.name}</h3>
          ${questionsHtml || '<p style="color: #666;">No questions in this set</p>'}
        </div>`;
      selectedComponent.set('content', qnaHtml);
      selectedComponent.setAttributes({ 'data-qna-id': String(item.id) });
    }

    setSelectionModal(null);
    setSelectedComponent(null);
  };

  const handleSelectImage = (img) => {
    if (imageTarget) {
      // Clear existing content and append img as an editable component
      imageTarget.components().reset();
      
      const imgComponent = {
        type: 'img',
        attributes: {
          src: img.src,
          alt: img.name,
        },
        style: {
          'max-width': '100%',
          height: 'auto',
          display: 'block',
        },
      };
      
      imageTarget.append(imgComponent);
      imageTarget.setStyle({
        'min-height': 'auto',
        'background-color': 'transparent',
        border: 'none',
        padding: '0',
        display: 'block',
      });
    }
    setImageModal(false);
    setImageTarget(null);
  };

  function toggleOutlineMode() {
    if (!editor) return;
    const frameDoc = editor.Canvas.getFrameEl()?.contentDocument;
    if (!frameDoc) return;
    const existing = frameDoc.getElementById('gjs-outline-style');
    if (existing) {
      existing.remove();
      setOutlineMode(false);
    } else {
      const style = frameDoc.createElement('style');
      style.id = 'gjs-outline-style';
      style.innerHTML = `
        div, section, article, header, footer, main, aside, nav {
          outline: 1px dashed rgba(99, 102, 241, 0.5) !important;
        }
        div:hover, section:hover {
          outline: 1px solid rgba(99, 102, 241, 0.9) !important;
          background-color: rgba(99, 102, 241, 0.03) !important;
        }
      `;
      frameDoc.head.appendChild(style);
      setOutlineMode(true);
    }
  }

  return (
    <div className={styles.container}>
      <div style={{ padding: '8px 12px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={toggleOutlineMode}
          style={{
            padding: '5px 14px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #6366f1',
            background: outlineMode ? '#6366f1' : 'white',
            color: outlineMode ? 'white' : '#6366f1',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {outlineMode ? '🔵 Hide Structure' : '⬜ Show Structure'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (editor) {
              const css = editor.getCss();
              const html = editor.getHtml();
              setCodeEditorValue(`<style>${css}</style>${html}`);
              setCodeEditorOpen(true);
            }
          }}
          style={{
            padding: '5px 14px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #0ea5e9',
            background: 'white',
            color: '#0ea5e9',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          &lt; / &gt; Edit HTML
        </button>
      </div>

      {/* Code Editor Modal */}
      {codeEditorOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 10000, padding: '20px', boxSizing: 'border-box',
        }}>
          <div style={{
            background: '#2c2c2c', borderRadius: '8px', padding: '20px',
            width: '100%', maxWidth: '1100px', height: '90%',
            display: 'flex', flexDirection: 'column', direction: 'ltr',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>✏️ Edit HTML Code</h2>
              <button
                onClick={() => setCodeEditorOpen(false)}
                style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✕ סגור
              </button>
            </div>
            <textarea
              value={codeEditorValue}
              onChange={e => setCodeEditorValue(e.target.value)}
              style={{
                flex: 1, padding: '12px', background: '#1e1e1e', color: '#d4d4d4',
                border: '1px solid #555', borderRadius: '4px',
                fontFamily: 'Courier New, monospace', fontSize: '13px',
                lineHeight: '1.6', resize: 'none', marginBottom: '12px',
              }}
            />
            <button
              onClick={() => {
                try {
                  // Extract CSS and HTML from the code
                  const styleMatch = codeEditorValue.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                  const css = styleMatch ? styleMatch[1] : '';
                  const html = codeEditorValue.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '');
                  
                  // Update both CSS and HTML
                  if (css) {
                    editor.setStyle(css);
                  }
                  editor.setComponents(html);
                  setCodeEditorOpen(false);
                } catch (err) {
                  alert('שגיאה: ' + err.message);
                }
              }}
              style={{
                padding: '10px 24px', background: '#28a745', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 'bold', alignSelf: 'flex-start',
              }}
            >
              ✔ עדכן את העורך
            </button>
          </div>
        </div>
      )}
      <div className={styles.editorWrapper}>
        <div id="gjs" />
      </div>

      {/* Selection Modal */}
      {selectionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px' }}>
              Select {selectionModal.type === 'form' ? 'Form' : 'Q&A Set'}
            </h2>
            
            {selectionModal.items.length === 0 ? (
              <p style={{ color: '#666', padding: '20px 0' }}>
                No {selectionModal.type === 'form' ? 'forms' : 'Q&A sets'} created yet.
              </p>
            ) : (
              <div>
                {selectionModal.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      marginBottom: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = selectionModal.type === 'form' ? '#e0f2ff' : '#ecfdf5';
                      e.target.style.borderColor = selectionModal.type === 'form' ? '#007bff' : '#28a745';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      ID: {item.id}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setSelectionModal(null)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      {imageModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '8px', padding: '24px',
            maxWidth: '700px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#111827' }}>Pick an Image</h2>
            {images.length === 0 ? (
              <p style={{ color: '#666' }}>No images uploaded yet. Upload images via the Image Upload field in any article.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {images.map((img) => (
                  <div
                    key={img.src}
                    onClick={() => handleSelectImage(img)}
                    style={{
                      cursor: 'pointer', border: '2px solid #e5e7eb', borderRadius: '6px',
                      overflow: 'hidden', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#007bff'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <img src={img.src} alt={img.name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setImageModal(false)}
              style={{
                marginTop: '20px', width: '100%', padding: '10px',
                backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Form Template Picker Modal */}
      {templatePicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '28px',
            maxWidth: '680px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', color: '#111827' }}>Choose a Form Style</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>
              Select how &ldquo;{templatePicker.form.name}&rdquo; should look on the page
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { key: 'card', label: 'Clean Card', color: '#1e40af', desc: 'Blue header, white card' },
                { key: 'professional', label: 'Professional', color: '#6b1a1a', desc: 'Gradient header, bordered' },
                { key: 'minimal', label: 'Minimal', color: '#111827', desc: 'Clean lines, no background' },
                { key: 'columns', label: 'Smart Columns', color: '#8b2020', desc: 'Grouped fields, centered title & button' },
              ].map(tpl => (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => handleApplyFormTemplate(tpl.key)}
                  style={{
                    border: '2px solid #e5e7eb', borderRadius: '10px', padding: '16px 12px',
                    cursor: 'pointer', background: 'white', textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.background = '#f8faff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}
                >
                  <div style={{ width: '100%', height: '8px', background: tpl.color, borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ height: '28px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '6px' }} />
                  {tpl.key === 'columns' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                      <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '3px' }} />
                      <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '3px' }} />
                      <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '3px' }} />
                      <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '3px' }} />
                    </div>
                  ) : (
                    <div style={{ height: '28px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} />
                  )}
                  <div style={{ height: '22px', background: tpl.color, borderRadius: '4px', opacity: 0.7, width: tpl.key === 'columns' ? '60%' : '100%', margin: '0 auto' }} />
                  <div style={{ marginTop: '10px', fontWeight: '700', fontSize: '13px', color: '#111827' }}>{tpl.label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{tpl.desc}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTemplatePicker(null)}
              style={{
                width: '100%', padding: '10px', backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb', borderRadius: '8px',
                cursor: 'pointer', fontSize: '14px', color: '#374151',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default PageBuilder;

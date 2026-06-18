'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { mergeAttributes, Node } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import styles from './ArticleBodyEditor.module.css';

const EMPTY_CONTENT = '<p></p>';

const ArticleBox = Node.create({
  name: 'articleBox',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      class: {
        default: 'article-content-box',
        parseHTML: (element) => element.getAttribute('class') || 'article-content-box',
        renderHTML: (attributes) => ({
          class: String(attributes.class || '')
            .split(/\s+/)
            .filter(Boolean)
            .includes('article-content-box')
            ? attributes.class
            : `article-content-box ${attributes.class || ''}`.trim(),
        }),
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.article-content-box' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'article-content-box' }), 0];
  },
});

function isMeaningfulHtml(html) {
  if (!html) return false;
  const withoutTags = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  const hasMediaOrLayout = /<(img|iframe|video|audio|table|section|article|div|style|html|body)\b/i.test(html);
  return withoutTags.length > 0 || hasMediaOrLayout;
}

function buildPreviewDocument(html) {
  const source = html || '';
  if (/<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(source)) {
    return source;
  }

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      direction: rtl;
      background: #ffffff;
      color: #222222;
      font-family: Arial, sans-serif;
    }
    body {
      padding: 24px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${source}
</body>
</html>`;
}

function cleanVisualEditorHtml(html) {
  const source = html || '';

  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return source.replace(/<p(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  }

  const document = new window.DOMParser().parseFromString(`<main>${source}</main>`, 'text/html');
  document.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent.replace(/\u00a0/g, ' ').trim();
    const hasVisibleElement = paragraph.querySelector('img, iframe, video, audio, table, hr, input, button, svg');

    if (!text && !hasVisibleElement) {
      paragraph.remove();
    }
  });

  return document.body.firstElementChild?.innerHTML || '';
}

const ArticleBodyEditor = forwardRef(function ArticleBodyEditor(
  { initialHtml = '', storageKey = 'article-body-draft', disabled = false, freeHtml = false },
  ref
) {
  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);
  const previousFreeHtmlRef = useRef(freeHtml);
  const [sourceHtml, setSourceHtml] = useState(initialHtml || EMPTY_CONTENT);
  const [htmlDraft, setHtmlDraft] = useState(initialHtml || EMPTY_CONTENT);
  const [directHtml, setDirectHtml] = useState(null);
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [freeHtmlView, setFreeHtmlView] = useState('preview');
  const [uploading, setUploading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const [error, setError] = useState('');

  function scheduleDraftSave(nextHtml) {
    setSaveState('unsaved');
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, nextHtml);
        setSaveState('draft');
      } catch (err) {
        setSaveState('unsaved');
      }
    }, 700);
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'article-inline-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ArticleBox,
    ],
    content: initialHtml || EMPTY_CONTENT,
    editorProps: {
      attributes: {
        class: styles.editor,
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      const nextHtml = activeEditor.getHTML();
      setDirectHtml(null);
      setSourceHtml(nextHtml);
      scheduleDraftSave(nextHtml);
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getHtml: () => {
        if (freeHtml) return htmlDraft;
        if (directHtml !== null) return directHtml;

        return cleanVisualEditorHtml(sourceHtml ?? editor?.getHTML() ?? initialHtml ?? '');
      },
      clearDraft: () => {
        try {
          window.localStorage.removeItem(storageKey);
        } catch (err) {
          // Ignore localStorage failures.
        }
        setSaveState('saved');
        setDirectHtml(null);
      },
    }),
    [directHtml, editor, freeHtml, htmlDraft, initialHtml, sourceHtml, storageKey]
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    try {
      const draft = window.localStorage.getItem(storageKey);
      if (draft && !isMeaningfulHtml(draft)) {
        window.localStorage.removeItem(storageKey);
      } else if (draft && draft !== initialHtml) {
        setSourceHtml(draft);
        setHtmlDraft(initialHtml || EMPTY_CONTENT);
        editor.commands.setContent(draft, false);
        setDraftRestored(true);
        setSaveState('draft');
        return;
      }
    } catch (err) {
      // Ignore localStorage failures.
    }

    const loadedHtml = initialHtml || EMPTY_CONTENT;
    setSourceHtml(loadedHtml);
    setHtmlDraft(loadedHtml);
    setDirectHtml(null);
    editor.commands.setContent(loadedHtml, false);
    setDraftRestored(false);
    setSaveState('saved');
  }, [editor, initialHtml, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (saveState !== 'unsaved') return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);

  useEffect(() => {
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);

  useEffect(() => {
    if (freeHtml && !previousFreeHtmlRef.current) {
      const dbHtml = initialHtml || EMPTY_CONTENT;
      setHtmlDraft(dbHtml);
      setSourceHtml(dbHtml);
      setFreeHtmlView('preview');
    }
    previousFreeHtmlRef.current = freeHtml;
  }, [freeHtml, initialHtml]);

  function setLink() {
    if (!editor || disabled) return;

    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter link URL', previousUrl);
    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function openHtmlEditor() {
    setHtmlDraft(initialHtml || EMPTY_CONTENT);
    setHtmlEditorOpen(true);
  }

  function openHtmlPreview() {
    if (!isMeaningfulHtml(htmlDraft)) {
      setHtmlDraft(initialHtml || EMPTY_CONTENT);
    }
    setHtmlPreviewOpen(true);
  }

  function updateBodyFromHtmlDraft() {
    const nextHtml = htmlDraft || EMPTY_CONTENT;
    setDirectHtml(nextHtml);
    setSourceHtml(nextHtml);
    setSaveState('unsaved');
    setHtmlPreviewOpen(false);
  }

  function discardLocalDraft() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (err) {
      // Ignore localStorage failures.
    }

    const savedHtml = initialHtml || EMPTY_CONTENT;
    setSourceHtml(savedHtml);
    setHtmlDraft(savedHtml);
    setDirectHtml(null);
    editor?.commands.setContent(savedHtml, false);
    setDraftRestored(false);
    setSaveState('saved');
  }

  async function uploadImage(file) {
    if (!file || !editor || disabled) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Image upload failed');
        return;
      }

      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!editor) {
    return <div className={styles.loading}>Loading editor...</div>;
  }

  const statusText = {
    saved: 'Saved',
    unsaved: 'Unsaved changes',
    draft: 'Draft saved on this computer',
  }[saveState];

  if (freeHtml) {
    return (
      <section className={styles.shell} aria-label="Free HTML article body editor">
        <div className={styles.controls}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Free HTML body</h2>
              <p className={styles.subtitle}>Preview the raw HTML by default, or switch to code to paste a full custom layout.</p>
            </div>
            <span className={`${styles.status} ${styles[saveState]}`}>{statusText}</span>
          </div>

          <div className={styles.toolbar} aria-label="Free HTML toolbar">
            <button
              type="button"
              onClick={() => setFreeHtmlView('preview')}
              className={freeHtmlView === 'preview' ? styles.active : ''}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setFreeHtmlView('code')}
              className={freeHtmlView === 'code' ? styles.active : ''}
              disabled={disabled}
            >
              Code
            </button>
          </div>
        </div>

        {freeHtmlView === 'code' ? (
          <textarea
            className={styles.htmlEditor}
            value={htmlDraft}
            onChange={(event) => {
              const nextHtml = event.target.value;
              setHtmlDraft(nextHtml);
              setSourceHtml(nextHtml);
              scheduleDraftSave(nextHtml);
            }}
            disabled={disabled}
            spellCheck={false}
            dir="ltr"
          />
        ) : (
          <iframe
            title="Free HTML preview"
            className={styles.inlinePreview}
            srcDoc={buildPreviewDocument(htmlDraft || EMPTY_CONTENT)}
          />
        )}
      </section>
    );
  }

  return (
    <section className={styles.shell} aria-label="Article body editor">
      <div className={styles.controls}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Article body</h2>
            <p className={styles.subtitle}>Write the article text and insert images inside the body.</p>
          </div>
          <span className={`${styles.status} ${styles[saveState]}`}>{statusText}</span>
        </div>

        {draftRestored && (
          <div className={styles.notice}>
            <span>A local draft was restored. Saving the article will make it permanent.</span>
            <button type="button" onClick={discardLocalDraft} disabled={disabled}>
              Use saved content
            </button>
          </div>
        )}

        <div className={styles.toolbar} aria-label="Formatting toolbar">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
            disabled={disabled}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}
            disabled={disabled}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? styles.active : ''}
            disabled={disabled}
          >
            Text
          </button>
          <span className={styles.separator} />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.active : ''}
            disabled={disabled}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.active : ''}
            disabled={disabled}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? styles.active : ''}
            disabled={disabled}
          >
            U
          </button>
          <button
            type="button"
            onClick={setLink}
            className={editor.isActive('link') ? styles.active : ''}
            disabled={disabled}
          >
            Link
          </button>
          <span className={styles.separator} />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.active : ''}
            disabled={disabled}
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.active : ''}
            disabled={disabled}
          >
            Numbers
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? styles.active : ''}
            disabled={disabled}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleWrap('articleBox').run()}
            className={editor.isActive('articleBox') ? styles.active : ''}
            disabled={disabled}
          >
            Box
          </button>
          <span className={styles.separator} />
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={disabled}>
            Right
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={disabled}>
            Center
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={disabled}>
            Left
          </button>
          <span className={styles.separator} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading}>
            {uploading ? 'Uploading...' : 'Image'}
          </button>
          <button type="button" onClick={openHtmlEditor} disabled={disabled}>
            Edit HTML
          </button>
          <button type="button" onClick={openHtmlPreview}>
            HTML Preview
          </button>
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(event) => uploadImage(event.target.files?.[0])}
            disabled={disabled || uploading}
          />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <EditorContent editor={editor} className={styles.content} />

      {htmlEditorOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.htmlModal}>
            <div className={styles.modalHeader}>
              <h3>Edit HTML</h3>
              <button type="button" onClick={() => setHtmlEditorOpen(false)}>
                Close
              </button>
            </div>
            <textarea
              className={styles.htmlEditor}
              value={htmlDraft}
              onChange={(event) => setHtmlDraft(event.target.value)}
              spellCheck={false}
              dir="ltr"
            />
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setHtmlEditorOpen(false)} className={styles.secondaryButton}>
                Close
              </button>
              <button type="button" onClick={openHtmlPreview} className={styles.primaryButton}>
                Preview HTML
              </button>
            </div>
          </div>
        </div>
      )}

      {htmlPreviewOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.previewModal}>
            <div className={styles.modalHeader}>
              <h3>HTML Preview</h3>
              <div className={styles.modalHeaderActions}>
                <button type="button" onClick={updateBodyFromHtmlDraft} className={styles.primaryButton}>
                  Update article body
                </button>
                <button type="button" onClick={() => setHtmlPreviewOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <iframe
              title="Article HTML preview"
              className={styles.preview}
              srcDoc={buildPreviewDocument(htmlDraft || initialHtml || EMPTY_CONTENT)}
            />
          </div>
        </div>
      )}
    </section>
  );
});

export default ArticleBodyEditor;

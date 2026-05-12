'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TemplateEditor.module.css';
import ImageDataEditor from './editors/ImageDataEditor';
import HtmlDataEditor from './editors/HtmlDataEditor';
import ControlDataEditor from './editors/ControlDataEditor';
import NewsControlEditor from './editors/NewsControlEditor';
import BannerSlotControlEditor from './editors/BannerSlotControlEditor';
import ArticlesSliderEditor from './editors/ArticlesSliderEditor';
import ArticlesCubeEditor from './editors/ArticlesCubeEditor';

const editorTypeOptions = [
  { value: 'HTML_DATA', label: 'HTML content' },
  { value: 'IMAGE_DATA', label: 'Image' },
  { value: 'CONTROL_DATA', label: 'Control: Shabbat / Events / Prayer Times' },
  { value: 'CONTROL_BANNER', label: 'Banner slot' },
  { value: 'NEWS_CONTROL', label: 'News control' },
  { value: 'ARTICLES_SLIDER', label: 'Articles slider' },
  { value: 'ARTICLES_CUBE', label: 'Articles Cube' },
];

export default function TemplateEditor({ templateId, initialHtml }) {
  const router = useRouter();
  const [html, setHtml] = useState(initialHtml);
  const [lastSavedHtml, setLastSavedHtml] = useState(initialHtml);
  const [webviewMode, setWebviewMode] = useState(false);
  const [editingElementHtml, setEditingElementHtml] = useState(null); // Store the HTML string, not the element
  const [editingElementIndex, setEditingElementIndex] = useState(null); // Store which content-placeholder was edited
  const [editingDataTypeIndex, setEditingDataTypeIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorType, setEditorType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  const [bannerSlots, setBannerSlots] = useState({});
  const containerRef = useRef(null); // Reference to the preview container
  const clearFnRef = useRef(null); // Stable ref to clearPlaceholderContent for DOM event handlers
  const handleEditClickRef = useRef(null); // Ref to handleEditClick function

  // Fetch all banner slots for preview display
  useEffect(() => {
    const fetchBannerSlots = async () => {
      try {
        const response = await fetch('/api/admin/banner-slots');
        if (response.ok) {
          const data = await response.json();
          // API returns an array directly
          const slots = Array.isArray(data) ? data : (data.slots || []);
          const slotMap = {};
          slots.forEach(slot => {
            slotMap[slot.id] = {
              name: slot.name,
              location: slot.location,
              banners: slot.banners || [],
            };
          });
          setBannerSlots(slotMap);
        }
      } catch (error) {
        console.error('Error fetching banner slots:', error);
      }
    };
    fetchBannerSlots();
  }, []);

  useEffect(() => {
    if (initialHtml) {
      setHtml(initialHtml);
      setLastSavedHtml(initialHtml);
    }
  }, [initialHtml]);

  // Clear the content inside a content-placeholder at a given index
  const clearPlaceholderContent = (index) => {
    setHtml(prevHtml => {
      const regex = /<div\s+class="content-placeholder"[^>]*>/g;
      let match;
      let occurrenceIndex = 0;

      while ((match = regex.exec(prevHtml)) !== null) {
        if (occurrenceIndex === index) {
          const contentStart = match.index + match[0].length;
          let nestLevel = 1;
          let i = contentStart;

          while (i < prevHtml.length && nestLevel > 0) {
            if (prevHtml.substring(i, i + 4) === '<div') {
              let j = i;
              while (j < prevHtml.length && prevHtml[j] !== '>') j++;
              if (prevHtml[i + 4] === ' ' || prevHtml[i + 4] === '>') nestLevel++;
              i = j + 1;
            } else if (prevHtml.substring(i, i + 6) === '</div>') {
              nestLevel--;
              if (nestLevel === 0) {
                return prevHtml.substring(0, contentStart) + prevHtml.substring(i);
              }
              i += 6;
            } else {
              i++;
            }
          }
          break;
        }
        occurrenceIndex++;
      }
      return prevHtml;
    });
  };

  // Keep ref in sync so DOM event handlers always call the latest version
  useEffect(() => {
    clearFnRef.current = clearPlaceholderContent;
  });

  // Update handleEditClick ref so banner preview click handlers can use it
  useEffect(() => {
    handleEditClickRef.current = handleEditClick;
  });

  // Inject hover delete buttons into non-empty content-placeholders
  useEffect(() => {
    if (!containerRef.current || webviewMode) return;

    // Remove any previously injected buttons first
    containerRef.current.querySelectorAll('.cp-delete-btn').forEach(btn => btn.remove());

    const placeholders = containerRef.current.querySelectorAll('.content-placeholder');
    placeholders.forEach((el, index) => {
      // Check if placeholder has any content (text nodes, elements, etc)
      if (!el.innerHTML || !el.innerHTML.trim()) return;

      el.style.position = 'relative';

      // Add click handler to banner preview divs inside this placeholder
      const bannerPreview = el.querySelector('.template-banner-slot-preview');
      if (bannerPreview) {
        bannerPreview.style.cursor = 'pointer';
        bannerPreview.addEventListener('click', (e) => {
          e.stopPropagation();
          handleEditClickRef.current?.(e);
        });
      }

      const btn = document.createElement('button');
      btn.className = 'cp-delete-btn';
      btn.innerHTML = '✕';
      btn.title = 'Remove content';
      Object.assign(btn.style, {
        position: 'absolute',
        top: '6px',
        left: '6px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#c62828',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: '200',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        transition: 'background 0.2s',
      });

      el.addEventListener('mouseenter', () => { btn.style.display = 'flex'; });
      el.addEventListener('mouseleave', () => { btn.style.display = 'none'; });
      btn.addEventListener('mouseenter', () => { btn.style.background = '#b71c1c'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = '#c62828'; });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearFnRef.current?.(index);
      });

      el.appendChild(btn);
    });
  }, [html, webviewMode]);

  // Parse HTML and find all data-type divs
  const getDataTypeDivs = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const divs = doc.querySelectorAll('[data-type]');
    return Array.from(divs);
  };

  // Process banner slot tags and convert them to visual boxes for preview
  const processPreviewHtml = (htmlString) => {
    const bannerSlotRegex = /<banner_slot\s+id=["'](\d+)["']\s*\/?>/gi;
    
    return htmlString.replace(bannerSlotRegex, (match, slotId) => {
      const slot = bannerSlots[slotId];
      const slotName = slot ? slot.name : `Banner Slot #${slotId}`;
      const location = slot ? slot.location : 'Unknown';
      const bannerCount = slot ? slot.banners.length : 0;
      
      return `<div class="template-banner-slot-preview" data-slot-id="${slotId}" style="
        border: 2px dashed #8B5A8E;
        border-radius: 4px;
        padding: 16px;
        margin: 12px 0;
        background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        <div style="text-align: center; width: 100%;">
          <div style="font-weight: 600; color: #6b1020; font-size: 16px; margin-bottom: 8px;">🎬 ${slotName}</div>
          <div style="font-size: 12px; color: #555; display: flex; justify-content: center; gap: 16px;">
            <span>📍 ${location}</span>
            <span>🖼️ ${bannerCount} banner${bannerCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>`;
    });
  };

  // Handle edit button click
  const handleEditClick = (e) => {
    console.log('Edit click detected on element:', e.target);
    
    // Try to find data-type attribute first (old format)
    let element = e.target.closest('[data-type]');
    let dataTypeAttr = null;
    setEditingDataTypeIndex(null);
    
    if (element) {
      dataTypeAttr = element.getAttribute('data-type');
      const dataTypeElements = containerRef.current?.querySelectorAll('[data-type]') || [];
      setEditingDataTypeIndex(Array.from(dataTypeElements).indexOf(element));
      console.log('Found data-type element:', dataTypeAttr);
      
      // Check if this data-type element contains a content-placeholder
      const contentPlaceholder = element.querySelector('.content-placeholder');
      if (contentPlaceholder) {
        // Use the inner content-placeholder and the data-type attribute
        element = contentPlaceholder;
        console.log('Using inner content-placeholder with data-type:', dataTypeAttr);
      }
    }
    
    // If no element yet, try to find content-placeholder (new format)
    // Keep going up until we find it, even if clicking deep inside
    if (!element) {
      let current = e.target;
      while (current && current !== document.body) {
        if (current.classList && current.classList.contains('content-placeholder')) {
          element = current;
          break;
        }
        current = current.parentElement;
      }
    }
    
    if (element && element.classList.contains('content-placeholder')) {
      // Find the index of this element among all content-placeholders
      const allPlaceholders = containerRef.current?.querySelectorAll('.content-placeholder') || [];
      const elementIndex = Array.from(allPlaceholders).indexOf(element);
      
      // Determine the type: use data-type attribute if available, otherwise infer from content
      let dataType = dataTypeAttr;
      
      if (!dataType) {
        const innerHtml = element.innerHTML.toLowerCase();
        dataType = 'HTML_DATA'; // default
        
        if (innerHtml.includes('newsbox')) {
          dataType = 'NEWS_CONTROL';
        } else if (innerHtml.includes('eventsbox') || innerHtml.includes('shabbatbox') || innerHtml.includes('weeklyprayersbox')) {
          dataType = 'CONTROL_DATA';
        } else if (innerHtml.includes('articlescube')) {
          dataType = 'ARTICLES_CUBE';
        } else if (innerHtml.includes('articlesslider')) {
          dataType = 'ARTICLES_SLIDER';
        } else if (innerHtml.includes('<img')) {
          dataType = 'IMAGE_DATA';
        } else if (innerHtml.includes('banner_slot')) {
          dataType = 'CONTROL_BANNER';
        }
      }
      
      console.log('Final selected type:', dataType, 'at index:', elementIndex);
      setEditingElementHtml(element.outerHTML); // Store HTML string
      setEditingElementIndex(elementIndex); // Store which placeholder this is
      if (!dataTypeAttr) {
        setEditingDataTypeIndex(null);
      }
      setEditorType(dataType);
      setShowEditor(true);
    } else {
      console.log('Could not find content-placeholder or data-type element');
    }
  };

  // Update content in the HTML
  const applyContentAndTypeWithDom = (newContent, nextType) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const placeholders = doc.querySelectorAll('.content-placeholder');
    const placeholder = placeholders[editingElementIndex];

    if (!placeholder) return null;

    placeholder.innerHTML = newContent;

    const dataTypeElements = doc.querySelectorAll('[data-type]');
    const dataTypeElement = editingDataTypeIndex !== null
      ? dataTypeElements[editingDataTypeIndex]
      : placeholder.closest('[data-type]');

    if (dataTypeElement) {
      dataTypeElement.setAttribute('data-type', nextType);
    } else {
      placeholder.setAttribute('data-type', nextType);
    }

    const headStyles = Array.from(doc.head.querySelectorAll('style'))
      .map((styleEl) => styleEl.outerHTML)
      .join('');

    return `${headStyles}${doc.body.innerHTML}`;
  };

  const updateContent = (newContent) => {
    if (editingElementIndex === null) {
      console.error('No editing element set');
      return;
    }

    console.log('Updating element at index:', editingElementIndex);
    console.log('New content:', newContent.substring(0, 100));

    const domUpdatedHtml = applyContentAndTypeWithDom(newContent, editorType);
    if (domUpdatedHtml) {
      setHtml(domUpdatedHtml);
      setShowEditor(false);
      setEditingElementHtml(null);
      setEditingElementIndex(null);
      setEditingDataTypeIndex(null);
      return;
    }

    // Find Nth .content-placeholder div by properly counting nested divs
    let divCount = -1;
    let replacementStart = -1;
    let replacementEnd = -1;
    let currentDepth = 0;
    let inTarget = false;

    // Find all positions of content-placeholder opens and match them with closes
    const regex = /<div\s+class="content-placeholder"/g;
    let match;
    let occurrenceIndex = 0;

    while ((match = regex.exec(html)) !== null) {
      if (occurrenceIndex === editingElementIndex) {
        // Found the target placeholder opening tag
        const tagStart = match.index;
        
        // Find the end of the opening tag (the '>')
        let contentStart = tagStart;
        while (contentStart < html.length && html[contentStart] !== '>') {
          contentStart++;
        }
        contentStart++; // Move past the '>'
        
        // Now find its matching closing </div> by counting nesting
        let nestLevel = 0;
        let pos = tagStart;
        let i = contentStart;
        nestLevel = 1;

        // Count divs to find the matching close tag
        while (i < html.length && nestLevel > 0) {
          if (html.substring(i, i + 4) === '<div') {
            // Check if it's a closing tag
            let j = i;
            while (j < html.length && html[j] !== '>') {
              j++;
            }
            // Check if this is a real opening div tag (not "disabled", "data-xyz" etc)
            if (html[i + 4] === ' ' || html[i + 4] === '>') {
              nestLevel++;
            }
            i = j + 1;
          } else if (html.substring(i, i + 6) === '</div>') {
            nestLevel--;
            if (nestLevel === 0) {
              replacementStart = contentStart; // Start AFTER the opening tag's >
              replacementEnd = i; // End BEFORE the closing </div>
              break;
            }
            i += 6;
          } else {
            i++;
          }
        }
        break;
      }
      occurrenceIndex++;
    }

    if (replacementStart === -1 || replacementEnd === -1) {
      console.error('Could not find content-placeholder at index', editingElementIndex);
      alert('Could not find the component to replace. Try clicking on it again.');
      return;
    }

    // Extract and replace
    const oldContent = html.substring(replacementStart, replacementEnd);
    console.log('Replacing:', oldContent.substring(0, 100), '...');
    
    const newHtml = html.substring(0, replacementStart) + newContent + html.substring(replacementEnd);
    
    console.log('Updated HTML length:', newHtml.length);
    setHtml(newHtml);
    setShowEditor(false);
    setEditingElementHtml(null);
    setEditingElementIndex(null);
    setEditingDataTypeIndex(null);
  };

  // Delete content from the HTML
  const deleteContent = () => {
    if (editingElementIndex === null) {
      console.error('No editing element set');
      return;
    }

    if (!confirm('Are you sure you want to delete this element?')) {
      return;
    }

    console.log('Deleting content at index:', editingElementIndex);

    // Find Nth .content-placeholder div by properly counting nested divs
    const regex = /<div\s+class="content-placeholder"[^>]*>/g;
    let match;
    let occurrenceIndex = 0;
    let replacementStart = -1;
    let replacementEnd = -1;

    while ((match = regex.exec(html)) !== null) {
      if (occurrenceIndex === editingElementIndex) {
        // Start after the opening <div class="content-placeholder"> tag
        replacementStart = match.index + match[0].length;
        
        // Find the closing </div>
        let nestLevel = 1;
        let i = replacementStart;

        // Count divs to find the matching close tag
        while (i < html.length && nestLevel > 0) {
          if (html.substring(i, i + 4) === '<div') {
            let j = i;
            while (j < html.length && html[j] !== '>') {
              j++;
            }
            if (html[i + 4] === ' ' || html[i + 4] === '>') {
              nestLevel++;
            }
            i = j + 1;
          } else if (html.substring(i, i + 6) === '</div>') {
            nestLevel--;
            if (nestLevel === 0) {
              replacementEnd = i;
              break;
            }
            i += 6;
          } else {
            i++;
          }
        }
        break;
      }
      occurrenceIndex++;
    }

    if (replacementStart === -1 || replacementEnd === -1) {
      console.error('Could not find content-placeholder at index', editingElementIndex);
      alert('Could not find the element to delete.');
      return;
    }

    // Delete only the content inside, keep the placeholder wrapper
    const newHtml = html.substring(0, replacementStart) + html.substring(replacementEnd);
    
    console.log('Deleted content, placeholder still exists, new HTML length:', newHtml.length);
    setHtml(newHtml);
    setShowEditor(false);
    setEditingElementHtml(null);
    setEditingElementIndex(null);
    setEditingDataTypeIndex(null);
  };

  // Save HTML to database
  const handleSave = async () => {
    setIsSaving(true);
    console.log('Saving template ID:', templateId, 'HTML length:', html.length);
    try {
      const response = await fetch(`/api/admin/hp-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homepageHtml: html })
      });

      const data = await response.json();

      if (response.ok) {
        setLastSavedHtml(html);
        router.refresh();
        alert('Template saved successfully!');
      } else {
        console.error('Save error:', data);
        alert(`Error saving template: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Error saving template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Render the appropriate editor popup
  const renderEditor = () => {
    if (editorType === 'IMAGE_DATA') {
      return <ImageDataEditor elementHtml={editingElementHtml} onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'HTML_DATA') {
      return <HtmlDataEditor onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'CONTROL_DATA') {
      return <ControlDataEditor onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'NEWS_CONTROL') {
      return <NewsControlEditor onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'ARTICLES_SLIDER') {
      return <ArticlesSliderEditor onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'ARTICLES_CUBE') {
      return <ArticlesCubeEditor onSave={updateContent} onClose={() => setShowEditor(false)} />;
    } else if (editorType === 'CONTROL_BANNER') {
      return (
        <BannerSlotControlEditor
          elementHtml={editingElementHtml}
          onSave={updateContent}
          onCancel={() => setShowEditor(false)}
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          className={styles.modeBtn}
          onClick={() => setWebviewMode(!webviewMode)}
        >
          {webviewMode ? '✏️ Edit Mode' : '👁️ Web View'}
        </button>
        <button
          className={styles.modeBtn}
          onClick={() => { setRawHtml(html); setShowHtmlEditor(true); }}
        >
          {'</> Edit HTML'}
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : '💾 Save Changes'}
        </button>
        {html !== lastSavedHtml && (
          <span className={styles.unsavedIndicator}>Unsaved changes</span>
        )}
      </div>

      {/* Template preview/edit area */}
      <div 
        className={`${styles.editorArea} ${webviewMode ? styles.webviewMode : ''}`}
        onClick={!webviewMode ? handleEditClick : undefined}
        ref={containerRef}
      >
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: processPreviewHtml(html) }}
          style={!webviewMode ? { cursor: 'pointer' } : {}}
        />
        {!webviewMode && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#6b1020',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            zIndex: 500,
            fontSize: '0.9rem'
          }}>
            💡 Click on any section to edit
          </div>
        )}
      </div>

      {/* Raw HTML Editor Modal */}
      {showHtmlEditor && (
        <div className={styles.editorModal}>
          <div className={styles.editorContent} style={{ maxWidth: '900px', width: '95vw' }}>
            <div className={styles.editorHeader}>
              <h3>&lt;/&gt; Edit Raw HTML</h3>
              <button className={styles.closeBtn} onClick={() => setShowHtmlEditor(false)}>✕</button>
            </div>
            <textarea
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              style={{
                width: '100%',
                height: '60vh',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                resize: 'vertical',
                direction: 'ltr',
                lineHeight: 1.5,
              }}
              spellCheck={false}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className={styles.modeBtn}
                onClick={() => setShowHtmlEditor(false)}
              >
                ביטול
              </button>
              <button
                className={styles.saveBtn}
                onClick={() => { setHtml(rawHtml); setShowHtmlEditor(false); }}
              >
                ✅ החל שינויים
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor popup */}
      {showEditor && (
        <div className={styles.editorModal}>
          <div className={styles.editorContent}>
            <div className={styles.editorHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>Edit</h3>
                <select
                  value={editorType || ''}
                  onChange={(e) => setEditorType(e.target.value)}
                  style={{
                    minWidth: '260px',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    background: '#fff',
                  }}
                >
                  {editorTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={styles.deleteBtn}
                  onClick={deleteContent}
                  title="Delete this element"
                  style={{
                    background: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowEditor(false)}
                >
                  ✕
                </button>
              </div>
            </div>
            {renderEditor()}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import TemplateEditor from '@/components/TemplateEditor';
import styles from './settings.module.css';

const MOBILE_CONTROL_ORDER_SETTING = 'control_mobile_order';
const defaultMobileControlOrder = [
  { id: 'events', label: 'Events' },
  { id: 'shabbat', label: 'Shabbat' },
  { id: 'weekly-prayers', label: 'Weekly Prayer Times' },
  { id: 'contact-form', label: 'Contact Form' },
  { id: 'news', label: 'News' },
  { id: 'articles-slider', label: 'Articles Slider' },
  { id: 'articles-cube', label: 'Articles Cube' },
];

function normalizeMobileControlOrder(value) {
  const ids = Array.isArray(value) ? value : [];
  const uniqueIds = ids.filter((id, index) => (
    typeof id === 'string' &&
    ids.indexOf(id) === index &&
    defaultMobileControlOrder.some((control) => control.id === id)
  ));
  const missingIds = defaultMobileControlOrder
    .map((control) => control.id)
    .filter((id) => !uniqueIds.includes(id));

  return [...uniqueIds, ...missingIds];
}

export default function SettingsPage() {
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateHtml, setNewTemplateHtml] = useState('');
  const [mobileControlOrder, setMobileControlOrder] = useState(defaultMobileControlOrder.map((control) => control.id));
  const [savingMobileOrder, setSavingMobileOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadMobileControlOrder();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hp-templates');
      const data = await response.json();
      setTemplates(data.templates);
      setActiveTemplate(data.activeTemplate);
      
      // Auto-select active template
      if (data.activeTemplate) {
        setSelectedTemplate(data.activeTemplate.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setMessage({ type: 'error', text: 'Failed to load templates' });
    } finally {
      setLoading(false);
    }
  };

  const loadMobileControlOrder = async () => {
    try {
      const response = await fetch(`/api/admin/settings?keys=${MOBILE_CONTROL_ORDER_SETTING}`);
      const data = await response.json();
      setMobileControlOrder(normalizeMobileControlOrder(data.data?.[MOBILE_CONTROL_ORDER_SETTING]));
    } catch (error) {
      console.error('Error loading mobile control order:', error);
    }
  };

  const moveMobileControl = (controlId, direction) => {
    setMobileControlOrder((current) => {
      const index = current.indexOf(controlId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleSaveMobileOrder = async () => {
    setSavingMobileOrder(true);
    try {
      const response = await fetch(`/api/admin/settings/${MOBILE_CONTROL_ORDER_SETTING}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: mobileControlOrder }),
      });

      if (!response.ok) throw new Error('Failed to save mobile order');
      setMessage({ type: 'success', text: 'Mobile control order saved!' });
    } catch (error) {
      console.error('Error saving mobile control order:', error);
      setMessage({ type: 'error', text: 'Failed to save mobile control order' });
    } finally {
      setSavingMobileOrder(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateHtml.trim()) {
      setMessage({ type: 'error', text: 'Please enter template name and HTML' });
      return;
    }

    try {
      const response = await fetch('/api/admin/hp-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: newTemplateName,
          template_html: newTemplateHtml
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Template created successfully!' });
        setNewTemplateName('');
        setNewTemplateHtml('');
        setShowNewTemplateForm(false);
        loadTemplates();
      } else {
        setMessage({ type: 'error', text: 'Failed to create template' });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setMessage({ type: 'error', text: 'Error creating template' });
    }
  };

  const handleSetActive = async (templateId) => {
    try {
      const response = await fetch(`/api/admin/hp-templates/${templateId}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Template activated!' });
        loadTemplates();
         setSelectedTemplate(templateId);
      } else {
        setMessage({ type: 'error', text: 'Failed to activate template' });
      }
    } catch (error) {
      console.error('Error activating template:', error);
      setMessage({ type: 'error', text: 'Error activating template' });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/hp-templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Template deleted!' });
        loadTemplates();
        if (selectedTemplate === templateId) {
          setSelectedTemplate(null);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to delete template' });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setMessage({ type: 'error', text: 'Error deleting template' });
    }
  };

  const currentTemplate = templates?.find(t => t.id === selectedTemplate);
  const templateHtml = currentTemplate?.homepage_html || currentTemplate?.template_html;

  return (
    <div className={styles.container}>
      <h1>Homepage Templates</h1>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading templates...</div>
      ) : (
        <>
          {/* Templates List */}
          <div className={styles.mobileOrderPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Mobile Control Order</h2>
                <p className={styles.panelHint}>Controls use this order when they stack one below another on mobile.</p>
              </div>
              <button
                className={styles.addBtn}
                onClick={handleSaveMobileOrder}
                disabled={savingMobileOrder}
              >
                {savingMobileOrder ? 'Saving...' : 'Save Order'}
              </button>
            </div>

            <div className={styles.mobileOrderList}>
              {mobileControlOrder.map((controlId, index) => {
                const control = defaultMobileControlOrder.find((item) => item.id === controlId);
                if (!control) return null;

                return (
                  <div key={controlId} className={styles.mobileOrderItem}>
                    <span className={styles.mobileOrderNumber}>{index + 1}</span>
                    <span className={styles.mobileOrderLabel}>{control.label}</span>
                    <div className={styles.mobileOrderActions}>
                      <button
                        type="button"
                        onClick={() => moveMobileControl(controlId, -1)}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMobileControl(controlId, 1)}
                        disabled={index === mobileControlOrder.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.templatesPanel}>
            <div className={styles.panelHeader}>
              <h2>Templates</h2>
              <button
                className={styles.addBtn}
               onClick={() => setShowNewTemplateForm(!showNewTemplateForm)}
              >
                + New Template
              </button>
            </div>

            {showNewTemplateForm && (
              <div className={styles.newTemplateForm}>
                <div className={styles.formGroup}>
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Home Page v1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Template HTML</label>
                  <textarea
                    value={newTemplateHtml}
                    onChange={(e) => setNewTemplateHtml(e.target.value)}
                    placeholder="Paste your HTML template here..."
                    rows="10"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowNewTemplateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.createBtn}
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </button>
                </div>
              </div>
            )}

            <div className={styles.templatesList}>
              {templates?.length === 0 ? (
                <p className={styles.empty}>No templates yet. Create one to get started!</p>
              ) : (
                templates?.map(template => (
                  <div
                    key={template.id}
                    className={`${styles.templateItem} ${
                      selectedTemplate === template.id ? styles.active : ''
                    } ${template.is_active ? styles.isActive : ''}`}
                  >
                    <div className={styles.templateInfo}>
                      <div className={styles.templateName}>{template.template_name}</div>
                      <div className={styles.templateDate}>
                        {new Date(template.created_at).toLocaleDateString()}
                      </div>
                      {template.is_active && <span className={styles.activeLabel}>Active</span>}
                    </div>

                    <div className={styles.templateActions}>
                      <button
                        className={styles.selectBtn}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        Select
                      </button>
                      {!template.is_active && (
                        <button
                          className={styles.activateBtn}
                          onClick={() => handleSetActive(template.id)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor Panel */}
          {currentTemplate && templateHtml && (
            <div className={styles.editorPanel}>
              <TemplateEditor
                templateId={currentTemplate.id}
                initialHtml={templateHtml}
              />
            </div>
          )}

          {selectedTemplate && !templateHtml && (
            <div className={styles.empty}>
              Template selected. Load editor to start editing.
            </div>
          )}
        </>
      )}
    </div>
  );
}

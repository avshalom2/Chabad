'use client';

import { useState, useEffect } from 'react';
import TemplateEditor from '@/components/TemplateEditor';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateHtml, setNewTemplateHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
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

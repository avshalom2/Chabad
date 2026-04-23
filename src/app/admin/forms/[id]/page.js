'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../form-editor.module.css';

export default function FormEditorPage({ params }) {
  const router = useRouter();
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [newField, setNewField] = useState({
    fieldName: '',
    fieldType: 'text',
    fieldLabel: '',
    placeholder: '',
    isRequired: false,
  });

  useEffect(() => {
    (async () => {
      const p = await params;
      setFormId(p.id);
      await fetchForm(p.id);
    })();
  }, []);

  async function fetchForm(id) {
    try {
      const res = await fetch(`/api/admin/forms/${id}`);
      const data = await res.json();
      setForm(data);
      setFormName(data.name);
      setFormDesc(data.description || '');
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Error loading form');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateForm() {
    if (!formName.trim()) {
      alert('Form name is required');
      return;
    }

    try {
      const res = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setForm(updated);
        alert('Form updated successfully');
      } else {
        alert('Failed to update form');
      }
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Error updating form');
    }
  }

  async function handleAddField() {
    if (!newField.fieldName.trim()) {
      alert('Field name is required');
      return;
    }

    try {
      const res = await fetch(`/api/admin/forms/${formId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newField,
          fieldOrder: (form.fields?.length || 0) + 1,
        }),
      });

      if (res.ok) {
        await fetchForm(formId);
        setNewField({
          fieldName: '',
          fieldType: 'text',
          fieldLabel: '',
          placeholder: '',
          isRequired: false,
        });
        alert('Field added successfully');
      } else {
        alert('Failed to add field');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      alert('Error adding field');
    }
  }

  async function handleDeleteField(fieldId) {
    if (!confirm('Delete this field?')) return;

    try {
      const res = await fetch(`/api/admin/forms/${formId}/fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchForm(formId);
      } else {
        alert('Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Error deleting field');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!form) return <div className={styles.container}>Form not found</div>;

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
  ];

  return (
    <div className={styles.container}>
      <Link href="/admin/forms" className={styles.backLink}>
        ← Back to Forms
      </Link>

      <h1 className={styles.title}>Edit Form: {form.name}</h1>

      {/* Form Details */}
      <div className={styles.section}>
        <h2>Form Details</h2>
        <div className={styles.formGroup}>
          <label>Form Name</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <button onClick={handleUpdateForm} className={styles.saveBtn}>
          Save Form Details
        </button>
      </div>

      {/* Form Fields */}
      <div className={styles.section}>
        <h2>Form Fields ({form.fields?.length || 0})</h2>

        {form.fields && form.fields.length > 0 && (
          <div className={styles.fieldsList}>
            {form.fields.map((field) => (
              <div key={field.id} className={styles.fieldItem}>
                <div>
                  <strong>{field.field_label || field.field_name}</strong>
                  <small>{field.field_type}</small>
                  {field.is_required && <span className={styles.required}>*</span>}
                </div>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className={styles.deleteFieldBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {!form.fields || form.fields.length === 0 && (
          <p className={styles.noFields}>No fields yet.</p>
        )}
      </div>

      {/* Add New Field */}
      <div className={styles.section}>
        <h2>Add New Field</h2>

        <div className={styles.twoCol}>
          <div className={styles.formGroup}>
            <label>Field Name (variable)</label>
            <input
              type="text"
              value={newField.fieldName}
              onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
              placeholder="e.g., customer_name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Field Type</label>
            <select
              value={newField.fieldType}
              onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Field Label (displayed to users) <span className={styles.optional}>optional</span></label>
          <input
            type="text"
            value={newField.fieldLabel}
            onChange={(e) => setNewField({ ...newField, fieldLabel: e.target.value })}
            placeholder="Leave empty to use field name"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Placeholder</label>
          <input
            type="text"
            value={newField.placeholder}
            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={newField.isRequired}
              onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
            />
            <span>Required field</span>
          </label>
        </div>

        <button onClick={handleAddField} className={styles.addFieldBtn}>
          + Add Field
        </button>
      </div>
    </div>
  );
}

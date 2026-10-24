import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EvidenceItem } from '../../types/domain';
import styles from './AddEvidenceModal.module.css';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<EvidenceItem, 'id' | 'mission_id'>) => void;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    parameter_key: '',
    label: '',
    category: 'mass_properties' as EvidenceItem['category'],
    value: '',
    unit: '',
    value_type: 'numeric' as EvidenceItem['value_type'],
    source_doc_title: '',
    source_doc_ref: '',
    source_doc_date: new Date().toISOString().split('T')[0],
    locator: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parameter_key || !formData.label || !formData.source_doc_title) {
      alert('Please fill in required fields: Parameter Key, Label, and Source Title.');
      return;
    }

    const numericVal =
      formData.value_type === 'numeric'
        ? Number(formData.value) || 0
        : formData.value;

    onAdd({
      parameter_key: formData.parameter_key.trim(),
      label: formData.label.trim(),
      category: formData.category,
      value: numericVal,
      unit: formData.unit.trim() || undefined,
      value_type: formData.value_type,
      source_doc_title: formData.source_doc_title.trim(),
      source_doc_ref: formData.source_doc_ref.trim() || 'N/A',
      source_doc_date: formData.source_doc_date || new Date().toISOString().split('T')[0] || '2024-01-01',
      locator: formData.locator.trim() || undefined,
      state: 'unconfirmed',
      notes: formData.notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Register Mission Evidence Entry</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Parameter Key *</label>
              <input
                className={styles.input}
                placeholder="e.g. mass_dry_kg"
                value={formData.parameter_key}
                onChange={(e) => setFormData({ ...formData, parameter_key: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Human-Readable Label *</label>
              <input
                className={styles.input}
                placeholder="e.g. Dry Mass Structure"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as EvidenceItem['category'],
                  })
                }
              >
                <option value="mass_properties">Mass Properties</option>
                <option value="envelope">Envelope Dimensions</option>
                <option value="orbit_lifetime">Orbit & Lifetime</option>
                <option value="electrical">Electrical & Battery</option>
                <option value="rf_licensing">RF & Licensing</option>
                <option value="thermal">Thermal Environment</option>
                <option value="deployment">Deployment Timeline</option>
                <option value="general">General Context</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Value Type</label>
              <select
                className={styles.select}
                value={formData.value_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value_type: e.target.value as EvidenceItem['value_type'],
                  })
                }
              >
                <option value="numeric">Numeric</option>
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Value *</label>
              <input
                className={styles.input}
                placeholder="e.g. 3.82"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Engineering Unit</label>
              <input
                className={styles.input}
                placeholder="e.g. kg, mm, W, km"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Source Document Title *</label>
            <input
              className={styles.input}
              placeholder="e.g. Master Interface Control Document"
              value={formData.source_doc_title}
              onChange={(e) => setFormData({ ...formData, source_doc_title: e.target.value })}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Document Reference / Revision</label>
              <input
                className={styles.input}
                placeholder="e.g. ICD-004-REV-C"
                value={formData.source_doc_ref}
                onChange={(e) => setFormData({ ...formData, source_doc_ref: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Document Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.source_doc_date}
                onChange={(e) => setFormData({ ...formData, source_doc_date: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Exact Document Locator</label>
            <input
              className={styles.input}
              placeholder="e.g. Section 3.2, Table 3-1, Page 14"
              value={formData.locator}
              onChange={(e) => setFormData({ ...formData, locator: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Engineering Notes</label>
            <textarea
              rows={2}
              className={styles.textarea}
              placeholder="Additional technical context or measurement notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Register Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvidenceModal;

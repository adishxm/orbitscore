import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { EvidenceItem } from '../../types/domain';
import { StateChip } from '../common/StateChip';
import styles from './DataTable.module.css';

interface DataTableProps {
  items: EvidenceItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem?: () => void;
}

type SortField = 'label' | 'category' | 'value' | 'source_doc_title' | 'state';
type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  items,
  selectedId,
  onSelectItem,
  onAddItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('label');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        // State filter
        if (selectedState !== 'all' && item.state !== selectedState) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim().length > 0) {
          const query = searchQuery.toLowerCase();
          const matchesKey = item.parameter_key.toLowerCase().includes(query);
          const matchesLabel = item.label.toLowerCase().includes(query);
          const matchesSource = item.source_doc_title
            .toLowerCase()
            .includes(query);
          const matchesLocator = (item.locator || '')
            .toLowerCase()
            .includes(query);
          const matchesNotes = (item.notes || '').toLowerCase().includes(query);
          return (
            matchesKey ||
            matchesLabel ||
            matchesSource ||
            matchesLocator ||
            matchesNotes
          );
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortField === 'value') {
          valA = a.value !== null ? String(a.value) : '';
          valB = b.value !== null ? String(b.value) : '';
        } else {
          valA = a[sortField] || '';
          valB = b[sortField] || '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          const comparison = valA.localeCompare(valB);
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    items,
    searchQuery,
    selectedState,
    selectedCategory,
    sortField,
    sortDirection,
  ]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} aria-hidden="true" />
    ) : (
      <ArrowDown size={12} aria-hidden="true" />
    );
  };

  return (
    <section className={styles.tableContainer} aria-labelledby="register-heading">
      {/* Search & Filter Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrap}>
          <Search size={16} color="var(--color-text-muted)" aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search parameter, document, or locator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search evidence records"
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.selectInput}
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter by evidence state"
          >
            <option value="all">All States</option>
            <option value="confirmed">Confirmed</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="conflicting">Conflicting</option>
            <option value="stale">Stale</option>
            <option value="missing">Missing</option>
          </select>

          <select
            className={styles.selectInput}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by engineering category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {onAddItem && (
            <button
              type="button"
              className={styles.addButton}
              onClick={onAddItem}
              aria-label="Add evidence record"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Add Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.th}
                scope="col"
                onClick={() => handleSort('label')}
                aria-sort={sortField === 'label' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className={styles.thSort}>
                  <span>Parameter</span>
                  {renderSortIndicator('label')}
                </span>
              </th>
              <th
                className={styles.th}
                scope="col"
                onClick={() => handleSort('category')}
                aria-sort={sortField === 'category' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className={styles.thSort}>
                  <span>Category</span>
                  {renderSortIndicator('category')}
                </span>
              </th>
              <th
                className={styles.th}
                scope="col"
                onClick={() => handleSort('value')}
                aria-sort={sortField === 'value' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className={styles.thSort}>
                  <span>Value & Unit</span>
                  {renderSortIndicator('value')}
                </span>
              </th>
              <th
                className={styles.th}
                scope="col"
                onClick={() => handleSort('source_doc_title')}
                aria-sort={sortField === 'source_doc_title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className={styles.thSort}>
                  <span>Source & Locator</span>
                  {renderSortIndicator('source_doc_title')}
                </span>
              </th>
              <th
                className={styles.th}
                scope="col"
                onClick={() => handleSort('state')}
                aria-sort={sortField === 'state' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className={styles.thSort}>
                  <span>State</span>
                  {renderSortIndicator('state')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <tr
                    key={item.id}
                    className={`${styles.tr} ${isSelected ? styles.selectedRow : ''}`}
                    onClick={() => onSelectItem(item.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectItem(item.id);
                      }
                    }}
                    role="row"
                    aria-selected={isSelected}
                  >
                    <td className={styles.td}>
                      <div className={styles.parameterCell}>
                        <span className={styles.paramLabel}>{item.label}</span>
                        <span className={styles.paramKey}>{item.parameter_key}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.categoryBadge}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.valueCell}>
                        {item.value !== null ? String(item.value) : <span className={styles.emptyValue}>—</span>}
                        {item.unit ? ` ${item.unit}` : ''}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.citationCell}>
                        <span className={styles.docTitle} title={item.source_doc_title}>
                          {item.source_doc_title || 'No source title'}
                        </span>
                        <span className={styles.docLocator}>
                          {item.locator || `Ref: ${item.source_doc_ref}`}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <StateChip state={item.state} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No evidence records match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className={styles.cardList}>
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                className={`${styles.evidenceCard} ${isSelected ? styles.evidenceCardSelected : ''}`}
                onClick={() => onSelectItem(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectItem(item.id);
                  }
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.parameterCell}>
                    <span className={styles.paramLabel}>{item.label}</span>
                    <span className={styles.paramKey}>{item.parameter_key}</span>
                  </div>
                  <StateChip state={item.state} />
                </div>

                <div className={styles.cardValue}>
                  Value: <strong>{item.value !== null ? String(item.value) : '—'} {item.unit || ''}</strong>
                </div>

                <div className={styles.citationCell}>
                  <span className={styles.docTitle}>{item.source_doc_title}</span>
                  <span className={styles.docLocator}>{item.locator || item.source_doc_ref}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>No evidence records match.</div>
        )}
      </div>
    </section>
  );
};

export default DataTable;

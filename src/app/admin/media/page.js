'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminFeedback } from '@/components/AdminFeedbackProvider.js';
import styles from './media.module.css';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function MediaPage() {
  const { confirm, notify } = useAdminFeedback();
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const loadAssets = useCallback(async (cursor, append = false) => {
    setLoading(true);
    try {
      const url = cursor ? `/api/admin/media?cursor=${encodeURIComponent(cursor)}` : '/api/admin/media';
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load images');
      setAssets((current) => append ? [...current, ...data.assets] : data.assets);
      setNextCursor(data.nextCursor);
    } catch (error) {
      notify({ title: 'Could not load media', description: error.message, tone: 'error' });
    } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const visibleAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? assets.filter((asset) => asset.publicId.toLowerCase().includes(term)) : assets;
  }, [assets, search]);

  function toggle(publicId) {
    if (assets.find((asset) => asset.publicId === publicId)?.usageCount) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(publicId)) next.delete(publicId); else next.add(publicId);
      return next;
    });
  }

  async function deleteSelected() {
    const publicIds = [...selected];
    if (!publicIds.length) return;
    const approved = await confirm({
      title: `Permanently delete ${publicIds.length} image${publicIds.length === 1 ? '' : 's'}?`,
      description: 'This removes the original files from Cloudinary and cannot be undone. Any page using them will show a broken image.',
      confirmText: 'Delete permanently', tone: 'danger',
    });
    if (!approved) return;
    setDeleting(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicIds }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 207) {
        const suffix = data.inUse?.length ? ` (${data.inUse.length} selected image(s) are in use)` : '';
        throw new Error(`${data.error || 'Delete failed'}${suffix}`);
      }
      const removed = publicIds.filter((id) => !data.failed?.includes(id));
      setAssets((current) => current.filter((asset) => !removed.includes(asset.publicId)));
      setSelected(new Set(data.failed || []));
      notify({ title: `${removed.length} image${removed.length === 1 ? '' : 's'} deleted`,
        description: data.failed?.length ? `${data.failed.length} could not be deleted.` : '',
        tone: data.failed?.length ? 'warning' : 'success' });
    } catch (error) {
      notify({ title: 'Delete failed', description: error.message, tone: 'error' });
    } finally { setDeleting(false); }
  }

  return (
    <div className={styles.container} dir="ltr">
      <div className={styles.header}>
        <div><h1>Cloudinary Media</h1><p>Files in the configured upload folder. Deletion is permanent.</p></div>
        <button className={styles.deleteButton} disabled={!selected.size || deleting} onClick={deleteSelected}>
          {deleting ? 'Deleting…' : `Delete selected (${selected.size})`}
        </button>
      </div>
      <div className={styles.toolbar}>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by file ID" />
        <span>{assets.length} loaded</span>
        <button type="button" onClick={() => setSelected(new Set(visibleAssets.filter((asset) => !asset.usageCount).map((asset) => asset.publicId)))} disabled={!visibleAssets.length}>Select unused</button>
        <button type="button" onClick={() => setSelected(new Set())} disabled={!selected.size}>Clear</button>
      </div>
      {loading && !assets.length ? <p className={styles.message}>Loading images…</p> : null}
      {!loading && !visibleAssets.length ? <p className={styles.message}>No images found.</p> : null}
      <div className={styles.grid}>
        {visibleAssets.map((asset) => (
          <button type="button" key={asset.publicId} disabled={Boolean(asset.usageCount)} title={asset.usageCount ? `Used in ${asset.usageCount} place(s)` : 'Unused image'} className={`${styles.card} ${selected.has(asset.publicId) ? styles.selected : ''} ${asset.usageCount ? styles.inUse : ''}`} onClick={() => toggle(asset.publicId)}>
            <span className={styles.checkbox}>{selected.has(asset.publicId) ? '✓' : ''}</span>
            <img src={asset.src} alt={asset.name} loading="lazy" />
            <span className={styles.details}><strong title={asset.publicId}>{asset.name}</strong>
              <small>{asset.width} × {asset.height} · {formatBytes(asset.bytes)}</small>
              <small>{new Date(asset.createdAt).toLocaleDateString()}</small></span>
            <span className={`${styles.usage} ${asset.usageCount ? styles.used : styles.unused}`}>{asset.usageCount ? `In use (${asset.usageCount})` : 'Unused'}</span>
          </button>
        ))}
      </div>
      {nextCursor ? <button className={styles.loadMore} disabled={loading} onClick={() => loadAssets(nextCursor, true)}>{loading ? 'Loading…' : 'Load more'}</button> : null}
    </div>
  );
}

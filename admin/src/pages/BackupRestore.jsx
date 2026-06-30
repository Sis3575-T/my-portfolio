import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import ConfirmDialog from '../components/ConfirmDialog';

const formatBytes = (bytes) => {
  if (!bytes) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i] || 'B'}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function BackupRestore() {
  const toast = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchBackups(); }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getBackups();
      setBackups(data.data || []);
    } catch {
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!backupName.trim()) { toast.error('Please enter a backup name'); return; }
    setCreating(true);
    try {
      await adminApi.createBackup({ name: backupName.trim() });
      toast.success('Backup created successfully');
      setBackupName('');
      setShowCreateInput(false);
      await fetchBackups();
    } catch {
      toast.error('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await adminApi.restoreBackup(restoreTarget._id);
      toast.success('Backup restored successfully');
      setRestoreTarget(null);
    } catch {
      toast.error('Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteBackup(deleteTarget._id);
      toast.success('Backup deleted');
      setBackups(prev => prev.filter(b => b._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete backup');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDownload = async (backup) => {
    try {
      const res = await adminApi.exportData('backup');
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.name || 'backup'}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch {
      toast.error('Failed to download backup');
    }
  };

  const totalStorage = backups.reduce((sum, b) => sum + (b.size || 0), 0);
  const lastBackup = backups.length > 0 ? backups[0].createdAt : null;

  const stats = [
    { label: 'Total Backups', value: backups.length, icon: Icons.database, color: 'blue' },
    { label: 'Last Backup', value: lastBackup ? formatDate(lastBackup) : 'Never', icon: Icons.clock, color: 'green' },
    { label: 'Storage Used', value: formatBytes(totalStorage), icon: Icons['hard-drive'], color: 'purple' },
  ];

  return (
    <PageLayout
      title="Backup & Restore"
      description="Manage your site backups and data export/import"
      stats={stats}
      quickActions={[
        { label: creating ? 'Creating...' : 'Create Backup', icon: Icons['file-plus'], onClick: () => setShowCreateInput(true), primary: true },
        { label: 'Import JSON', icon: Icons.upload, onClick: () => fileRef.current?.click() },
      ]}
    >
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const fd = new FormData();
          fd.append('file', file);
          await adminApi.importData(fd);
          toast.success('Data imported successfully');
          await fetchBackups();
        } catch {
          toast.error('Failed to import data');
        }
      }} />

      {showCreateInput && (
        <div style={{ padding: '1rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="Enter backup name..."
            style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.85rem', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowCreateInput(false); setBackupName(''); }}>
            Cancel
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 8, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '30%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))
        ) : backups.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
            <Icon path={Icons.database} size={48} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No backups yet</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', textAlign: 'center' }}>Create your first backup to protect your data.</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup._id}
              style={{
                padding: '1.25rem', borderRadius: 14, border: '1px solid var(--color-border)',
                background: 'var(--color-card)', transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${backup.type === 'manual' ? '#3B82F6' : '#8B5CF6'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={Icons.database} size={20} style={{ color: backup.type === 'manual' ? '#3B82F6' : '#8B5CF6' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{backup.name || 'Backup'}</div>
                    <span style={{
                      display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                      background: backup.type === 'manual' ? '#3B82F618' : '#8B5CF618',
                      color: backup.type === 'manual' ? '#3B82F6' : '#8B5CF6',
                    }}>
                      {backup.type || 'manual'}
                    </span>
                  </div>
                </div>
                <span style={{
                  display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                  background: backup.status === 'completed' ? '#10B98118' : backup.status === 'failed' ? '#EF444418' : '#F59E0B18',
                  color: backup.status === 'completed' ? '#10B981' : backup.status === 'failed' ? '#EF4444' : '#F59E0B',
                }}>
                  {backup.status || 'unknown'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                <span>Size: {formatBytes(backup.size)}</span>
                <span>Created: {formatDate(backup.createdAt)}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(backup)}>
                  <Icon path={Icons.download} size={14} /> Download
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setRestoreTarget(backup)} style={{ color: 'var(--color-warning)' }}>
                  <Icon path={Icons['refresh-cw']} size={14} /> Restore
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(backup)} style={{ color: 'var(--color-danger)', marginLeft: 'auto' }}>
                  <Icon path={Icons.trash2} size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore Backup"
        message={`Restore "${restoreTarget?.name || 'this backup'}"? Current data will be overwritten. This action cannot be undone.`}
        confirmText="Restore"
        type="warning"
        loading={restoring}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Backup"
        message={`Delete "${deleteTarget?.name || 'this backup'}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}

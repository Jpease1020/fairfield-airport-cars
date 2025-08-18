'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, Span } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { BackupService } from '@/lib/services/backup-service';
import { Download, Upload, Trash2, RefreshCw, Calendar, HardDrive } from 'lucide-react';

interface BackupInfo {
  id: string;
  timestamp: Date;
  size: number;
  status: string;
}

export default function BackupManagementPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const backupService = BackupService.getInstance();

  useEffect(() => {
    loadBackups();
    loadConfig();
  }, []);

  const loadBackups = async () => {
    try {
      const backupList = await backupService.getBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const backupConfig = backupService.getConfig();
      setConfig(backupConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      const result = await backupService.createBackup();
      
      if (result.success) {
        await loadBackups();
      } else {
        alert(`Backup failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Backup creation failed:', error);
      alert('Backup creation failed');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    try {
      setIsRestoring(true);
      const result = await backupService.restoreBackup(backupId);
      
      if (result.success) {
        alert('Backup restored successfully');
        await loadBackups();
      } else {
        alert(`Restore failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Backup restoration failed:', error);
      alert('Backup restoration failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      // TODO: Implement delete functionality
      alert('Delete functionality not yet implemented');
    } catch (error) {
      console.error('Backup deletion failed:', error);
      alert('Backup deletion failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return getCMSField(cmsData, 'admin.backup.sections.fileSize.zeroBytes', '0 Bytes');
    const k = 1024;
    const sizes = [
      getCMSField(cmsData, 'admin.backup.sections.fileSize.bytes', 'Bytes'),
      getCMSField(cmsData, 'admin.backup.sections.fileSize.kb', 'KB'),
      getCMSField(cmsData, 'admin.backup.sections.fileSize.mb', 'MB'),
      getCMSField(cmsData, 'admin.backup.sections.fileSize.gb', 'GB')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container>
      <Stack direction="vertical" spacing="lg">
        {/* Backup Actions */}
        <Box variant="elevated" padding="md">
          <H2 data-cms-id="admin.backup.sections.actions.title" mode={mode}>
            {getCMSField(cmsData, 'admin.backup.sections.actions.title', 'Backup Actions')}
          </H2>
          <Stack direction="horizontal" spacing="sm">
            <Button
              onClick={handleCreateBackup}
              variant="primary"
              disabled={isCreating}
              data-cms-id="admin.backup.sections.actions.createBackup"
              interactionMode={mode}
            >
              <Download size={16} />
              <Span>
                {getCMSField(cmsData, 'admin.backup.sections.actions.createBackup', 'Create Backup')}
              </Span>
            </Button>
            <Button
              onClick={loadBackups}
              variant="outline"
              data-cms-id="admin.backup.sections.actions.refresh"
              interactionMode={mode}
            >
              <RefreshCw size={16} />
              <Span>
                {getCMSField(cmsData, 'admin.backup.sections.actions.refresh', 'Refresh')}
              </Span>
            </Button>
          </Stack>
        </Box>

        {/* Configuration */}
        {config && (
          <Box variant="elevated" padding="md">
            <H2 data-cms-id="admin.backup.sections.configuration.title" mode={mode}>
              {getCMSField(cmsData, 'admin.backup.sections.configuration.title', 'Backup Configuration')}
            </H2>
            <Stack direction="vertical" spacing="sm">
              <Text size="sm" data-cms-id="admin.backup.sections.configuration.frequency" mode={mode}>
                {getCMSField(cmsData, 'admin.backup.sections.configuration.frequency', 'Frequency:')}
                <Span variant="default"> {config.frequency}</Span>
              </Text>
              <Text size="sm" data-cms-id="admin.backup.sections.configuration.retention" mode={mode}>
                {getCMSField(cmsData, 'admin.backup.sections.configuration.retention', 'Retention:')}
                <Span variant="default"> {config.retentionDays} {getCMSField(cmsData, 'admin.backup.sections.configuration.retention.days', 'days')}</Span>
              </Text>
              <Text size="sm" data-cms-id="admin.backup.sections.configuration.compression" mode={mode}>
                {getCMSField(cmsData, 'admin.backup.sections.configuration.compression', 'Compression:')}
                <Span variant="default"> {config.compression ? getCMSField(cmsData, 'admin.backup.sections.configuration.compression.enabled', 'Enabled') : getCMSField(cmsData, 'admin.backup.sections.configuration.compression.disabled', 'Disabled')}</Span>
              </Text>
            </Stack>
          </Box>
        )}

        {/* Backup List */}
        <Box variant="elevated" padding="md">
          <H2 data-cms-id="admin.backup.sections.list.title" mode={mode}>
            {getCMSField(cmsData, 'admin.backup.sections.list.title', 'Available Backups')}
          </H2>
          {backups.length === 0 ? (
            <Text size="sm" data-cms-id="admin.backup.sections.list.noBackups" mode={mode}>
              {getCMSField(cmsData, 'admin.backup.sections.list.noBackups', 'No backups available')}
            </Text>
          ) : (
            <Stack direction="vertical" spacing="sm">
              {backups.map((backup) => (
                <Box key={backup.id} variant="elevated" padding="sm">
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <HardDrive size={16} />
                    <Stack direction="vertical" spacing="xs">
                      <Text size="sm" weight="semibold" data-cms-id="admin.backup.sections.list.backup.title" mode={mode}>
                        {getCMSField(cmsData, 'admin.backup.sections.list.backup.title', 'Backup')} {backup.id}
                      </Text>
                      <Text size="xs" data-cms-id="admin.backup.sections.list.backup.details" mode={mode}>
                        <Calendar size={12} />
                        <Span> {new Date(backup.timestamp).toLocaleString()}</Span>
                        <Span> • {formatFileSize(backup.size)}</Span>
                        <Span> • {backup.status}</Span>
                      </Text>
                    </Stack>
                    <Stack direction="horizontal" spacing="xs">
                      <Button
                        onClick={() => handleRestoreBackup(backup.id)}
                        variant="outline"
                        size="sm"
                        disabled={isRestoring}
                        data-cms-id="admin.backup.sections.list.backup.restore"
                        interactionMode={mode}
                      >
                        <Upload size={14} />
                        <Span>
                            {getCMSField(cmsData, 'admin.backup.sections.list.backup.restore', 'Restore')}
                        </Span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(backup.id)}
                        variant="danger"
                        size="sm"
                        data-cms-id="admin.backup.sections.list.backup.delete"
                        interactionMode={mode}
                      >
                        <Trash2 size={14} />
                        <Span>
                          {getCMSField(cmsData, 'admin.backup.sections.list.backup.delete', 'Delete')}
                        </Span>
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Status */}
        <Box variant="elevated" padding="sm">
          <Text size="sm" data-cms-id="admin.backup.sections.status" mode={mode}>
            {getCMSField(cmsData, 'admin.backup.sections.status', 'Last updated:')}
            <Span> {new Date().toLocaleString()}</Span>
          </Text>
        </Box>
      </Stack>
    </Container>
  );
} 
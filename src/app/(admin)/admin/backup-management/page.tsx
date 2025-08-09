'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, Span } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Backup Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.backup.actions', 'Backup Actions')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={handleCreateBackup}
                variant="primary"
                disabled={isCreating}
              >
                <Download size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.backup.create', 'Create Backup')}
                </Span>
              </Button>
              <Button
                onClick={loadBackups}
                variant="outline"
              >
                <RefreshCw size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.backup.refresh', 'Refresh')}
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Configuration */}
          {config && (
            <Box variant="elevated" padding="md">
              <H2>
                {getCMSField(cmsData, 'admin.backup.configuration', 'Backup Configuration')}
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.backup.frequency', 'Frequency:')}
                  <Span variant="default"> {config.frequency}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.backup.retention', 'Retention:')}
                  <Span variant="default"> {config.retentionDays} days</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.backup.compression', 'Compression:')}
                  <Span variant="default"> {config.compression ? 'Enabled' : 'Disabled'}</Span>
                </Text>
              </Stack>
            </Box>
          )}

          {/* Backup List */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.backup.list', 'Available Backups')}
            </H2>
            {backups.length === 0 ? (
              <Text size="sm">
                {getCMSField(cmsData, 'admin.backup.noBackups', 'No backups available')}
              </Text>
            ) : (
              <Stack direction="vertical" spacing="sm">
                {backups.map((backup) => (
                  <Box key={backup.id} variant="elevated" padding="sm">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <HardDrive size={16} />
                      <Stack direction="vertical" spacing="xs">
                        <Text size="sm" weight="semibold">
                          Backup {backup.id}
                        </Text>
                        <Text size="xs">
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
                        >
                          <Upload size={14} />
                          <Span>
                              {getCMSField(cmsData, 'admin.backup.restore', 'Restore')}
                          </Span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteBackup(backup.id)}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 size={14} />
                          <Span>
                            {getCMSField(cmsData, 'admin.backup.delete', 'Delete')}
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
            <Text size="sm">
              {getCMSField(cmsData, 'admin.backup.status', 'Last updated:')}
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    
  );
} 
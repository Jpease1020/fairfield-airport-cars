'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { backupService, BackupConfig } from '@/lib/services/backup-service';
import { 
  Download, 
  Upload, 
  Trash2, 
  Settings,
  Clock,
  HardDrive,
  Shield,
  CheckCircle
} from 'lucide-react';

export default function BackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [backupsData, configData] = await Promise.all([
        backupService.listBackups(),
        backupService.getConfig()
      ]);
      setBackups(backupsData);
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await backupService.createBackup();
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    try {
      await backupService.restoreBackup(backupId);
      alert('Backup restored successfully!');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Failed to restore backup');
    }
  };

  const handleCleanupBackups = async () => {
    if (!confirm('Are you sure you want to cleanup old backups?')) {
      return;
    }

    try {
      const deletedCount = await backupService.cleanupOldBackups();
      alert(`Cleaned up ${deletedCount} old backups`);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to cleanup backups:', error);
      alert('Failed to cleanup backups');
    }
  };

  const updateConfig = async (newConfig: Partial<BackupConfig>) => {
    if (!config) return;
    
    try {
      backupService.updateConfig(newConfig);
      setConfig({ ...config, ...newConfig });
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading backup data..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Backup Management" 
        subtitle="Manage automated backups and data recovery."
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={handleCreateBackup}
            disabled={creatingBackup}
          >
            {creatingBackup ? (
              <LoadingSpinner text="Creating..." />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Backup Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Total Backups</p>
                  <p className="text-2xl font-bold text-text-primary">{backups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Auto Backup</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {config?.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Frequency</p>
                  <p className="text-2xl font-bold text-text-primary capitalize">
                    {config?.frequency || 'Daily'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-primary">Retention</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {config?.retentionDays || 30} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        {showConfig && config && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Backup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                      Enable Auto Backup
                    </label>
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => updateConfig({ enabled: e.target.checked })}
                      className="rounded border-border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-2">
                      Backup Frequency
                    </label>
                    <select
                      value={config.frequency}
                      onChange={(e) => updateConfig({ frequency: e.target.value as any })}
                      className="w-full p-2 border border-border-primary rounded"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-2">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={config.retentionDays}
                      onChange={(e) => updateConfig({ retentionDays: parseInt(e.target.value) })}
                      className="w-full p-2 border border-border-primary rounded"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                      Include Analytics
                    </label>
                    <input
                      type="checkbox"
                      checked={config.includeAnalytics}
                      onChange={(e) => updateConfig({ includeAnalytics: e.target.checked })}
                      className="rounded border-border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                      Include Settings
                    </label>
                    <input
                      type="checkbox"
                      checked={config.includeSettings}
                      onChange={(e) => updateConfig({ includeSettings: e.target.checked })}
                      className="rounded border-border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                      Enable Compression
                    </label>
                    <input
                      type="checkbox"
                      checked={config.compression}
                      onChange={(e) => updateConfig({ compression: e.target.checked })}
                      className="rounded border-border-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backups List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Backup History</CardTitle>
              <Button 
                onClick={handleCleanupBackups}
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Old
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-8">
                <HardDrive className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No backups yet</h3>
                <p className="text-text-secondary mb-4">
                  Create your first backup to start protecting your data.
                </p>
                <Button onClick={handleCreateBackup}>
                  <Download className="w-4 h-4 mr-2" />
                  Create First Backup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border border-border-primary rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                            <Download className="h-5 w-5 text-text-inverse" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-text-primary">
                              Backup {backup.id}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {backup.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(backup.timestamp)}
                            </div>
                            <div className="flex items-center">
                              <HardDrive className="w-4 h-4 mr-1" />
                              {formatBytes(backup.size)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="h-20"
            >
              <div className="text-center">
                <Download className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Create Backup</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => setShowConfig(!showConfig)}
              variant="outline" 
              className="h-20"
            >
              <div className="text-center">
                <Settings className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Configure</span>
              </div>
            </Button>
            
            <Button 
              onClick={handleCleanupBackups}
              variant="outline" 
              className="h-20"
            >
              <div className="text-center">
                <Trash2 className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Cleanup Old</span>
              </div>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
} 
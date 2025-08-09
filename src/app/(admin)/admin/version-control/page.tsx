'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, Span } from '@/ui';
import { History, GitBranch, User, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
interface ContentVersion {
  id: string;
  pageType: string;
  field: string;
  oldValue: any;
  newValue: any;
  author: string;
  authorEmail: string;
  timestamp: Date;
  changes: string[];
  approved: boolean;
  comment?: string;
}

export default function VersionControlPage() {
  const { cmsData } = useCMSData();
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      // TODO: Implement version loading from Firebase
      // For now, show mock data
      const mockVersions: ContentVersion[] = [
        {
          id: '1',
          pageType: 'homepage',
          field: 'hero.title',
          oldValue: 'Welcome to Fairfield Airport Cars',
          newValue: 'Professional Airport Transportation',
          author: 'Admin User',
          authorEmail: 'admin@fairfieldairportcars.com',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          changes: ['Updated hero title'],
          approved: true,
          comment: 'Updated to be more professional'
        },
        {
          id: '2',
          pageType: 'booking',
          field: 'form.pickupLabel',
          oldValue: 'Pickup Location',
          newValue: 'Pickup Address',
          author: 'Admin User',
          authorEmail: 'admin@fairfieldairportcars.com',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          changes: ['Updated pickup label'],
          approved: false,
          comment: 'More descriptive label'
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVersion = async (versionId: string) => {
    try {
      // TODO: Implement approval logic
      alert('Approval functionality not yet implemented');
    } catch (error) {
      console.error('Failed to approve version:', error);
      alert('Failed to approve version');
    }
  };

  const handleRejectVersion = async (versionId: string) => {
    try {
      // TODO: Implement rejection logic
      alert('Rejection functionality not yet implemented');
    } catch (error) {
      console.error('Failed to reject version:', error);
      alert('Failed to reject version');
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to revert to this version?')) {
      return;
    }

    try {
      // TODO: Implement revert logic
      alert('Revert functionality not yet implemented');
    } catch (error) {
      console.error('Failed to revert version:', error);
      alert('Failed to revert version');
    }
  };

  const getChangeType = (oldValue: any, newValue: any) => {
    if (!oldValue && newValue) return 'Added';
    if (oldValue && !newValue) return 'Removed';
    return 'Modified';
  };

  const formatValue = (value: any) => {
    if (typeof value === 'string') {
      return value.length > 50 ? value.substring(0, 50) + '...' : value;
    }
    return JSON.stringify(value).substring(0, 50) + '...';
  };

  if (loading) {
    return (
      
        <Container>
          <Text>
            {getCMSField(cmsData, 'admin.versionControl.loading', 'Loading...')}
          </Text>
        </Container>
      
    );
  }

  return (
    <>
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Header Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.versionControl.actions', 'Version Control')}
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadVersions}
                variant="outline"
              >
                <History size={16} />
                <Span>
                  {getCMSField(cmsData, 'admin.versionControl.refresh', 'Refresh')}
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Version List */}
          <Box variant="elevated" padding="md">
            <H2>
              {getCMSField(cmsData, 'admin.versionControl.history', 'Version History')}
            </H2>
            {versions.length === 0 ? (
              <Text variant="muted" size="sm">
                {getCMSField(cmsData, 'admin.versionControl.noVersions', 'No versions available')}
              </Text>
            ) : (
              <Stack direction="vertical" spacing="sm">
                {versions.map((version) => (
                  <Box key={version.id} variant="elevated" padding="sm">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <GitBranch size={16} />
                      <Stack direction="vertical" spacing="xs">
                        <Text size="sm" weight="semibold">
                          {version.pageType} - {version.field}
                        </Text>
                        <Text size="xs" variant="muted">
                          <User size={12} />
                          <Span> {version.author}</Span>
                          <Span> • </Span>
                          <Calendar size={12} />
                          <Span> {new Date(version.timestamp).toLocaleString()}</Span>
                          <Span> • </Span>
                          <FileText size={12} />
                          <Span> {getChangeType(version.oldValue, version.newValue)}</Span>
                        </Text>
                        {version.comment && (
                          <Text size="xs" variant="muted">
                            "{version.comment}"
                          </Text>
                        )}
                      </Stack>
                      <Stack direction="horizontal" spacing="xs">
                        {version.approved ? (
                          <Span variant="default" size="xs">
                            <CheckCircle size={12} />
                            <Span> Approved</Span>
                          </Span>
                        ) : (
                          <Span variant="default" size="xs">
                            <XCircle size={12} />
                            <Span> Pending</Span>
                          </Span>
                        )}
                        <Button
                          onClick={() => setSelectedVersion(version)}
                          variant="outline"
                          size="sm"
                        >
                          <FileText size={14} />
                          <Span>
                            {getCMSField(cmsData, 'admin.versionControl.view', 'View')}
                          </Span>
                        </Button>
                        {!version.approved && (
                          <>
                            <Button
                              onClick={() => handleApproveVersion(version.id)}
                              variant="primary"
                              size="sm"
                            >
                              <CheckCircle size={14} />
                              <Span>
                                {getCMSField(cmsData, 'admin.versionControl.approve', 'Approve')}
                              </Span>
                            </Button>
                            <Button
                              onClick={() => handleRejectVersion(version.id)}
                              variant="danger"
                              size="sm"
                            >
                              <XCircle size={14} />
                              <Span>
                                {getCMSField(cmsData, 'admin.versionControl.reject', 'Reject')}
                              </Span>
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleRevertVersion(version.id)}
                          variant="outline"
                          size="sm"
                        >
                          <History size={14} />
                          <Span>
                            {getCMSField(cmsData, 'admin.versionControl.revert', 'Revert')}
                          </Span>
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Version Details Modal */}
          {selectedVersion && (
            <Box variant="elevated" padding="md">
              <H2>
                  {getCMSField(cmsData, 'admin.versionControl.details', 'Version Details')}
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.pageType', 'Page Type:')}
                  <Span variant="default"> {selectedVersion.pageType}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.field', 'Field:')}
                  <Span variant="default"> {selectedVersion.field}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.oldValue', 'Old Value:')}
                  <Span variant="default"> {formatValue(selectedVersion.oldValue)}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.newValue', 'New Value:')}
                  <Span variant="default"> {formatValue(selectedVersion.newValue)}</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.author', 'Author:')}
                  <Span variant="default"> {selectedVersion.author} ({selectedVersion.authorEmail})</Span>
                </Text>
                <Text size="sm">
                  {getCMSField(cmsData, 'admin.versionControl.timestamp', 'Timestamp:')}
                  <Span variant="default"> {new Date(selectedVersion.timestamp).toLocaleString()}</Span>
                </Text>
                {selectedVersion.comment && (
                  <Text size="sm">
                    {getCMSField(cmsData, 'admin.versionControl.comment', 'Comment:')}
                    <Span variant="default"> {selectedVersion.comment}</Span>
                  </Text>
                )}
                <Button
                  onClick={() => setSelectedVersion(null)}
                  variant="outline"
                  size="sm"
                >
                  {getCMSField(cmsData, 'admin.versionControl.close', 'Close')}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              {getCMSField(cmsData, 'admin.versionControl.status', 'Last updated:')}
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    </>
  );
} 
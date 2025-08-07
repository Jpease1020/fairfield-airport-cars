'use client';

import { useState, useEffect } from 'react';
import { Container, H2, Text, Button, Stack, Box, EditableText, Span } from '@/ui';
import { AdminPageWrapper } from '@/components/app';
import { History, GitBranch, User, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';

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
      <AdminPageWrapper
        title="Version Control"
        subtitle="Loading version history..."
      >
        <Container>
          <Text>
            <EditableText field="admin.versionControl.loading" defaultValue="Loading...">
              Loading...
            </EditableText>
          </Text>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Version Control"
      subtitle="Track and manage content changes"
    >
      <Container>
        <Stack direction="vertical" spacing="lg">
          {/* Header Actions */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.versionControl.actions" defaultValue="Version Control">
                Version Control
              </EditableText>
            </H2>
            <Stack direction="horizontal" spacing="sm">
              <Button
                onClick={loadVersions}
                variant="outline"
              >
                <History size={16} />
                <Span>
                  <EditableText field="admin.versionControl.refresh" defaultValue="Refresh">
                    Refresh
                  </EditableText>
                </Span>
              </Button>
            </Stack>
          </Box>

          {/* Version List */}
          <Box variant="elevated" padding="md">
            <H2>
              <EditableText field="admin.versionControl.history" defaultValue="Version History">
                Version History
              </EditableText>
            </H2>
            {versions.length === 0 ? (
              <Text variant="muted" size="sm">
                <EditableText field="admin.versionControl.noVersions" defaultValue="No versions available">
                  No versions available
                </EditableText>
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
                            <EditableText field="admin.versionControl.view" defaultValue="View">
                              View
                            </EditableText>
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
                                <EditableText field="admin.versionControl.approve" defaultValue="Approve">
                                  Approve
                                </EditableText>
                              </Span>
                            </Button>
                            <Button
                              onClick={() => handleRejectVersion(version.id)}
                              variant="danger"
                              size="sm"
                            >
                              <XCircle size={14} />
                              <Span>
                                <EditableText field="admin.versionControl.reject" defaultValue="Reject">
                                  Reject
                                </EditableText>
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
                            <EditableText field="admin.versionControl.revert" defaultValue="Revert">
                              Revert
                            </EditableText>
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
                <EditableText field="admin.versionControl.details" defaultValue="Version Details">
                  Version Details
                </EditableText>
              </H2>
              <Stack direction="vertical" spacing="sm">
                <Text size="sm">
                  <EditableText field="admin.versionControl.pageType" defaultValue="Page Type:">
                    Page Type:
                  </EditableText>
                  <Span variant="default"> {selectedVersion.pageType}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.versionControl.field" defaultValue="Field:">
                    Field:
                  </EditableText>
                  <Span variant="default"> {selectedVersion.field}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.versionControl.oldValue" defaultValue="Old Value:">
                    Old Value:
                  </EditableText>
                  <Span variant="default"> {formatValue(selectedVersion.oldValue)}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.versionControl.newValue" defaultValue="New Value:">
                    New Value:
                  </EditableText>
                  <Span variant="default"> {formatValue(selectedVersion.newValue)}</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.versionControl.author" defaultValue="Author:">
                    Author:
                  </EditableText>
                  <Span variant="default"> {selectedVersion.author} ({selectedVersion.authorEmail})</Span>
                </Text>
                <Text size="sm">
                  <EditableText field="admin.versionControl.timestamp" defaultValue="Timestamp:">
                    Timestamp:
                  </EditableText>
                  <Span variant="default"> {new Date(selectedVersion.timestamp).toLocaleString()}</Span>
                </Text>
                {selectedVersion.comment && (
                  <Text size="sm">
                    <EditableText field="admin.versionControl.comment" defaultValue="Comment:">
                      Comment:
                    </EditableText>
                    <Span variant="default"> {selectedVersion.comment}</Span>
                  </Text>
                )}
                <Button
                  onClick={() => setSelectedVersion(null)}
                  variant="outline"
                  size="sm"
                >
                  <EditableText field="admin.versionControl.close" defaultValue="Close">
                    Close
                  </EditableText>
                </Button>
              </Stack>
            </Box>
          )}

          {/* Status */}
          <Box variant="elevated" padding="sm">
            <Text size="sm" variant="muted">
              <EditableText field="admin.versionControl.status" defaultValue="Last updated:">
                Last updated:
              </EditableText>
              <Span> {new Date().toLocaleString()}</Span>
            </Text>
          </Box>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
} 

import type { NextPage } from 'next';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { Card, CardContent } from '@/components/ui/card';

const CancelPage: NextPage = () => {
  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader title="Payment Canceled" />
      <PageContent>
        <Card>
          <CardContent className="p-8 text-center">
            <Alert variant="error" title="Payment Canceled">
              Your payment was canceled. Please try again.
            </Alert>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default CancelPage;

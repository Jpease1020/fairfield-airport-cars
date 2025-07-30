'use client';

import { useEffect, useState } from 'react';
import PageCommentWidget from './PageCommentWidget';

const CommentWidgetWrapper = () => {
  const [pageInfo, setPageInfo] = useState({
    url: '/',
    title: 'Admin Page'
  });

  useEffect(() => {
    setPageInfo({
      url: window.location.pathname,
      title: document.title
    });
  }, []);

  return (
    <PageCommentWidget 
      pageUrl={pageInfo.url}
      pageTitle={pageInfo.title}
      isAdmin={true}
    />
  );
};

export default CommentWidgetWrapper; 
import React from "react";
import { GroupedSource } from "../lib/api";

type Props = {
  items: GroupedSource[];
};

export default function SourcesList({ items }: Props) {
  if (!items || items.length === 0) return null;
  
  // Debug: log the items to see what we're working with
  console.log('SourcesList items:', items);
  console.log('Detailed sources structure:', JSON.stringify(items, null, 2));
  
  // Log each source individually for better debugging
  items.forEach((source, index) => {
    console.log(`Source ${index}:`, {
      title: source.title,
      url: source.url,
      document: source.document,
      text: source.text,
      pages: source.pages,
      links: source.links
    });
  });
  
  // Helper function to generate document URL
  const getDocumentUrl = (source: GroupedSource) => {
    // Try new structure first (document.rel_path)
    if (source.document?.rel_path) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      console.log('Processing document.rel_path:', source.document.rel_path);
      
      // Remove 'data/' prefix if it already exists in rel_path
      const cleanPath = source.document.rel_path.startsWith('data/') 
        ? source.document.rel_path 
        : `data/${source.document.rel_path}`;
      
      const finalUrl = `${apiBase}/${cleanPath}`;
      console.log('Generated document URL:', finalUrl);
      return finalUrl;
    }
    
    // Fallback to old structure (url)
    if (source.url) {
      if (source.url.startsWith('http://') || source.url.startsWith('https://')) {
        return source.url;
      }
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      return `${apiBase}${source.url.startsWith('/') ? '' : '/'}${source.url}`;
    }
    
    return null;
  };

  // Helper function to get document title
  const getDocumentTitle = (source: GroupedSource) => {
    return source.document?.title || source.title || 'Документ';
  };

  // Helper function to get document type
  const getDocumentType = (source: GroupedSource) => {
    return source.document?.doc_type || 'Документ';
  };

  return (
    <div className="sources-list">
      <span className="sources-title">Источники:</span>
      <div className="sources-items-inline">
        {items.map((source, index) => {
          const documentUrl = getDocumentUrl(source);
          const documentTitle = getDocumentTitle(source);
          const documentType = getDocumentType(source);
          
          return (
            <span key={index}>
              {documentUrl ? (
                <a 
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link-inline"
                  title={`Открыть ${documentTitle}`}
                >
                  {documentTitle} ({documentType})
                </a>
              ) : (
                <span className="source-link-disabled-inline" title="URL недоступен">
                  {documentTitle} ({documentType})
                </span>
              )}
              {index < items.length - 1 && <span className="sources-separator">, </span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { getCollectionExportUrl, triggerAttachmentDownload } from '@/lib/api/exports';

interface ExportCollectionButtonProps {
  collectionId: number;
  collectionName?: string;
  className?: string;
}

export function ExportCollectionButton({
  collectionId,
  collectionName = 'Collection',
  className = '',
}: ExportCollectionButtonProps) {
  const handleExport = () => {
    const downloadUrl = getCollectionExportUrl(collectionId);
    const fileName = `${collectionName}.csv`;
    triggerAttachmentDownload(downloadUrl, fileName);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors border border-zinc-700/60 ${className}`}
    >
      <Download className="w-4 h-4 text-emerald-400" />
      Export CSV
    </button>
  );
}

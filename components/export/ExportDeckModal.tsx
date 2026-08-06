'use client';

import React, { useState } from 'react';
import { X, Download, FileCode, FileSpreadsheet, FileText, Check } from 'lucide-react';
import {
  type DeckExportFormat,
  getDeckExportUrl,
  triggerAttachmentDownload,
} from '@/lib/api/exports';

interface ExportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number | string;
  deckName: string;
}

interface FormatOption {
  format: DeckExportFormat;
  label: string;
  extension: string;
  description: string;
  icon: React.ReactNode;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'txt',
    label: 'Text (.txt)',
    extension: 'txt',
    description: 'Plain text card quantities and names, ideal for simple sharing',
    icon: <FileText className="w-5 h-5 text-blue-400" />,
  },
  {
    format: 'csv',
    label: 'CSV (.csv)',
    extension: 'csv',
    description: 'Tabular CSV format suitable for spreadsheet applications',
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
  },
  {
    format: 'json',
    label: 'JSON (.json)',
    extension: 'json',
    description: 'Structured JSON data with full card properties & metadata',
    icon: <FileCode className="w-5 h-5 text-amber-400" />,
  },
  {
    format: 'mtgo',
    label: 'MTGO (.dek)',
    extension: 'dek',
    description: 'XML deck file format formatted for Magic Online client',
    icon: <Download className="w-5 h-5 text-purple-400" />,
  },
  {
    format: 'arena',
    label: 'MTG Arena',
    extension: 'txt',
    description: 'Standard MTG Arena import text format with set codes',
    icon: <FileText className="w-5 h-5 text-orange-400" />,
  },
  {
    format: 'cod',
    label: 'Cockatrice (.cod)',
    extension: 'cod',
    description: 'XML deck layout compatible with Cockatrice virtual desktop',
    icon: <FileCode className="w-5 h-5 text-cyan-400" />,
  },
];

export function ExportDeckModal({ isOpen, onClose, deckId, deckName }: ExportDeckModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<DeckExportFormat>('txt');

  if (!isOpen) return null;

  const currentOption = FORMAT_OPTIONS.find((opt) => opt.format === selectedFormat) || FORMAT_OPTIONS[0];

  const handleDownload = () => {
    const downloadUrl = getDeckExportUrl(Number(deckId), selectedFormat);
    const fileName = `${deckName}.${currentOption.extension}`;
    triggerAttachmentDownload(downloadUrl, fileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export Deck: {deckName}</h2>
              <p className="text-xs text-zinc-400">Select export format for plain GET download</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = selectedFormat === opt.format;
            return (
              <button
                key={opt.format}
                type="button"
                onClick={() => setSelectedFormat(opt.format)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-950'
                }`}
              >
                <div className="mt-0.5">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Export
          </button>
        </div>
      </div>
    </div>
  );
}

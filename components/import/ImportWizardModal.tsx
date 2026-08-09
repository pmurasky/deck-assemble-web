'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  uploadImportPreview,
  commitImport,
  getImportErrorsDownloadUrl,
  type ImportPreviewResult,
} from '@/lib/api/imports';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'decks' | 'collections';
  onImportSuccess?: () => void;
}

export function ImportWizardModal({
  isOpen,
  onClose,
  targetType,
  onImportSuccess,
}: ImportWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [deckName, setDeckName] = useState('');
  const [formatCode, setFormatCode] = useState('COMMANDER');

  // Preview state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Review step selections
  const [excludedLineNumbers, setExcludedLineNumbers] = useState<number[]>([]);
  const [selectedPrintings, setSelectedPrintings] = useState<Record<number, number>>({});

  // Commit state
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [isCommitLoading, setIsCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [errorsUrl, setErrorsUrl] = useState<string | null>(null);

  const maxRows = targetType === 'decks' ? 500 : 5000;

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setFile(null);
      setDeckName('');
      setFormatCode('COMMANDER');
      setPreviewData(null);
      setPreviewError(null);
      setExcludedLineNumbers([]);
      setSelectedPrintings({});
      setCommitError(null);
      setErrorsUrl(null);
    }
  }

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewError(null);
      if (selectedFile.size > 1024 * 1024) {
        setPreviewError('File size exceeds maximum size of 1 MiB limit');
      }
    }
  };

  const handleUploadPreview = async () => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setPreviewError('File size exceeds maximum size of 1 MiB limit');
      return;
    }

    setIsPreviewLoading(true);
    setPreviewError(null);

    try {
      const data = await uploadImportPreview(file, targetType);
      setPreviewData(data);
      if (data.totalRows > maxRows) {
        setPreviewError(`File exceeds maximum row limit of ${maxRows} rows`);
      } else {
        setStep(2);
      }
    } catch (err: unknown) {
      const errObj = err as Error & { status?: number };
      if (errObj.status === 413) {
        setPreviewError(`File size exceeds 1 MiB or row count limit (${maxRows} rows)`);
      } else {
        setPreviewError(errObj.message || 'Failed to parse import preview');
      }
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const toggleExcludeRow = (lineNumber: number) => {
    setExcludedLineNumbers((prev) =>
      prev.includes(lineNumber) ? prev.filter((l) => l !== lineNumber) : [...prev, lineNumber]
    );
  };

  const handleSelectPrinting = (lineNumber: number, printingId: number) => {
    setSelectedPrintings((prev) => ({ ...prev, [lineNumber]: printingId }));
  };

  const handleProceedToCommit = async () => {
    if (!previewData) return;

    // Check unresolved rows without exclusion
    const unresolvedRows = previewData.rows.filter(
      (r) => r.status !== 'resolved' && !excludedLineNumbers.includes(r.lineNumber) && !selectedPrintings[r.lineNumber]
    );

    if (unresolvedRows.length > 0) {
      setCommitError(`There are ${unresolvedRows.length} unresolved row(s). Please exclude them or select a printing before committing.`);
      setStep(2);
      return;
    }

    setIsCommitLoading(true);
    setCommitError(null);

    try {
      const res = await commitImport({
        previewToken: previewData.previewToken,
        excludedLineNumbers,
        selectedPrintings,
        deckName: deckName || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Imported Deck'),
        formatCode,
        idempotencyKey: idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'idemp-session'),
        targetType,
      });

      if (res.errorsUrl || res.failedCount > 0) {
        setErrorsUrl(getImportErrorsDownloadUrl(previewData.previewToken, targetType));
      }
      setStep(3);
      if (onImportSuccess) onImportSuccess();
    } catch (err: unknown) {
      const errObj = err as Error & { status?: number };
      if (errObj.status === 404) {
        setCommitError('Import preview session expired after 30 minutes. Please re-upload your file.');
        setStep(1);
      } else if (errObj.status === 409) {
        setCommitError('Idempotency key conflict: this import has already been committed.');
      } else if (errObj.status === 400) {
        setCommitError(errObj.message || 'Invalid format or unresolved rows present without exclusion.');
      } else {
        setCommitError(errObj.message || 'Failed to commit import');
      }
    } finally {
      setIsCommitLoading(false);
    }
  };

  const resolvedCount = previewData?.rows.filter((r) => r.status === 'resolved' || selectedPrintings[r.lineNumber]).length ?? 0;
  const ambiguousCount = previewData?.rows.filter((r) => r.status === 'ambiguous' && !selectedPrintings[r.lineNumber]).length ?? 0;
  const unmatchedCount = previewData?.rows.filter((r) => r.status === 'unmatched').length ?? 0;
  const invalidCount = previewData?.rows.filter((r) => r.status === 'invalid').length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 text-zinc-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold capitalize">Import {targetType}</h2>
              <p className="text-xs text-zinc-400">
                Upload card list (TXT, CSV) to bulk import into your {targetType === 'decks' ? 'decks' : 'collection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>1</span>
            <span className="text-sm">Upload File</span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-purple-600' : 'bg-zinc-800'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>2</span>
            <span className="text-sm">Review & Resolve</span>
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-purple-600' : 'bg-zinc-800'}`} />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>3</span>
            <span className="text-sm">Commit</span>
          </div>
        </div>

        {/* Global / Step Error Alert */}
        {(previewError || commitError) && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-xs text-red-300/90">{previewError || commitError}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-zinc-300">Step 1: Upload File</p>

            {targetType === 'decks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Deck Name</label>
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="e.g. Atraxa Proliferation"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Format Code (Default: COMMANDER)</label>
                  <select
                    value={formatCode}
                    onChange={(e) => setFormatCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="COMMANDER">COMMANDER</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="MODERN">MODERN</option>
                    <option value="PIONEER">PIONEER</option>
                    <option value="PAUPER">PAUPER</option>
                    <option value="LEGACY">LEGACY</option>
                  </select>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-2xl p-8 text-center bg-zinc-950/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                data-testid="import-file-input"
                accept=".txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-12 h-12 text-zinc-500 mb-3" />
                <span className="text-sm font-semibold text-purple-400 hover:underline">
                  {file ? file.name : 'Click to upload or drag & drop card list'}
                </span>
                <span className="text-xs text-zinc-500 mt-2">
                  Supports .txt and .csv formats. Max file size 1 MiB, {maxRows} rows limit for {targetType}.
                </span>
              </label>
            </div>

            {targetType === 'collections' && (
              <p className="text-xs text-zinc-500">
                Note: Imported collection rows will set regular card quantity with foil quantity default to 0.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadPreview}
                disabled={!file || isPreviewLoading}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {isPreviewLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing File...
                  </>
                ) : (
                  <>
                    Preview File
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Resolve */}
        {step === 2 && previewData && (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-zinc-300">Step 2: Review & Resolve</p>

            {/* Totals Summary Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 block">Total Rows</span>
                <span className="text-lg font-bold text-white">{previewData.totalRows}</span>
              </div>
              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40 text-center">
                <span className="text-xs text-emerald-400 block">Resolved</span>
                <span className="text-lg font-bold text-emerald-300">{resolvedCount}</span>
              </div>
              <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40 text-center">
                <span className="text-xs text-amber-400 block">Ambiguous</span>
                <span className="text-lg font-bold text-amber-300">{ambiguousCount}</span>
              </div>
              <div className="bg-red-950/30 p-3 rounded-xl border border-red-800/40 text-center">
                <span className="text-xs text-red-400 block">Unmatched / Invalid</span>
                <span className="text-lg font-bold text-red-300">{unmatchedCount + invalidCount}</span>
              </div>
            </div>

            {/* Parsed Rows List */}
            <div className="max-h-64 overflow-y-auto space-y-2 border border-zinc-800 rounded-xl p-3 bg-zinc-950/60">
              {previewData.rows.map((row) => {
                const isExcluded = excludedLineNumbers.includes(row.lineNumber);
                return (
                  <div
                    key={row.lineNumber}
                    className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      isExcluded
                        ? 'bg-zinc-900/40 border-zinc-800 opacity-50'
                        : row.status === 'resolved' || selectedPrintings[row.lineNumber]
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                        : row.status === 'ambiguous'
                        ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                        : 'bg-red-950/20 border-red-900/40 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`exclude-${row.lineNumber}`}
                        data-testid={`exclude-row-${row.lineNumber}`}
                        checked={isExcluded}
                        onChange={() => toggleExcludeRow(row.lineNumber)}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`exclude-${row.lineNumber}`} className="cursor-pointer">
                        <span className="font-mono text-zinc-500 mr-2">#{row.lineNumber}</span>
                        <span className="font-medium text-white">{row.rawText}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {row.status === 'ambiguous' && row.candidatePrintingIds && row.candidatePrintingIds.length > 0 && !isExcluded && (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-xs">Printing:</span>
                          <select
                            value={selectedPrintings[row.lineNumber] || ''}
                            onChange={(e) => handleSelectPrinting(row.lineNumber, Number(e.target.value))}
                            className="bg-zinc-900 border border-amber-700/50 text-white rounded px-2 py-1 text-xs"
                          >
                            <option value="">Select candidate...</option>
                            {row.candidatePrintingIds.map((pid) => (
                              <option key={pid} value={pid}>
                                Printing #{pid}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded">
                        {isExcluded ? 'Excluded' : row.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToCommit}
                disabled={isCommitLoading}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {isCommitLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing...
                  </>
                ) : (
                  <>
                    Proceed to Commit
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Commit & Summary */}
        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">Import Successful!</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Your cards have been successfully imported into your {targetType === 'decks' ? 'deck' : 'collection'}.
              </p>
            </div>

            {errorsUrl && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-left">
                <p className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Some rows failed to import
                </p>
                <a
                  href={errorsUrl}
                  download="import_errors.csv"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  Download Errors CSV
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

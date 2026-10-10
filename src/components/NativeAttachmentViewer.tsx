import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Copy,
  Printer,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Lock,
  Unlock,
  Eye,
  FileCode,
  Table as TableIcon,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { OpportunityAttachment, SAMOpportunity } from '../types/contract';
import { generateAttachmentContent, downloadAttachment } from '../utils/attachmentDownloader';
import { generateAttachmentPdfBlob } from '../utils/pdfGenerator';
import { getSafeSamGovUrl } from '../utils/samUrlHelper';

interface NativeAttachmentViewerProps {
  attachment: OpportunityAttachment;
  opportunity: SAMOpportunity;
  onClose: () => void;
  onDownloadSingle?: (att: OpportunityAttachment) => void;
}

export const NativeAttachmentViewer: React.FC<NativeAttachmentViewerProps> = ({
  attachment,
  opportunity,
  onClose,
  onDownloadSingle,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(true);
  const [spreadsheetSearch, setSpreadsheetSearch] = useState('');

  // Determine file type
  const isPdf = attachment.name.toLowerCase().endsWith('.pdf') || attachment.type?.toUpperCase() === 'PDF';
  const isSpreadsheet =
    attachment.name.toLowerCase().includes('xlsx') ||
    attachment.name.toLowerCase().includes('rate') ||
    attachment.name.toLowerCase().includes('csv') ||
    attachment.type?.toUpperCase() === 'XLSX';
  const isControlled =
    attachment.isPublic === false ||
    attachment.accessLevel?.toLowerCase().includes('controlled') ||
    attachment.accessLevel?.toLowerCase().includes('cui');

  // Default view mode:
  // - If PDF -> 'native-pdf'
  // - If spreadsheet -> 'spreadsheet'
  // - Else -> 'executive-doc'
  const defaultMode: 'native-pdf' | 'executive-doc' | 'spreadsheet' | 'plain-text' = isSpreadsheet
    ? 'spreadsheet'
    : isPdf
    ? 'native-pdf'
    : 'executive-doc';

  const [viewMode, setViewMode] = useState<'native-pdf' | 'executive-doc' | 'spreadsheet' | 'plain-text'>(
    defaultMode
  );

  // Raw text content
  const rawContent = useMemo(() => {
    return generateAttachmentContent(attachment, opportunity);
  }, [attachment, opportunity]);

  // Generate real PDF Blob
  useEffect(() => {
    let active = true;
    let url: string | null = null;

    try {
      setIsGeneratingPdf(true);
      const blob = generateAttachmentPdfBlob(attachment, opportunity);
      url = URL.createObjectURL(blob);
      if (active) {
        setPdfBlobUrl(url);
        setIsGeneratingPdf(false);
      }
    } catch (err) {
      console.error('Failed to generate PDF blob:', err);
      if (active) {
        setIsGeneratingPdf(false);
      }
    }

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [attachment, opportunity]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy document content:', err);
    }
  };

  // Download native file (either PDF blob or custom download)
  const handleDownload = () => {
    if (onDownloadSingle) {
      onDownloadSingle(attachment);
    } else {
      downloadAttachment(attachment, opportunity);
    }
  };

  // Direct PDF Download
  const handleDownloadPdf = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    let filename = attachment.name;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = filename.replace(/\.[^/.]+$/, '') + '.pdf';
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Native Print
  const handlePrint = () => {
    if (viewMode === 'native-pdf' && pdfBlobUrl) {
      const iframe = document.getElementById('native-pdf-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          return;
        } catch {
          // Fallback to window.open
        }
      }
      window.open(pdfBlobUrl, '_blank');
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>${attachment.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 18px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px; }
            pre { font-family: monospace; white-space: pre-wrap; font-size: 11px; background: #f8fafc; padding: 16px; border: 1px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <h1>Federal Solicitation ${opportunity.solicitationNumber} - ${attachment.name}</h1>
          <pre>${rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  // Parsed spreadsheet rows for .xlsx / .csv preview
  const spreadsheetData = useMemo(() => {
    const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
    const csvLines = lines.filter((l) => l.includes(',') && !l.startsWith('===') && !l.startsWith('TOTAL'));
    if (csvLines.length === 0) return null;

    const headers = csvLines[0].split(',').map((h) => h.trim());
    const rows = csvLines.slice(1).map((line) => line.split(',').map((c) => c.trim()));

    return { headers, rows };
  }, [rawContent]);

  const filteredRows = useMemo(() => {
    if (!spreadsheetData) return [];
    if (!spreadsheetSearch.trim()) return spreadsheetData.rows;
    const term = spreadsheetSearch.toLowerCase();
    return spreadsheetData.rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(term))
    );
  }, [spreadsheetData, spreadsheetSearch]);

  return (
    <div
      className={`fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center transition-all ${
        isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div
        className={`bg-slate-900 border border-slate-700 text-white flex flex-col shadow-2xl overflow-hidden transition-all duration-150 ${
          isMaximized
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-5xl h-[92vh] rounded-2xl animate-in fade-in zoom-in-95'
        }`}
      >
        {/* HEADER BAR */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* File Information */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`p-2 rounded-xl flex items-center justify-center shrink-0 border ${
                isSpreadsheet
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : isPdf
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}
            >
              {isSpreadsheet ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md" title={attachment.name}>
                  {attachment.name}
                </h3>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 uppercase border ${
                    isPdf
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      : isSpreadsheet
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                  }`}
                >
                  {attachment.type || (isPdf ? 'PDF' : isSpreadsheet ? 'XLSX' : 'DOC')}
                </span>
                {isControlled ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-900/60 text-amber-300 border border-amber-600/60 flex items-center gap-1 shrink-0">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Controlled SOW</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-600/60 flex items-center gap-1 shrink-0">
                    <Unlock className="w-2.5 h-2.5" />
                    <span>Public Notice</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{attachment.size}</span>
                <span>•</span>
                <span className="font-mono text-cyan-300">{opportunity.solicitationNumber}</span>
                <span>•</span>
                <span className="text-slate-400 truncate max-w-[220px] sm:max-w-xs">{opportunity.title}</span>
              </p>
            </div>
          </div>

          {/* View Mode Switcher Toolbar */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            {/* Native PDF Plugin Mode */}
            <button
              type="button"
              onClick={() => setViewMode('native-pdf')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'native-pdf'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="View in native browser PDF plugin viewer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Native PDF Plug-in</span>
            </button>

            {/* Executive Document View */}
            <button
              type="button"
              onClick={() => setViewMode('executive-doc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'executive-doc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="View formatted federal document layout"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Formatted Document</span>
            </button>

            {/* Spreadsheet Grid Mode */}
            {spreadsheetData && (
              <button
                type="button"
                onClick={() => setViewMode('spreadsheet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'spreadsheet'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="View interactive spreadsheet data grid"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Spreadsheet Grid</span>
              </button>
            )}

            {/* Raw Text View */}
            <button
              type="button"
              onClick={() => setViewMode('plain-text')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'plain-text'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="View raw plain text / notepad mode"
            >
              <FileCode className="w-3 h-3" />
              <span className="hidden sm:inline">Text</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Open in New Window / Tab (PDF) */}
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition"
                title="Open PDF in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="Copy document text to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={isPdf && pdfBlobUrl ? handleDownloadPdf : handleDownload}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                isPdf
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : isSpreadsheet
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isPdf ? 'Download PDF' : 'Download'}</span>
            </button>

            {/* Maximize */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore window size' : 'Expand full screen'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTROLLED NOTICE BANNER */}
        {isControlled && (
          <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200 gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Controlled Defense SOW:</strong> Original source package requires an approved electronic access request on SAM.gov with active CAGE code.
              </span>
            </div>
            <a
              href={getSafeSamGovUrl(opportunity)}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
            >
              <span>Request on SAM.gov</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* VIEWER BODY CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950 relative">
          {/* MODE 1: NATIVE PDF PLUG-IN VIEWER */}
          {viewMode === 'native-pdf' && (
            <div className="w-full h-full flex flex-col relative bg-slate-900">
              {isGeneratingPdf ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-white">Rendering Native Federal PDF Artifact...</p>
                  <p className="text-xs text-slate-400 mt-1">Generating official layout with DOD/Agency headers and formatted tables</p>
                </div>
              ) : pdfBlobUrl ? (
                <div className="w-full h-full relative flex-col flex">
                  {/* Embedded Native Browser PDF Plugin */}
                  <iframe
                    id="native-pdf-iframe"
                    src={`${pdfBlobUrl}#view=FitH&toolbar=1&navpanes=1`}
                    className="w-full h-full border-0 bg-slate-800"
                    title={attachment.name}
                  />

                  {/* Plugin Info Overlay Bar */}
                  <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Native Browser PDF Plugin Active (Zoom, Thumbnails, Print & Save supported)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('executive-doc')}
                        className="hover:text-blue-300 underline cursor-pointer"
                      >
                        Switch to Formatted Executive Document
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <p className="text-sm text-rose-400">Unable to load native PDF stream.</p>
                  <button
                    type="button"
                    onClick={() => setViewMode('executive-doc')}
                    className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Switch to Formatted Document View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: FORMATTED EXECUTIVE GOVERNMENT DOCUMENT VIEW */}
          {viewMode === 'executive-doc' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-900/60">
              <div className="max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-200 overflow-hidden">
                {/* Government Header Banner */}
                <div className="bg-slate-950 text-white px-6 py-5 border-b-4 border-blue-600">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-[11px] tracking-widest font-semibold uppercase text-blue-400">
                          UNITED STATES FEDERAL ACQUISITION SYSTEM
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {attachment.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                        </h2>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                        {opportunity.solicitationNumber}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        SAM.gov Procurement Artifact
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department / Agency</span>
                    <strong className="text-slate-800">{opportunity.department}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">NAICS Code</span>
                    <strong className="text-slate-800">{opportunity.naicsCode}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Set-Aside Category</span>
                    <strong className="text-slate-800">{opportunity.setAside}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Response Due</span>
                    <strong className="text-rose-700">{new Date(opportunity.responseDeadLine).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Document Body */}
                <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-800 leading-relaxed">
                  {/* Mission / Objective Card */}
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-blue-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Contract Scope & Mission Objective</span>
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {opportunity.description}
                    </p>
                  </div>

                  {/* Specific Deliverables List */}
                  {opportunity.scopeBullets && opportunity.scopeBullets.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                        Performance Tasks & Deliverables
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {opportunity.scopeBullets.map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {idx + 1}
                            </span>
                            <span className="text-slate-800 font-medium leading-relaxed">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory FAR Clauses */}
                  {opportunity.keyFarClauses && opportunity.keyFarClauses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                        Key Governing FAR Clauses
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {opportunity.keyFarClauses.map((clause, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-blue-700 text-[11px]">{clause.clause}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">FAR</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-[11px]">{clause.title}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-2">{clause.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contracting Officer Block */}
                  <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Authorized Contracting Officer</span>
                      <strong className="text-slate-900 text-sm">{opportunity.poc.name}</strong>
                      <p className="text-slate-600 text-[11px]">{opportunity.poc.title} • {opportunity.office}</p>
                    </div>
                    <div className="text-right">
                      <a href={`mailto:${opportunity.poc.email}`} className="text-blue-600 font-medium hover:underline block text-[11px]">
                        {opportunity.poc.email}
                      </a>
                      <span className="text-slate-600 text-[11px]">{opportunity.poc.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Official Federal Solicitation Package • SAM.gov</span>
                  <span>Sol #{opportunity.solicitationNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: SPREADSHEET DATA GRID VIEWER */}
          {viewMode === 'spreadsheet' && spreadsheetData && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
              {/* Spreadsheet Control Bar */}
              <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={spreadsheetSearch}
                    onChange={(e) => setSpreadsheetSearch(e.target.value)}
                    placeholder="Search labor categories, CLINs, rates..."
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
                  />
                  {spreadsheetSearch && (
                    <button
                      type="button"
                      onClick={() => setSpreadsheetSearch('')}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>
                    Rows: <strong className="text-white">{filteredRows.length}</strong> of {spreadsheetData.rows.length}
                  </span>
                  <span>•</span>
                  <span>
                    Est. Total: <strong className="text-emerald-400 font-mono">{opportunity.estimatedValue || 'Ceiling Matrix'}</strong>
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto p-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold text-[10px]">
                        <th className="p-3 w-12 text-center text-slate-500">#</th>
                        {spreadsheetData.headers.map((h, i) => (
                          <th key={i} className="p-3 whitespace-nowrap font-bold text-slate-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {filteredRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-900/60 transition group cursor-default"
                        >
                          <td className="p-3 text-center text-slate-500 text-[10px]">{rIdx + 1}</td>
                          {row.map((cell, cIdx) => {
                            const isCurrency = cell.startsWith('$');
                            const isHours = !isNaN(Number(cell.replace(/,/g, ''))) && Number(cell.replace(/,/g, '')) > 50;
                            return (
                              <td
                                key={cIdx}
                                className={`p-3 whitespace-nowrap ${
                                  isCurrency
                                    ? 'text-emerald-400 font-bold'
                                    : isHours
                                    ? 'text-cyan-300'
                                    : cIdx === 0
                                    ? 'font-bold text-white'
                                    : 'text-slate-300 font-sans'
                                }`}
                              >
                                {cell}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: RAW TEXT / NOTEPAD MODE */}
          {viewMode === 'plain-text' && (
            <div className="flex-1 overflow-y-auto p-5 bg-slate-950/80 font-mono text-xs text-slate-200 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{rawContent}</pre>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Official Government Procurement Document</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="text-slate-400 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer text-xs font-medium"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

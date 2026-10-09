import React, { useState } from 'react';
import { 
  Kanban, 
  Sparkles, 
  FileText, 
  Trash2, 
  Clock, 
  DollarSign, 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  PlusCircle,
  Tag
} from 'lucide-react';
import { PipelineItem, PipelineStatus, SAMOpportunity, BidStrategy } from '../types/contract';

interface PipelineTrackerViewProps {
  pipeline: PipelineItem[];
  onUpdateStatus: (id: string, newStatus: PipelineStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemoveItem: (id: string) => void;
  onOpenStrategy: (opp: SAMOpportunity, existingStrategy?: BidStrategy) => void;
  onNavigateToCanvass: () => void;
}

const STAGES: PipelineStatus[] = [
  'Identified',
  'Assessing (Bid/No-Bid)',
  'Strategy Developed',
  'Proposal In Progress',
  'Submitted',
  'Won',
];

export const PipelineTrackerView: React.FC<PipelineTrackerViewProps> = ({
  pipeline,
  onUpdateStatus,
  onUpdateNotes,
  onRemoveItem,
  onOpenStrategy,
  onNavigateToCanvass,
}) => {
  const [selectedNoteItem, setSelectedNoteItem] = useState<PipelineItem | null>(null);
  const [noteText, setNoteText] = useState('');

  const openNoteEditor = (item: PipelineItem) => {
    setSelectedNoteItem(item);
    setNoteText(item.notes || '');
  };

  const saveNotes = () => {
    if (selectedNoteItem) {
      onUpdateNotes(selectedNoteItem.id, noteText);
      setSelectedNoteItem(null);
    }
  };

  if (pipeline.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Kanban className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Your Bid Pipeline is Empty</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Canvass active SAM.gov solicitations and click <strong>"Pipeline"</strong> to track opportunities, generate custom business plans, and manage proposal milestones.
        </p>
        <button
          onClick={onNavigateToCanvass}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 mx-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Canvass Active Solicitations</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-600" />
            <span>SBA Federal Capture & Bid Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track active pursuits from SAM.gov identification to proposal submission and contract award.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">
            Total Tracked: <strong className="text-blue-600 font-mono text-sm">{pipeline.length}</strong>
          </span>
          <button
            onClick={onNavigateToCanvass}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition cursor-pointer"
          >
            + Add More Bids
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const itemsInStage = pipeline.filter((item) => item.status === stage);

          return (
            <div
              key={stage}
              className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[260px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 truncate" title={stage}>
                  {stage}
                </span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 border border-slate-300 text-[10px] font-bold font-mono flex items-center justify-center">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Column Items */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh]">
                {itemsInStage.map((item) => {
                  const opp = item.opportunity;
                  const deadline = new Date(opp.responseDeadLine);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition text-xs space-y-2"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded truncate max-w-[120px]">
                          {opp.solicitationNumber}
                        </span>
                        <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {item.fitScore}% Fit
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onOpenStrategy(opp, item.bidStrategy)}
                        className="font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition cursor-pointer leading-snug"
                        title={opp.title}
                      >
                        {opp.title}
                      </h4>

                      {/* Agency & Value */}
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p className="truncate">{opp.department}</p>
                        <p className="font-semibold text-emerald-700">{opp.estimatedValue}</p>
                      </div>

                      {/* Due date countdown */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Due: {deadline.toLocaleDateString()}</span>
                      </div>

                      {/* Notes / Plan status */}
                      {item.bidStrategy && (
                        <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100 text-[10px] text-emerald-800 font-medium flex items-center justify-between">
                          <span>✓ Plan Created ({item.bidStrategy.recommendation})</span>
                          <span className="font-mono font-bold">{item.bidStrategy.pWinScore}% P-Win</span>
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenStrategy(opp, item.bidStrategy)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Open Strategy & Business Plan"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openNoteEditor(item)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Remove from pipeline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Move stage dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value as PipelineStatus)}
                          className="text-[10px] py-0.5 px-1 bg-slate-50 border border-slate-300 rounded text-slate-700 cursor-pointer"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {itemsInStage.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg">
                    No active bids
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Editor Modal */}
      {selectedNoteItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Pipeline Notes for {selectedNoteItem.opportunity.solicitationNumber}
            </h3>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Scheduled pre-bid conference for Thursday; need to find 8(a) teaming partner for cyber testing..."
              className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedNoteItem(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

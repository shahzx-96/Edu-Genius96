import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  FolderPlus,
  Trash2,
  Edit2,
  Folder,
  FileText,
  Award,
  Camera,
  MessageSquare,
  ChevronRight,
  X,
  Check,
  Database,
  Wifi,
  WifiOff,
  Sparkles,
  Clock,
  HardDrive,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LatexRenderer } from '../common/LatexRenderer';
import { CachedStudyMaterial, SavedItem } from '../../types';

export const SavedContentScreen: React.FC = () => {
  const {
    savedItems,
    updateSavedItem,
    deleteSavedItem,
    subjectsList,
    addSubject,
    renameSubject,
    isOnline,
    simulateOffline,
    toggleSimulateOffline,
    cachedMaterials,
    offlineStats,
    deleteCachedStudyMaterial,
    clearAllOfflineCache,
  } = useApp();

  // Active Main Tab: 'saved' or 'indexeddb'
  const [viewMode, setViewMode] = useState<'saved' | 'indexeddb'>('saved');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SavedItem | CachedStudyMaterial | null>(null);

  // Subject management state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [renamingSubjectOld, setRenamingSubjectOld] = useState<string | null>(null);
  const [renamingSubjectNew, setRenamingSubjectNew] = useState('');

  // Item edit state
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [itemNewTitle, setItemNewTitle] = useState('');

  // Filter regular saved items
  const filteredSavedItems = savedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectFilter === 'All' || item.subject === selectedSubjectFilter;
    const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;

    return matchesSearch && matchesSubject && matchesType;
  });

  // Filter IndexedDB cached materials
  const filteredCachedMaterials = cachedMaterials.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.module && item.module.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubjectFilter === 'All' || item.subject === selectedSubjectFilter;
    const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;

    return matchesSearch && matchesSubject && matchesType;
  });

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubName.trim()) {
      addSubject(newSubName.trim());
      setNewSubName('');
      setShowAddSubject(false);
    }
  };

  const handleRenameSubjectSubmit = (oldName: string) => {
    if (renamingSubjectNew.trim()) {
      renameSubject(oldName, renamingSubjectNew.trim());
      setRenamingSubjectOld(null);
      setRenamingSubjectNew('');
    }
  };

  const startRenameItem = (item: SavedItem) => {
    setRenamingItemId(item.id);
    setItemNewTitle(item.title);
  };

  const saveRenameItem = (id: string) => {
    if (itemNewTitle.trim()) {
      updateSavedItem(id, { title: itemNewTitle.trim() });
      if (activeItem && activeItem.id === id) {
        setActiveItem({ ...activeItem, title: itemNewTitle.trim() });
      }
    }
    setRenamingItemId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'exam_answer':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'photo_solution':
        return <Camera className="w-4 h-4 text-purple-500" />;
      case 'pdf_summary':
        return <HardDrive className="w-4 h-4 text-rose-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title & Network Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Saved & Offline Academic Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your notes, solutions, and exam answers with zero internet dependency via IndexedDB.
          </p>
        </div>

        {/* Network & Simulation Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulateOffline}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors border ${
              simulateOffline || !isOnline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}
            title="Toggle offline simulation to test IndexedDB access"
          >
            {simulateOffline || !isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Online (IndexedDB Ready)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline Status Alert Banner */}
      {(simulateOffline || !isOnline) && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">IndexedDB Offline Mode Active:</span>{' '}
              <span>
                You are browsing recently generated study materials and notes cached locally. No internet required.
              </span>
            </div>
          </div>
          <button
            onClick={() => setViewMode('indexeddb')}
            className="px-2 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px] shrink-0"
          >
            View Cache
          </button>
        </div>
      )}

      {/* Main Mode Toggle: Saved Bookmarks vs IndexedDB Offline Cache */}
      <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center gap-1">
        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'saved'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Bookmarks ({savedItems.length})</span>
        </button>

        <button
          onClick={() => setViewMode('indexeddb')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'indexeddb'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>IndexedDB Cache ({cachedMaterials.length})</span>
        </button>
      </div>

      {/* IndexedDB Storage Quota Strip (when on IndexedDB view) */}
      {viewMode === 'indexeddb' && (
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                EduGenius IndexedDB Offline Store
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {offlineStats.totalItems} study items cached · ~{formatBytes(offlineStats.estimatedBytes)} storage used
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllOfflineCache}
              className="px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-medium transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            viewMode === 'indexeddb'
              ? 'Search offline cached notes, solutions, formulas...'
              : 'Search saved titles, concepts, equations...'
          }
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Subject Folders Horizontal Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Filter by Subject:</span>
          {viewMode === 'saved' && (
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          )}
        </div>

        {/* Add Subject Modal / Inline Box */}
        {showAddSubject && (
          <form
            onSubmit={handleAddSubjectSubmit}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-2"
          >
            <input
              type="text"
              required
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="New Subject Name (e.g. Artificial Intelligence)"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowAddSubject(false)}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSubjectFilter('All')}
            className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
              selectedSubjectFilter === 'All'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Subjects
          </button>

          {subjectsList.map((subj) => {
            const isSelected = selectedSubjectFilter === subj;

            return (
              <button
                key={subj}
                onClick={() => setSelectedSubjectFilter(subj)}
                className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{subj}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: SAVED BOOKMARKS */}
      {viewMode === 'saved' && (
        <div className="space-y-2">
          {filteredSavedItems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No saved items found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Items bookmarked from Chat, Photo Solver, Notes, or Exam Answers will appear here.
              </p>
            </div>
          ) : (
            filteredSavedItems.map((item) => {
              const isEditing = renamingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => setActiveItem(item)}
                      className="flex items-start gap-2.5 flex-1 cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 mt-0.5 shrink-0">
                        {getTypeIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={itemNewTitle}
                              onChange={(e) => setItemNewTitle(e.target.value)}
                              className="px-2 py-1 text-xs rounded-lg border border-purple-500 bg-white dark:bg-slate-900 w-full"
                            />
                            <button
                              onClick={() => saveRenameItem(item.id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-purple-600">
                            {item.title}
                          </h3>
                        )}

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">{item.subject}</span>
                          {item.module && (
                            <>
                              <span>·</span>
                              <span className="truncate">{item.module}</span>
                            </>
                          )}
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ IndexedDB Cached</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startRenameItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Rename Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSavedItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: INDEXEDDB OFFLINE LIBRARY */}
      {viewMode === 'indexeddb' && (
        <div className="space-y-2">
          {filteredCachedMaterials.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Database className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No study materials currently in IndexedDB
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate any notes, exam answers, photo solutions, or summaries—they will auto-cache here automatically.
              </p>
            </div>
          ) : (
            filteredCachedMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => setActiveItem(material)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500/50 cursor-pointer transition-all shadow-xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 mt-0.5 shrink-0">
                    {getTypeIcon(material.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600">
                        {material.title}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                        Offline Ready
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {material.previewSnippet || material.content.slice(0, 140)}
                    </p>

                    <div className="text-[10px] text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {material.subject}
                      </span>
                      {material.module && (
                        <>
                          <span>·</span>
                          <span className="truncate">{material.module}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        Cached {new Date(material.cachedAt).toLocaleDateString()}
                      </span>
                      {material.offlineAccessCount !== undefined && material.offlineAccessCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-purple-500 font-mono">
                            Read {material.offlineAccessCount}x offline
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveItem(material)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Read Cached Material"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCachedStudyMaterial(material.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Remove from Offline Cache"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Item Viewer Modal (Works 100% Offline with KaTeX LaTeX math rendering) */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                    {activeItem.subject} {activeItem.module ? `· ${activeItem.module}` : ''}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    IndexedDB Offline
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content view with LaTeX (KaTeX runs 100% locally on device) */}
            <div className="flex-1 overflow-y-auto py-4">
              <LatexRenderer content={activeItem.content} />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Available without internet connection
              </span>
              <button
                onClick={() => setActiveItem(null)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

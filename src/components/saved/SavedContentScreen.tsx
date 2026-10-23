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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LatexRenderer } from '../common/LatexRenderer';
import { SavedItem } from '../../types';

export const SavedContentScreen: React.FC = () => {
  const {
    savedItems,
    updateSavedItem,
    deleteSavedItem,
    subjectsList,
    addSubject,
    renameSubject,
    deleteSubject,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SavedItem | null>(null);

  // Subject management state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [renamingSubjectOld, setRenamingSubjectOld] = useState<string | null>(null);
  const [renamingSubjectNew, setRenamingSubjectNew] = useState('');

  // Item edit state
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [itemNewTitle, setItemNewTitle] = useState('');

  // Filter items
  const filteredItems = savedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

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

  const getTypeIcon = (type: SavedItem['type']) => {
    switch (type) {
      case 'notes':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'exam_answer':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'photo_solution':
        return <Camera className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Saved Academic Content
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organized study materials, solutions, notes, and exam answers with local offline caching.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubject(!showAddSubject)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-500 transition-colors shadow-xs"
        >
          <FolderPlus className="w-3.5 h-3.5 text-purple-600" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Add Subject Modal / Inline Box */}
      {showAddSubject && (
        <form onSubmit={handleAddSubjectSubmit} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-2">
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved titles, concepts, equations..."
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
          <span>Subjects Folders:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSubjectFilter('All')}
            className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
              selectedSubjectFilter === 'All'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Subjects ({savedItems.length})
          </button>

          {subjectsList.map((subj) => {
            const count = savedItems.filter((i) => i.subject === subj).length;
            const isSelected = selectedSubjectFilter === subj;

            if (renamingSubjectOld === subj) {
              return (
                <div key={subj} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={renamingSubjectNew}
                    onChange={(e) => setRenamingSubjectNew(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-purple-500 bg-white dark:bg-slate-800 w-32"
                  />
                  <button
                    onClick={() => handleRenameSubjectSubmit(subj)}
                    className="p-1 text-emerald-500"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setRenamingSubjectOld(null)} className="p-1 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div key={subj} className="relative group shrink-0">
                <button
                  onClick={() => setSelectedSubjectFilter(subj)}
                  className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>{subj}</span>
                  <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No saved items found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Items bookmarked from Chat, Photo Solver, Notes, or Exam Answers will appear here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
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
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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

      {/* Item Viewer Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  {activeItem.subject} {activeItem.module ? `· ${activeItem.module}` : ''}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content view with LaTeX */}
            <div className="flex-1 overflow-y-auto py-4">
              <LatexRenderer content={activeItem.content} />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Saved on {new Date(activeItem.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => setActiveItem(null)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium"
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

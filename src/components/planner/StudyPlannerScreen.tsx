import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Bell,
  BellOff,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyPlan } from '../../services/api';
import { PriorityLevel } from '../../types';

export const StudyPlannerScreen: React.FC = () => {
  const {
    user,
    language,
    subjects,
    tasks,
    addStudySubject,
    deleteStudySubject,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    toggleTaskReminder,
    notificationPermissionGranted,
    requestNotificationPermission,
    incrementAiUsage,
  } = useApp();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubExamDate, setNewSubExamDate] = useState('2026-11-15');
  const [newSubPriority, setNewSubPriority] = useState<PriorityLevel>('High');

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubId, setNewTaskSubId] = useState(subjects[0]?.id || '');
  const [newTaskDuration, setNewTaskDuration] = useState(60);

  const [dailyHours, setDailyHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [reminderAlert, setReminderAlert] = useState<string | null>(null);

  // Overall progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate days left
  const getDaysLeft = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleGenerateAIPlan = async () => {
    if (subjects.length === 0) return;
    setLoading(true);

    try {
      const res = await generateStudyPlan({
        subjects,
        dailyHours,
        language: user?.preferredLanguage || language,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.plan) {
        setPlanSummary(res.plan.summary);
        // Add generated tasks
        if (res.plan.tasks && res.plan.tasks.length > 0) {
          res.plan.tasks.forEach((t) => {
            const taskSub = (t as any).subject || t.subjectName;
            const matchedSub = subjects.find((s) => s.name === taskSub) || subjects[0];
            addTask({
              subjectId: matchedSub ? matchedSub.id : 'sub-gen',
              subjectName: taskSub || (matchedSub ? matchedSub.name : 'General'),
              title: t.title,
              date: t.date || new Date().toISOString().split('T')[0],
              durationMinutes: t.durationMinutes || 60,
              priority: (t.priority as PriorityLevel) || 'Medium',
              completed: false,
              reminderEnabled: true,
            });
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (taskId: string) => {
    if (!notificationPermissionGranted) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setReminderAlert('POST_NOTIFICATIONS permission denied. Please allow notifications in system settings to receive study alarms.');
        setTimeout(() => setReminderAlert(null), 4000);
        return;
      }
    }
    toggleTaskReminder(taskId);
    setReminderAlert('Reminder alarm scheduled successfully.');
    setTimeout(() => setReminderAlert(null), 2500);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    addStudySubject(newSubName, newSubExamDate, newSubPriority);
    setNewSubName('');
    setShowAddSubject(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const selectedSub = subjects.find((s) => s.id === newTaskSubId) || subjects[0];
    addTask({
      subjectId: selectedSub ? selectedSub.id : 'sub-custom',
      subjectName: selectedSub ? selectedSub.name : 'General',
      title: newTaskTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: newTaskDuration,
      priority: selectedSub ? selectedSub.priority : 'Medium',
      completed: false,
      reminderEnabled: true,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Smart Study Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent revision timelines calculated from your exam dates, priorities, and daily study capacity.
          </p>
        </div>

        <button
          onClick={handleGenerateAIPlan}
          disabled={loading || subjects.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Planning...' : 'AI Auto-Plan'}</span>
        </button>
      </div>

      {/* Reminder Alert Message (when permission denied or scheduled) */}
      {reminderAlert && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{reminderAlert}</span>
        </div>
      )}

      {/* Overall Progress Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Completion Mastery</span>
          </div>
          <span className="font-mono text-sm font-extrabold text-indigo-400">{overallPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{completedTasks} completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>
      </div>

      {/* Plan Summary if generated */}
      {planSummary && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
          <span className="font-bold block mb-1">AI Strategic Recommendation:</span>
          <p className="leading-relaxed">{planSummary}</p>
        </div>
      )}

      {/* Subjects & Exam Dates Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Examination Calendar ({subjects.length})
          </span>
          <button
            onClick={() => setShowAddSubject(!showAddSubject)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Add Subject Modal Form */}
        {showAddSubject && (
          <form onSubmit={handleAddSubjectSubmit} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <input
              type="text"
              required
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Subject Name (e.g. Compiler Design)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Exam Date</label>
                <input
                  type="date"
                  required
                  value={newSubExamDate}
                  onChange={(e) => setNewSubExamDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                <select
                  value={newSubPriority}
                  onChange={(e) => setNewSubPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSubject(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Save Subject
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {subjects.map((s) => {
            const daysLeft = getDaysLeft(s.examDate);
            const subTasks = tasks.filter((t) => t.subjectId === s.id);
            const subCompleted = subTasks.filter((t) => t.completed).length;
            const subPercent = subTasks.length > 0 ? Math.round((subCompleted / subTasks.length) * 100) : 0;

            return (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        s.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : s.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Exam: {s.examDate}</span>
                    <span>·</span>
                    <span>Progress: {subPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                    {daysLeft}d left
                  </span>
                  <button
                    onClick={() => deleteStudySubject(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Study Tasks Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Daily Study Schedule ({tasks.length} Tasks)
          </span>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Add task inline form */}
        {showAddTask && (
          <form onSubmit={handleAddTaskSubmit} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task description (e.g. Solve 5 problems on Laplace)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Subject</label>
                <select
                  value={newTaskSubId}
                  onChange={(e) => setNewTaskSubId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Duration (mins)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="px-2.5 py-1 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Tasks list */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No tasks scheduled yet. Click "AI Auto-Plan" or "Add Task" to populate your study queue.
            </p>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  t.completed
                    ? 'bg-slate-50/60 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/60'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div
                  onClick={() => toggleTaskCompletion(t.id)}
                  className="flex items-start gap-2.5 flex-1 cursor-pointer pr-2"
                >
                  <button className="mt-0.5 text-slate-400 shrink-0">
                    {t.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-500" />
                    )}
                  </button>
                  <div>
                    <div
                      className={`text-xs font-medium leading-snug ${
                        t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.subjectName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.durationMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleReminder(t.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      t.reminderEnabled
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t.reminderEnabled ? 'Reminder Alarm Active' : 'Enable Reminder Alarm'}
                  >
                    {t.reminderEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

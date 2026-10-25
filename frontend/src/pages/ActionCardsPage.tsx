import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Calendar,
  Filter,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { ActionCard } from '../types';

export const ActionCardsPage: React.FC = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [cards, setCards] = useState<ActionCard[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Card Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    loadCards();
  }, [filterStatus]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActionCards(filterStatus === 'All' ? undefined : filterStatus);
      setCards(data);
    } catch (err) {
      console.warn('Could not load action cards', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createActionCard({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        priority: newPriority,
        status: 'Not Started',
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      });
      setCards((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (card: ActionCard) => {
    const nextStatus = card.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      const updated = await api.updateActionCard(card.id, { status: nextStatus });
      setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)));

      if (nextStatus === 'Completed') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        speak(`Task marked complete: ${card.title}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteActionCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout
      title="Smart Action Cards"
      subtitle="Intelligent task management converting recommendations and opportunities into daily progress."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="glass-panel p-5 rounded-3xl border-primary-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['All', 'Not Started', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-electric-purple text-white shadow-glow'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border/40'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Action Card</span>
          </button>
        </div>

        {/* Modal for creating card */}
        {showCreateModal && (
          <form
            onSubmit={handleCreate}
            className="glass-panel p-6 rounded-3xl border-primary-border/50 shadow-2xl space-y-4"
          >
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-cyan" />
              New Smart Action Card
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-content-secondary">Action Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Gather identity documents for National Scholarship Portal"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-content-secondary">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-content-secondary">Description / Context</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add details, links, or requirements"
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-content-secondary">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl glass-panel text-xs text-content-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-electric-purple text-white text-xs font-bold shadow-glow"
              >
                Save Action Card
              </button>
            </div>
          </form>
        )}

        {/* Action Cards Grid */}
        {cards.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl border-primary-border/30 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-content-muted mx-auto" />
            <h4 className="text-base font-bold text-white">No Action Cards In This Category</h4>
            <p className="text-xs text-content-secondary max-w-sm mx-auto">
              Create a new action card or use the Barrier-to-Bridge solver to automatically generate personalized tasks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => {
              const isCompleted = card.status === 'Completed';
              return (
                <div
                  key={card.id}
                  className={`glass-panel p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isCompleted
                      ? 'border-status-success/40 bg-status-success/[0.02]'
                      : 'border-primary-border/40 glass-panel-hover'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          card.priority === 'High'
                            ? 'bg-status-error/15 text-status-error border border-status-error/30'
                            : card.priority === 'Medium'
                            ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                            : 'bg-white/10 text-content-secondary'
                        }`}
                      >
                        {card.priority} Priority
                      </span>

                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1 text-content-muted hover:text-status-error transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStatus(card)}
                        className="mt-0.5 transition-transform active:scale-90"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-status-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-content-muted hover:text-electric-cyan" />
                        )}
                      </button>
                      <div>
                        <h5 className={`text-sm font-bold leading-snug ${isCompleted ? 'line-through text-content-muted' : 'text-white'}`}>
                          {card.title}
                        </h5>
                        {card.description && (
                          <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-primary-border/20 flex items-center justify-between text-[11px] text-content-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{card.status}</span>
                    </div>

                    {card.due_date && (
                      <span className="flex items-center gap-1 text-electric-cyan">
                        <Calendar className="w-3 h-3" />
                        {new Date(card.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

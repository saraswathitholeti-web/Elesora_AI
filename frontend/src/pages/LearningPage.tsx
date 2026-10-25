import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Award,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';

export const LearningPage: React.FC = () => {
  const { language, speak } = useAccessibility();

  const [topicInput, setTopicInput] = useState('Neural Networks & Deep Learning');
  const [level, setLevel] = useState('Beginner');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<any | null>(null);

  // Quiz state
  const [quiz, setQuiz] = useState<any | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsExplaining(true);
    setQuiz(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await api.explainTopic(topicInput.trim(), level, language);
      setExplanation(res);
      speak(res.simple_analogy);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topicInput.trim()) return;

    setIsGeneratingQuiz(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await api.generateQuiz(topicInput.trim(), 3, language);
      setQuiz(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleQuizSubmit = () => {
    if (!quiz?.questions) return;

    let score = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (selectedAnswers[i] === q.correct_option_index) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === quiz.questions.length) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      speak(`Outstanding! Perfect score: ${score} out of ${quiz.questions.length}`);
    } else {
      speak(`Quiz finished: you scored ${score} out of ${quiz.questions.length}. Keep learning!`);
    }

    // Save learning progress
    api.updateLearningProgress({
      topic: topicInput,
      progress_percentage: Math.round((score / quiz.questions.length) * 100),
      completed_lesson: `Quiz on ${topicInput}`,
    });
  };

  return (
    <DashboardLayout
      title="Smart Learning Hub"
      subtitle="AI-powered topic explanations, analogies, and dynamic knowledge-check quizzes in your language."
    >
      <div className="space-y-8">
        {/* Topic Input Box */}
        <form onSubmit={handleExplain} className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-electric-purple" />
            <span>AI Interactive Tutor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Topic or Concept to Master</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Asynchronous JavaScript, Backpropagation, REST APIs"
                required
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-5 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-electric-cyan"
              >
                <option value="Beginner">Beginner (Intuitive Analogies)</option>
                <option value="Intermediate">Intermediate (Core Engineering)</option>
                <option value="Advanced">Advanced (System Scale & Edge Cases)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isExplaining}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {isExplaining ? 'Crafting Lesson...' : 'Explain Topic'}
            </button>
          </div>
        </form>

        {/* Explanation Output */}
        {explanation && (
          <div className="space-y-6">
            {/* Analogy Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border-electric-cyan/40 bg-gradient-to-r from-electric-cyan/10 via-transparent to-electric-purple/10 space-y-3">
              <span className="text-xs font-extrabold uppercase text-electric-cyan tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-electric-purple" />
                The Simple Real-World Analogy
              </span>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{explanation.simple_analogy}"
              </p>
            </div>

            {/* Core Concepts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(explanation.core_concepts || []).map((c: any, idx: number) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-electric-purple/20 text-electric-purple flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    {c.concept}
                  </h5>
                  <p className="text-xs text-content-secondary leading-relaxed">{c.explanation}</p>
                </div>
              ))}
            </div>

            {/* Practical Example & Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
                <span className="text-xs font-bold uppercase text-status-success tracking-wider">
                  Practical Hands-On Application
                </span>
                <p className="text-xs text-content-secondary leading-relaxed bg-primary-card/50 p-4 rounded-xl border border-primary-border/30">
                  {explanation.practical_example}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
                <span className="text-xs font-bold uppercase text-status-warning tracking-wider">
                  Key Takeaways
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-content-secondary">
                  {(explanation.key_takeaways || []).map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quiz CTA Banner */}
            <div className="glass-panel p-6 rounded-3xl border-primary-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Test Your Understanding</h4>
                <p className="text-xs text-content-secondary mt-1">
                  Ready to verify what you learned? Generate a dynamic 3-question assessment.
                </p>
              </div>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-50 shrink-0"
              >
                {isGeneratingQuiz ? 'Building Quiz...' : 'Generate Interactive Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Quiz Card */}
        {quiz && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 space-y-6">
            <div className="flex items-center justify-between border-b border-primary-border/30 pb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-electric-cyan" />
                  Quick Assessment: {quiz.topic}
                </h4>
                <p className="text-xs text-content-secondary mt-0.5">
                  Select the best option for each question. Immediate feedback will be displayed.
                </p>
              </div>

              {quizSubmitted && (
                <div className="px-4 py-1.5 rounded-full bg-status-success/20 text-status-success border border-status-success/30 font-bold text-xs">
                  Score: {quizScore} / {quiz.questions.length}
                </div>
              )}
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {quiz.questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-bold text-white flex items-start gap-2">
                    <span className="text-electric-purple font-extrabold">{qIdx + 1}.</span>
                    <span>{q.question}</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = q.correct_option_index === optIdx;
                      let btnStyle = 'glass-panel text-content-secondary hover:text-white border-primary-border/40';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-status-success/20 border-status-success text-status-success font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-status-error/20 border-status-error text-status-error line-through';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-electric-purple text-white border-electric-purple shadow-glow font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`p-3 rounded-2xl text-xs text-left border transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-primary-card/50 border border-primary-border/30 text-xs text-content-secondary">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Quiz Button */}
            {!quizSubmitted ? (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                  className="px-6 py-2.5 rounded-xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-40"
                >
                  Submit Quiz & Record Score
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  className="px-6 py-2.5 rounded-xl bg-primary-card border border-primary-border text-white text-xs font-bold hover:border-electric-cyan"
                >
                  Retake with Fresh Questions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

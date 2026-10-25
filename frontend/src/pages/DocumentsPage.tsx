import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Send,
  Trash2,
  Sparkles,
  Globe,
  Clock,
  ListChecks,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { DocumentItem, DocumentAnalysis, Language } from '../types';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, speak } = useAccessibility();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Q&A
  const [questionText, setQuestionText] = useState('');
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string; page?: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      loadDocumentAnalysis(selectedDocId);
    }
  }, [selectedDocId, language]);

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err) {
      console.warn('Could not load documents', err);
    }
  };

  const loadDocumentAnalysis = async (docId: string) => {
    setIsAnalyzing(true);
    try {
      // First check if analysis already exists, otherwise analyze
      try {
        const existing = await api.getDocumentAnalysis(docId);
        setAnalysis(existing);
      } catch {
        const generated = await api.analyzeDocument(docId, language);
        setAnalysis(generated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploaded = await api.uploadDocument(file);
      setDocuments((prev) => [uploaded, ...prev]);
      setSelectedDocId(uploaded.id);

      // Trigger analysis immediately
      setIsAnalyzing(true);
      const ana = await api.analyzeDocument(uploaded.id, language);
      setAnalysis(ana);
      speak(`Document ${file.name} uploaded and analyzed successfully.`);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      const remaining = documents.filter((d) => d.id !== id);
      setDocuments(remaining);
      if (selectedDocId === id) {
        if (remaining.length > 0) setSelectedDocId(remaining[0].id);
        else {
          setSelectedDocId(null);
          setAnalysis(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedDocId || isAsking) return;

    const q = questionText.trim();
    setQuestionText('');
    setIsAsking(true);

    try {
      const res = await api.askDocumentQuestion(selectedDocId, q, language);
      setQaHistory((prev) => [...prev, { question: q, answer: res.answer, page: res.cited_page }]);
      speak(res.answer);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <DashboardLayout
      title="Document Intelligence Engine"
      subtitle="Simplifies dense government circulars, scholarship rules, and academic admissions in English, Telugu, and Hindi."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Document Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upload Dropzone */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 text-center relative overflow-hidden group">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              aria-label="Upload document"
            />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-electric-purple/10 border border-electric-purple/30 flex items-center justify-center text-electric-purple mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isUploading ? 'Uploading & Extracting Text...' : 'Click or Drag Document Here'}
                </p>
                <p className="text-[10px] text-content-muted mt-1">
                  Supports PDF, DOCX, TXT, JPG, PNG (Max 15MB)
                </p>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/30 text-status-error text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Uploaded Documents List */}
          <div className="glass-panel p-4 rounded-3xl border-primary-border/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted px-2">
              My Documents ({documents.length})
            </h4>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <p className="text-xs text-content-muted p-4 text-center">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer transition-all ${
                      selectedDocId === doc.id
                        ? 'bg-electric-purple/20 border border-electric-purple text-white font-semibold'
                        : 'glass-panel text-content-secondary hover:text-white border-primary-border/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <FileText className="w-4 h-4 text-electric-cyan shrink-0" />
                      <div className="truncate">
                        <p className="truncate font-medium">{doc.file_name}</p>
                        <p className="text-[10px] text-content-muted">
                          {(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-1 text-content-muted hover:text-status-error transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Q&A Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!activeDoc ? (
            <div className="glass-panel p-12 rounded-3xl border-primary-border/40 text-center space-y-4">
              <FileText className="w-12 h-12 text-content-muted mx-auto" />
              <h3 className="text-base font-bold text-white">Select or Upload a Document</h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto">
                Upload scholarship notifications, syllabus PDFs, or admission forms to get instant multilingual plain-language breakdowns.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="glass-panel p-12 rounded-3xl border-primary-border/40 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-electric-cyan animate-spin mx-auto" />
              <h4 className="text-base font-bold text-white">Analyzing '{activeDoc.file_name}'</h4>
              <p className="text-xs text-content-secondary">
                Gemini is extracting deadlines, eligibility criteria, and required documents in {language}...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="glass-panel p-6 rounded-3xl border-primary-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{activeDoc.file_name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-status-success/10 text-status-success border border-status-success/30">
                      Analyzed
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary mt-1">
                    Language: <strong className="text-electric-cyan">{analysis?.language || language}</strong>
                  </p>
                </div>

                {/* Change translation language */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-electric-cyan" />
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as Language;
                      setLanguage(newLang);
                      loadDocumentAnalysis(activeDoc.id);
                    }}
                    className="bg-primary-bg text-white border border-primary-border/50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="English">Translate to English</option>
                    <option value="Telugu">Translate to తెలుగు</option>
                    <option value="Hindi">Translate to हिंदी</option>
                  </select>
                </div>
              </div>

              {/* Summary & Simplified Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-electric-purple tracking-wider">
                    Executive Summary
                  </span>
                  <p className="text-xs text-content-primary leading-relaxed">
                    {analysis?.summary || 'Document details official guidelines and eligibility criteria.'}
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
                  <span className="text-xs uppercase font-extrabold text-electric-cyan tracking-wider">
                    Plain-Language Explanation
                  </span>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {analysis?.simplified_text || 'We have converted the complex requirements into accessible language.'}
                  </p>
                </div>
              </div>

              {/* Extracted Key Information (Deadlines, Eligibility, Documents) */}
              <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-electric-cyan" />
                  Extracted Critical Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Deadlines */}
                  <div className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2">
                    <span className="font-bold text-status-warning flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Important Dates
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-content-secondary">
                      {(analysis?.extracted_information?.deadlines || ['Review application closing date']).map(
                        (d, i) => (
                          <li key={i}>{d}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Eligibility */}
                  <div className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2">
                    <span className="font-bold text-electric-purple flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Eligibility Criteria
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-content-secondary">
                      {(analysis?.extracted_information?.eligibility_requirements || [
                        'Enrolled student status',
                      ]).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents */}
                  <div className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2">
                    <span className="font-bold text-status-success flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Required Certificates
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-content-secondary">
                      {(analysis?.extracted_information?.required_documents || [
                        'Identity & Academic proof',
                      ]).map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Warnings banner */}
                {analysis?.extracted_information?.warnings && (
                  <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/30 text-status-error text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Warning:</strong> {analysis.extracted_information.warnings.join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Plan Checklist */}
              {analysis?.action_plan && analysis.action_plan.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-electric-purple" />
                    Step-by-Step Action Checklist
                  </h4>
                  <div className="space-y-2">
                    {analysis.action_plan.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-primary-card/40 border border-primary-border/30 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-electric-purple/20 text-electric-purple font-bold flex items-center justify-center text-[10px]">
                            {item.step}
                          </span>
                          <span className="text-content-primary font-medium">{item.task}</span>
                        </div>
                        {item.deadline && (
                          <span className="text-content-muted text-[11px]">{item.deadline}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Q&A Section */}
              <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-electric-cyan" />
                  Ask Any Question About This Document
                </h4>

                {/* Q&A History */}
                {qaHistory.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {qaHistory.map((qa, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-primary-card/50 border border-primary-border/30 text-xs space-y-1">
                        <p className="font-bold text-electric-cyan">Q: {qa.question}</p>
                        <p className="text-content-primary leading-relaxed">A: {qa.answer}</p>
                        {qa.page && <p className="text-[10px] text-content-muted">Source: {qa.page}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Ask Form */}
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. What is the family income limit for this scholarship?"
                    className="flex-1 bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !questionText.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-40"
                  >
                    {isAsking ? 'Searching...' : 'Ask AI'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

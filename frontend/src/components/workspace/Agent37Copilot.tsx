import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  FileSearch,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Send,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useOrbitStore } from '../../store/useOrbitStore';
import {
  triageExcerptWithAgent37,
  chatWithAgent37,
  getAgent37Status,
  Agent37Candidate,
  Agent37TriageResponse,
  Agent37StatusResponse,
} from '../../api/agent37';
import styles from './Agent37Copilot.module.css';

interface Agent37CopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const Agent37Copilot: React.FC<Agent37CopilotProps> = ({ isOpen, onClose }) => {
  const activeMissionId = useOrbitStore((state) => state.activeMissionId);
  const addEvidenceItem = useOrbitStore((state) => state.addEvidenceItem);

  const [activeTab, setActiveTab] = useState<'triage' | 'chat'>('triage');
  const [status, setStatus] = useState<Agent37StatusResponse | null>(null);

  // Triage state
  const [excerpt, setExcerpt] = useState(
    'Asteria-3 Mission Specification: Spacecraft wet mass is 180.5 kg. Operating at perigee altitude of 520 km. Post-mission disposal duration is 4.5 years via atmospheric drag.'
  );
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<Agent37TriageResponse | null>(null);
  const [importedIndices, setImportedIndices] = useState<Record<number, boolean>>({});

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'Hello, I am the OrbitScore Mission Assistant powered by Agent 37 Cloud (Hermes agent). Ask me about orbital debris guidelines, FCC 5-year rules, or NASA-STD-8719.14 requirements.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Poll status on mount or open
  useEffect(() => {
    if (isOpen) {
      getAgent37Status().then((s) => setStatus(s));
    }
  }, [isOpen]);

  // Isolate Copilot state per mission: reset triage, imports, and chat session when mission switches
  useEffect(() => {
    setTriageResult(null);
    setImportedIndices({});
    setSessionId(null);
  }, [activeMissionId]);

  // Handle ESC key and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunTriage = async () => {
    if (!excerpt.trim() || isTriaging) return;
    setIsTriaging(true);
    setTriageResult(null);
    setImportedIndices({});

    try {
      const result = await triageExcerptWithAgent37(
        excerpt.trim(),
        'workspace_triage_box',
        activeMissionId
      );
      setTriageResult(result);
    } catch (err) {
      console.error('Agent37 triage error:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleImportCandidate = (cand: Agent37Candidate, idx: number) => {
    if (!activeMissionId) return;

    let category: any = 'general';
    if (cand.field.includes('mass')) category = 'mass_properties';
    else if (cand.field.includes('disposal') || cand.field.includes('orbit') || cand.field.includes('altitude')) {
      category = 'orbit_lifetime';
    } else if (cand.field.includes('casualty')) category = 'general';

    addEvidenceItem(activeMissionId, {
      parameter_key: cand.field,
      label: cand.field.replace(/_/g, ' ').toUpperCase(),
      category,
      value: cand.value,
      unit: cand.unit || undefined,
      value_type: typeof cand.value === 'number' ? 'numeric' : 'string',
      source_doc_title: '[UNVERIFIED MODEL DRAFT] AI Quote Extraction',
      source_doc_ref: `draft_ai_quote:unverified_locator`,
      source_doc_date: new Date().toISOString().split('T')[0] ?? '2026-10-24',
      locator: cand.exact_quote,
      state: 'unconfirmed',
      notes: `[UNVERIFIED MODEL DRAFT] Extracted via Agent37 (${triageResult?.provider || 'agent37_cloud'}). Uncertainty: ${cand.uncertainty}. INVARIANT: Must be verified against a real, hashed primary source before engineering confirmation.`,
    });

    setImportedIndices((prev) => ({ ...prev, [idx]: true }));
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await chatWithAgent37(textToSend, sessionId, activeMissionId);
      if (res.session_id) setSessionId(res.session_id);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: res.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: `Error connecting to Agent 37: ${(err as Error).message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const isOnline = status?.status === 'ONLINE' || status?.enabled;

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Agent 37 Copilot">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.brandIcon} aria-hidden="true">
              <Bot size={20} />
            </div>
            <div>
              <h2 className={styles.title}>
                Agent 37 Copilot
                <span className={styles.instanceBadge}>z2dhn46l7d</span>
              </h2>
              <div className={styles.statusIndicator}>
                <span className={isOnline ? styles.pulseDot : styles.pulseDotOffline} />
                <span>
                  {isOnline ? 'Agent37 Cloud (Hermes) · Online' : 'Agent37 Cloud · Connecting...'}
                  {status?.latency_ms && ` (${status.latency_ms}ms)`}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close Agent 37 Copilot"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'triage'}
            className={`${styles.tabBtn} ${activeTab === 'triage' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('triage')}
          >
            <FileSearch size={15} />
            Evidence Triage
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={15} />
            Mission Assistant
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.content}>
          {/* Bounded Safety Governance Notice */}
          <div className={styles.governanceBanner}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Bounded AI Sandbox</strong>: Agent 37 extracts candidate values and answers
              reference questions, but has zero authority to approve compliance or certify missions.
              Human engineering sign-off remains mandatory.
            </div>
          </div>

          {activeTab === 'triage' ? (
            <>
              {/* Preset selection */}
              <div>
                <div className={styles.sectionLabel}>Quick Excerpt Presets</div>
                <div className={styles.presetChips}>
                  <button
                    type="button"
                    className={styles.presetChip}
                    onClick={() =>
                      setExcerpt(
                        'Asteria-3 Mission Specification: Spacecraft wet mass is 180.5 kg. Operating at perigee altitude of 520 km. Post-mission disposal duration is 4.5 years via atmospheric drag.'
                      )
                    }
                  >
                    Asteria-3 Spec (4.5 yr disposal)
                  </button>
                  <button
                    type="button"
                    className={styles.presetChip}
                    onClick={() =>
                      setExcerpt(
                        'Microsat-X Propulsion Dossier: Spacecraft dry mass of 14.2 kg. Total human casualty risk estimated at 1:25,000 upon uncontrolled re-entry.'
                      )
                    }
                  >
                    Microsat-X Casualty Risk
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <div className={styles.sectionLabel}>Document Excerpt / Specification Text</div>
                <textarea
                  className={styles.textarea}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Paste spacecraft datasheet, telemetry excerpt, or ODAR section..."
                  aria-label="Document excerpt text"
                />
              </div>

              <button
                type="button"
                className={styles.triageBtn}
                onClick={handleRunTriage}
                disabled={isTriaging || !excerpt.trim()}
              >
                {isTriaging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Extracting via Agent 37 Sandbox...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run Agent 37 Candidate Extraction
                  </>
                )}
              </button>

              {/* Triage Results Display */}
              {triageResult && (
                <div className={styles.resultsContainer}>
                  <div className={styles.resultsMeta}>
                    <span>
                      Provider: <strong>{triageResult.provider}</strong>
                    </span>
                    <span>
                      Extracted: <strong>{triageResult.candidates.length} candidate(s)</strong>
                    </span>
                  </div>

                  {triageResult.candidates.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                      No candidate values identified in this excerpt.
                    </div>
                  ) : (
                    triageResult.candidates.map((cand, idx) => (
                      <div key={idx} className={styles.candidateCard}>
                        <div className={styles.candidateHeader}>
                          <span className={styles.candidateField}>{cand.field}</span>
                          <span className={styles.candidateValueBadge}>
                            {String(cand.value)} {cand.unit || ''}
                          </span>
                        </div>
                        <div className={styles.candidateQuote}>"{cand.exact_quote}"</div>
                        <div className={styles.candidateFooter}>
                          <span
                            className={`${styles.tierBadge} ${
                              cand.confidence_tier === 'HIGH'
                                ? styles.tierHigh
                                : cand.confidence_tier === 'LOW'
                                ? styles.tierLow
                                : styles.tierMedium
                            }`}
                          >
                            {cand.confidence_tier} CONFIDENCE
                          </span>
                          {importedIndices[idx] ? (
                            <span className={styles.importedBadge}>
                              <CheckCircle size={14} /> Imported as Candidate
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={styles.importBtn}
                              onClick={() => handleImportCandidate(cand, idx)}
                            >
                              Import to Evidence <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Mission Copilot Chat */}
              <div className={styles.chatSuggestions}>
                <div className={styles.sectionLabel}>Frequently Asked Space Safety Questions</div>
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() =>
                    handleSendMessage('What is the FCC 5-year post-mission disposal rule for LEO satellites?')
                  }
                >
                  🚀 Explain FCC 5-year post-mission disposal rule
                </button>
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() =>
                    handleSendMessage('What are the energy storage passivation requirements under NASA-STD-8719.14?')
                  }
                >
                  🔋 What passivation steps are required for batteries?
                </button>
              </div>

              <div className={styles.chatMessages} role="log" aria-live="polite">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.messageBubble} ${
                      m.sender === 'user' ? styles.userMessage : styles.agentMessage
                    }`}
                  >
                    <div>{m.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>
                      {m.time}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className={`${styles.messageBubble} ${styles.agentMessage}`}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Loader2 size={13} className="animate-spin" /> Thinking on Agent 37 Cloud...
                    </span>
                  </div>
                )}
              </div>

              <form
                className={styles.chatInputRow}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Ask Agent 37 about orbital mechanics, debris limits, etc..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSending}
                  aria-label="Mission assistant message"
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={isSending || !inputMessage.trim()}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footerNote}>
          Powered by <strong>Agent 37 Cloud</strong> (Instance: <code>z2dhn46l7d</code> · Hermes) · Build 2026 Partner
        </div>
      </div>
    </div>
  );
};

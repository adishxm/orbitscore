import { useEffect, useMemo, useState } from "react";
import {
  confirmField, evaluateMission, exportPacket, getMission, getProfiles, getStateSnapshot,
  resetDemoState, runCounterfactual, submitReviewDecision, updateFieldValue, verifyProvenanceChain,
  isMockModeConfigured, checkApiHealth, fetchMissionLive, fetchProfilesLive, evaluateMissionLive,
  submitReviewDecisionLive, fetchExportLive, fetchProvenanceLive, updateFieldLive,
  runCounterfactualLive, resetDemoLive, DEFAULT_API_BASE_URL,
} from "../../../frontend-service/api";
import type { EvidenceState, Finding, MissionProfile, ExportPacket, ExportLocked, VerificationResult } from "../../../frontend-service/schemas";

const statusLabel: Record<EvidenceState, string> = {
  PASS_UNDER_PROFILE: "PASS",
  WARNING: "WARNING",
  NEEDS_EVIDENCE: "NEEDS EVIDENCE",
  CONFLICT: "CONFLICT",
  NOT_EVALUATED: "OUT OF SCOPE",
};

export default function App() {
  const [useMock, setUseMock] = useState(() => isMockModeConfigured());
  const [missionId, setMissionId] = useState("mission_complete");
  const [profileId, setProfileId] = useState("nasa-std-8719-14c-inspired");
  const [mission, setMission] = useState<MissionProfile>(() => getMission("mission_complete"));
  const [findings, setFindings] = useState<Finding[]>(() => evaluateMission("mission_complete", "nasa-std-8719-14c-inspired"));
  const [notice, setNotice] = useState("Ready for human review.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [liveExportPacket, setLiveExportPacket] = useState<ExportPacket | ExportLocked | null>(null);
  const [liveProvenance, setLiveProvenance] = useState<VerificationResult | null>(null);
  const [liveProfiles, setLiveProfiles] = useState<Array<{ profile_id: string; name: string; description?: string }>>([]);
  const [liveReviews, setLiveReviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronous mock derivations (for fallback/offline)
  const mockProfiles = useMemo(() => getProfiles(), [refresh]);
  const mockSnapshot = useMemo(() => getStateSnapshot(), [refresh]);
  const mockReviews = Object.values(mockSnapshot.reviews).filter((review) => review.mission_id === missionId);
  const mockPacket = useMemo(() => exportPacket(missionId), [missionId, refresh]);
  const mockVerified = useMemo(() => verifyProvenanceChain(), [refresh]);

  const activeProfiles = useMock ? mockProfiles : (liveProfiles.length ? liveProfiles : mockProfiles);
  const packet = useMock ? mockPacket : (liveExportPacket ?? mockPacket);
  const verified = useMock ? mockVerified : (liveProvenance ?? mockVerified);
  const reviewedSet = useMemo(() => {
    if (useMock) {
      return new Set(mockReviews.map((r) => r.finding_id));
    }
    return new Set(liveReviews);
  }, [useMock, mockReviews, liveReviews]);

  const critical = findings.filter((finding) => finding.critical_gap && finding.status !== "PASS_UNDER_PROFILE").length;

  // Load live data when !useMock or missionId/profileId/refresh changes
  useEffect(() => {
    if (useMock) {
      setErrorMessage(null);
      const m = getMission(missionId);
      setMission(m);
      setFindings(evaluateMission(missionId, profileId));
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    async function loadLiveData() {
      try {
        setErrorMessage(null);
        await checkApiHealth(DEFAULT_API_BASE_URL);

        const [m, pList, evalRes, provRes, exportRes] = await Promise.all([
          fetchMissionLive(missionId, DEFAULT_API_BASE_URL),
          fetchProfilesLive(DEFAULT_API_BASE_URL),
          evaluateMissionLive(missionId, profileId, DEFAULT_API_BASE_URL),
          fetchProvenanceLive(DEFAULT_API_BASE_URL).catch(() => ({ valid: true, checked_events: 0 })),
          fetchExportLive(missionId, DEFAULT_API_BASE_URL).catch(() => ({ status: "EXPORT_LOCKED" as const, missing_finding_ids: [], message: "Export is locked pending review." })),
        ]);

        if (!isSubscribed) return;
        setMission(m);
        setLiveProfiles(pList);
        setFindings(evalRes.findings);
        setLiveProvenance(provRes);
        setLiveExportPacket(exportRes);

        if (exportRes.status === "READY" && (exportRes as ExportPacket).reviews) {
          setLiveReviews((exportRes as ExportPacket).reviews.map((r: any) => r.finding_id));
        } else if (exportRes.status === "EXPORT_LOCKED") {
          const unreviewed = new Set(exportRes.missing_finding_ids || []);
          const allIds = evalRes.findings.map((f) => f.finding_id);
          setLiveReviews(allIds.filter((id) => !unreviewed.has(id)));
        }

        setNotice(`Live evaluation loaded from FastAPI for ${profileId}.`);
      } catch (err: any) {
        if (!isSubscribed) return;
        const msg = err?.message || "Failed to communicate with FastAPI backend.";
        setErrorMessage(`Live API Connection Error: ${msg}. Make sure the FastAPI server is running on ${DEFAULT_API_BASE_URL}.`);
        setNotice("API connection failed. Review the error banner above.");
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadLiveData();
    return () => { isSubscribed = false; };
  }, [useMock, missionId, profileId, refresh]);

  const reload = (nextProfile = profileId) => {
    if (useMock) {
      setMission(getMission(missionId));
      setProfileId(nextProfile);
      setFindings(evaluateMission(missionId, nextProfile));
      setRefresh((value) => value + 1);
    } else {
      setProfileId(nextProfile);
      setRefresh((value) => value + 1);
    }
  };

  const chooseProfile = (next: string) => {
    setNotice(`Evaluating ${next}…`);
    reload(next);
  };

  const review = async (finding: Finding, decision: "APPROVED" | "REJECTED" | "WAIVED_WITH_NOTE") => {
    if (useMock) {
      submitReviewDecision(
        missionId,
        finding.finding_id,
        decision,
        decision === "WAIVED_WITH_NOTE" ? "Waived after human review." : "Reviewed in console."
      );
      setNotice(`${finding.rule_id} marked ${decision}.`);
      reload();
    } else {
      try {
        await submitReviewDecisionLive(
          missionId,
          finding.finding_id,
          decision,
          decision === "WAIVED_WITH_NOTE" ? "Waived after human review." : "Reviewed in live console.",
          DEFAULT_API_BASE_URL
        );
        setNotice(`[Live] ${finding.rule_id} marked ${decision}.`);
        setRefresh((v) => v + 1);
      } catch (err: any) {
        setErrorMessage(`Failed to submit live review: ${err.message}`);
      }
    }
  };

  const reset = async () => {
    if (useMock) {
      resetDemoState();
      setMission(getMission(missionId));
      setProfileId(getMission(missionId).selected_profile_id);
      setFindings(evaluateMission(missionId));
      setRefresh((value) => value + 1);
      setNotice("Demo state reset; local storage cleared.");
    } else {
      try {
        await resetDemoLive(DEFAULT_API_BASE_URL);
        setRefresh((v) => v + 1);
        setNotice("Live demo state reset on FastAPI server.");
      } catch (err: any) {
        setErrorMessage(`Failed to reset live server: ${err.message}`);
      }
    }
  };

  const downloadPacket = () => {
    if (packet.status !== "READY") return;
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orbitscore-${missionId}-review-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice(useMock ? "Downloaded the synthetic local/mock JSON review packet." : "Downloaded the verified live review JSON packet from FastAPI backend.");
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>OrbitScore</strong>
            <span>evidence review console</span>
          </div>
        </div>
        <div className="top-actions">
          <button
            className={useMock ? "offline-pill" : "live-pill"}
            onClick={() => setUseMock(!useMock)}
            title="Click to toggle between Mock and Live API modes"
          >
            <i /> {useMock ? "MOCK / OFFLINE (Click for Live)" : `LIVE API: ${DEFAULT_API_BASE_URL}`}
          </button>
          <button className="ghost-button" onClick={reset}>Reset demo</button>
        </div>
      </header>

      {errorMessage && (
        <aside className="error-banner" role="alert">
          <div>
            <strong>Error:</strong> {errorMessage}
          </div>
          <div>
            <button onClick={() => setRefresh((v) => v + 1)}>Retry</button>
            <button onClick={() => setUseMock(true)}>Switch to Mock Mode</button>
          </div>
        </aside>
      )}

      <section className="hero">
        <div>
          <p className="eyebrow">
            {useMock
              ? "SYNTHETIC MISSION / LOCAL MOCK PROFILE ENGINE"
              : "SYNTHETIC MISSION / FASTAPI LIVE PROFILE ENGINE"}
          </p>
          <h1>Review the orbit.<br /><em>Defend the evidence.</em></h1>
          <p className="lede">
            A deterministic, clause-linked prototype for organizing synthetic mission evidence and profile-scoped findings.
          </p>
        </div>
        <div className="hero-stamp">
          <span>{useMock ? "LOCAL CHAIN CHECK" : "SERVER CHAIN CHECK"}</span>
          <b className={verified.valid ? "valid" : "invalid"}>
            {verified.valid ? "VERIFIED" : "TAMPER DETECTED"}
          </b>
          <small>{verified.checked_events ?? 0} {useMock ? "local" : "server"} provenance events checked</small>
        </div>
      </section>

      <section className="control-panel">
        <div className="control-label">
          <span className="step">01</span>
          <div>
            <b>Mission context</b>
            <small>Choose the active assessment target</small>
          </div>
        </div>
        <select
          value={missionId}
          onChange={(event) => {
            const nextId = event.target.value;
            setMissionId(nextId);
            if (useMock) {
              setMission(getMission(nextId));
              setFindings(evaluateMission(nextId, profileId));
            } else {
              setRefresh((v) => v + 1);
            }
          }}
        >
          <option value="mission_complete">Asteria-3 / complete evidence</option>
          <option value="mission_gap_heavy">Asteria-3 / gap-heavy review</option>
          <option value="mission_conflict">Asteria-3 / conflict review</option>
        </select>

        <div className="control-label profile-label">
          <span className="step">02</span>
          <div>
            <b>Policy profile</b>
            <small>Rules are evaluated dynamically</small>
          </div>
        </div>
        <select value={profileId} onChange={(event) => chooseProfile(event.target.value)}>
          {activeProfiles.map((profile) => (
            <option key={profile.profile_id} value={profile.profile_id}>
              {profile.name ?? profile.profile_id}
            </option>
          ))}
        </select>
      </section>

      <section className="metrics">
        <div className="metric">
          <span>FINDINGS</span>
          <strong>{findings.length.toString().padStart(2, "0")}</strong>
          <small>under selected profile</small>
        </div>
        <div className="metric">
          <span>CRITICAL GAPS</span>
          <strong className={critical ? "amber" : "green"}>{critical.toString().padStart(2, "0")}</strong>
          <small>requiring remediation</small>
        </div>
        <div className="metric">
          <span>REVIEWED</span>
          <strong>{reviewedSet.size.toString().padStart(2, "0")}</strong>
          <small>{useMock ? "stored in this browser" : "persisted on live server"}</small>
        </div>
        <div className="metric">
          <span>EXPORT GATE</span>
          <strong className={packet.status === "READY" ? "green" : "amber"}>
            {packet.status === "READY" ? "OPEN" : "LOCKED"}
          </strong>
          <small>human review required</small>
        </div>
      </section>

      <div className="workspace">
        <section className="panel findings-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{useMock ? "DETERMINISTIC MOCK EVALUATION" : "FASTAPI LIVE EVALUATION"}</p>
              <h2>Profile findings</h2>
            </div>
            <span className="live-tag">
              <i /> {useMock ? "LOCAL" : "LIVE"}
            </span>
          </div>

          {isLoading && !findings.length ? (
            <p style={{ padding: "20px 0", color: "#8da1b2" }}>Evaluating on live server...</p>
          ) : (
            <div className="finding-list">
              {findings.map((finding) => (
                <article className={`finding ${finding.status.toLowerCase()}`} key={finding.finding_id}>
                  <div className="finding-main">
                    <div className="rule-id">
                      {finding.rule_id}
                      <span>{finding.rule_version ? `v${finding.rule_version}` : ""}</span>
                    </div>
                    <h3>{finding.title}</h3>
                    <p>{finding.rationale || (finding as any).message}</p>
                    <div className="finding-foot">
                      <span className={`status ${finding.status.toLowerCase()}`}>
                        {statusLabel[finding.status]}
                      </span>
                      <span className="citation">
                        {finding.source_citation.document} · {finding.source_citation.clause}
                      </span>
                    </div>
                  </div>
                  <div className="finding-side">
                    <div className="observed">
                      <small>OBSERVED</small>
                      <b>
                        {String(finding.observed_value ?? "—")} {finding.observed_unit ?? (finding as any).unit ?? ""}
                      </b>
                      <span>
                        threshold {String(finding.threshold ?? "—")} {finding.observed_unit ?? (finding as any).unit ?? ""}
                      </span>
                    </div>
                    <div className="review-actions">
                      {reviewedSet.has(finding.finding_id) ? (
                        <span className="reviewed">✓ reviewed</span>
                      ) : (
                        <>
                          <button onClick={() => review(finding, "APPROVED")}>Approve</button>
                          <button onClick={() => review(finding, "WAIVED_WITH_NOTE")}>Waive</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="right-rail">
          <section className="panel evidence-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">SYNTHETIC DEMO EVIDENCE</p>
                <h2>Evidence fields</h2>
              </div>
              <span className="count-badge">{mission.fields.length}</span>
            </div>
            <div className="field-list">
              {mission.fields.map((field) => (
                <div className="field-row" key={field.field_id}>
                  <div>
                    <b>{field.label ?? field.field_id}</b>
                    <small>{field.field_id}</small>
                  </div>
                  <div className="field-value">
                    <input
                      value={String(field.value ?? "")}
                      onChange={async (event) => {
                        const raw = event.target.value;
                        const value = typeof field.value === "number" ? Number(raw) : raw;
                        if (useMock) {
                          updateFieldValue(missionId, field.field_id, value);
                          reload();
                        } else {
                          try {
                            await updateFieldLive(missionId, field.field_id, value, field.human_confirmed, DEFAULT_API_BASE_URL);
                            reload();
                          } catch (err: any) {
                            setErrorMessage(`Failed to update field: ${err.message}`);
                          }
                        }
                      }}
                    />
                    <button
                      className={field.human_confirmed ? "confirmed" : "confirm"}
                      onClick={async () => {
                        const nextState = !field.human_confirmed;
                        if (useMock) {
                          confirmField(missionId, field.field_id, nextState);
                          reload();
                        } else {
                          try {
                            await updateFieldLive(missionId, field.field_id, field.value, nextState, DEFAULT_API_BASE_URL);
                            reload();
                          } catch (err: any) {
                            setErrorMessage(`Failed to confirm field: ${err.message}`);
                          }
                        }
                      }}
                    >
                      {field.human_confirmed ? "CONFIRMED" : "CONFIRM"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel gate-panel">
            <p className="eyebrow">HUMAN REVIEW GATE</p>
            <h2>{packet.status === "READY" ? "Packet ready" : "Export is locked"}</h2>
            <p>
              {packet.status === "READY"
                ? `All current findings have a ${useMock ? "local mock" : "live server"} review decision.`
                : `${(packet as { missing_finding_ids?: string[] }).missing_finding_ids?.length ?? 0} finding(s) still need a decision before export.`}
            </p>
            <button
              className="export-button"
              disabled={packet.status !== "READY"}
              onClick={downloadPacket}
            >
              {packet.status === "READY" ? "Download review JSON →" : "Complete review to export"}
            </button>
          </section>

          <section className="panel counter-panel">
            <p className="eyebrow">COUNTERFACTUAL LAB</p>
            <h2>Test a lever</h2>
            <p>What if disposal lifetime becomes <strong>4.9 years</strong>?</p>
            <button
              className="secondary-button"
              onClick={async () => {
                if (useMock) {
                  const result = runCounterfactual(missionId, profileId, "disposal_lifetime_years", 4.9);
                  setNotice(`Counterfactual complete: ${result.before_statuses.join(", ")} → ${result.after_statuses.join(", ")}.`);
                  setRefresh((value) => value + 1);
                } else {
                  try {
                    const targetFinding = findings.find((f) => f.rule_id.includes("5Y") || f.rule_id.includes("LIFETIME")) || findings[0];
                    if (!targetFinding) return;
                    const result = await runCounterfactualLive(
                      missionId,
                      targetFinding.finding_id,
                      "lower disposal duration",
                      4.9,
                      DEFAULT_API_BASE_URL
                    );
                    setNotice(`[Live] Counterfactual complete: ${result.before_status} → ${result.after_status}.`);
                    setRefresh((v) => v + 1);
                  } catch (err: any) {
                    setErrorMessage(`Counterfactual failed: ${err.message}`);
                  }
                }
              }}
            >
              Run bounded simulation
            </button>
          </section>
        </aside>
      </div>

      <footer>
        <span>{notice}</span>
        <span>OrbitScore / Team TwinForge · {useMock ? "mock mode" : "live mode"}</span>
      </footer>
    </main>
  );
}

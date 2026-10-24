import {
  appendProvenanceEvent, evaluateMission, exportPacket, getMission, getStateSnapshot, resetDemoState,
  runCounterfactual, submitReviewDecision, updateFieldValue, verifyProvenanceChain,
} from "../../frontend-service/api";
import { __testing } from "../../frontend-service/api";

describe("OrbitScore frontend service", () => {
  beforeEach(() => resetDemoState());

  it("switches the 8.4-year mission from NASA pass to FCC/India warning", () => {
    const nasa = evaluateMission("mission_complete", "nasa-std-8719-14c-inspired").find((item) => item.rule_id.includes("PMD"));
    const fcc = evaluateMission("mission_complete", "fcc-22-74-inspired").find((item) => item.rule_id.includes("5Y"));
    const india = evaluateMission("mission_complete", "india-dfsm-inspired").find((item) => item.rule_id.includes("5Y"));
    expect(nasa?.status).toBe("PASS_UNDER_PROFILE");
    expect(fcc?.status).toBe("WARNING");
    expect(india?.status).toBe("WARNING");
  });

  it("persists field mutations and review decisions in the storage adapter", () => {
    updateFieldValue("mission_complete", "disposal_lifetime_years", 4.9, "years");
    expect(getMission("mission_complete").fields.find((field) => field.field_id === "disposal_lifetime_years")?.value).toBe(4.9);
    const finding = evaluateMission("mission_complete", "fcc-22-74-inspired")[0];
    submitReviewDecision("mission_complete", finding.finding_id, "APPROVED", "Checked against evidence");
    const state = getStateSnapshot();
    expect(Object.values(state.reviews).some((review) => review.finding_id === finding.finding_id)).toBe(true);
    expect(exportPacket("mission_complete").status).toBe("EXPORT_LOCKED");
  });

  it("unlocks a review packet only after every finding has a decision", () => {
    const findings = evaluateMission("mission_complete", "nasa-std-8719-14c-inspired");
    expect(findings.length).toBeGreaterThan(0);
    for (const finding of findings) {
      submitReviewDecision("mission_complete", finding.finding_id, "APPROVED", "Reviewed synthetic demo evidence");
    }
    const packet = exportPacket("mission_complete");
    expect(packet.status).toBe("READY");
    if (packet.status === "READY") {
      expect(packet.findings).toHaveLength(findings.length);
      expect(packet.reviews).toHaveLength(findings.length);
      expect(packet.mission.metadata?.synthetic).toBe(true);
      expect(JSON.parse(JSON.stringify(packet)).status).toBe("READY");
    }
  });

  it("returns a bounded counterfactual without changing the mission value", () => {
    const result = runCounterfactual("mission_complete", "fcc-22-74-inspired", "disposal_lifetime_years", 4.9);
    expect(result.bounded).toBe(true);
    expect(result.before_statuses).toContain("WARNING");
    expect(result.after_statuses).toContain("PASS_UNDER_PROFILE");
    expect(getMission("mission_complete").fields.find((field) => field.field_id === "disposal_lifetime_years")?.value).toBe(8.4);
  });

  it("detects tampering at the exact provenance sequence", () => {
    appendProvenanceEvent("TEST", "mission_complete", { value: "original" });
    appendProvenanceEvent("TEST", "mission_complete", { value: "second" });
    expect(verifyProvenanceChain().valid).toBe(true);
    const state = getStateSnapshot();
    state.provenance[1].payload.value = "tampered";
    localStorage.setItem("orbitscore.frontend.state.v1", JSON.stringify(state));
    const result = verifyProvenanceChain();
    expect(result.valid).toBe(false);
    expect(result.sequence).toBe(2);
  });

  it("uses real SHA-256 bytes for event hashes", () => {
    expect(__testing.sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

import {
  checkApiHealth, fetchMissionLive, fetchProfilesLive, evaluateMissionLive,
  submitReviewDecisionLive, fetchExportLive, fetchProvenanceLive, updateFieldLive,
  runCounterfactualLive, normalizeLiveMission,
} from "../../frontend-service/api";

describe("OrbitScore live API client integration", () => {
  it("normalizes a live mission fixture with field_id and human_confirmed", () => {
    const raw = {
      mission_id: "test_mission",
      name: "Test Mission",
      fields: [
        { field: "operational_altitude_km", value: 400, human_confirmed: true, artifact_id: "a1" },
        { field: "disposal_lifetime_years", value: 3.5, human_confirmed: false },
      ],
      artifacts: [{ artifact_id: "a1", filename: "test.pdf" }],
    };
    const normalized = normalizeLiveMission(raw);
    expect(normalized.mission_id).toBe("test_mission");
    expect(normalized.fields).toHaveLength(2);
    expect(normalized.fields[0].field_id).toBe("operational_altitude_km");
    expect(normalized.fields[0].human_confirmed).toBe(true);
    expect(normalized.fields[1].field_id).toBe("disposal_lifetime_years");
    expect(normalized.fields[1].human_confirmed).toBe(false);
  });

  it("handles live API health check and network error", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async (url: string) => {
        if (url === "http://localhost:8000/health") {
          return { ok: true, json: async () => ({ ok: true, version: "1.0.0" }) } as Response;
        }
        return { ok: false, status: 500 } as Response;
      }) as any;

      const health = await checkApiHealth("http://localhost:8000");
      expect(health.ok).toBe(true);

      await expect(checkApiHealth("http://invalid:9999")).rejects.toThrow();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles live evaluation and review decisions", async () => {
    const originalFetch = globalThis.fetch;
    try {
      let decisionPayload: any = null;
      globalThis.fetch = (async (url: string, opts?: RequestInit) => {
        if (url.includes("/evaluate")) {
          return {
            ok: true,
            json: async () => ({
              findings: [{
                finding_id: "m1:p1:R1",
                rule_id: "R1",
                title: "Debris decay",
                status: "PASS_UNDER_PROFILE",
                critical_gap: false,
                observed_value: 12,
                unit: "years",
                message: "Debris decay < 25 years.",
              }],
            }),
          } as Response;
        }
        if (url.includes("/decision")) {
          decisionPayload = JSON.parse(String(opts?.body));
          return { ok: true, json: async () => ({ finding_id: "m1:p1:R1", ...decisionPayload }) } as Response;
        }
        return { ok: true, json: async () => ({}) } as Response;
      }) as any;

      const evalRes = await evaluateMissionLive("m1", "p1", "http://localhost:8000");
      expect(evalRes.findings).toHaveLength(1);
      expect(evalRes.findings[0].status).toBe("PASS_UNDER_PROFILE");

      const decisionRes = await submitReviewDecisionLive("m1", "m1:p1:R1", "APPROVED", "Checked", "http://localhost:8000");
      expect(decisionPayload.decision).toBe("APPROVED");
      expect(decisionRes.decision).toBe("APPROVED");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles export lock (423) and unlocked export (200)", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async (url: string) => {
        if (url.includes("/export/locked_mission")) {
          return {
            ok: false,
            status: 423,
            json: async () => ({ detail: { code: "EXPORT_LOCKED", unreviewed_findings: ["f1", "f2"] } }),
          } as Response;
        }
        if (url.includes("/export/ready_mission")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ status: "READY", mission: { mission_id: "ready_mission" }, reviews: [] }),
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      }) as any;

      const locked = await fetchExportLive("locked_mission", "http://localhost:8000");
      expect(locked.status).toBe("EXPORT_LOCKED");
      if (locked.status === "EXPORT_LOCKED") {
        expect(locked.missing_finding_ids).toEqual(["f1", "f2"]);
      }

      const ready = await fetchExportLive("ready_mission", "http://localhost:8000");
      expect(ready.status).toBe("READY");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});


import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Mission,
  EvidenceItem,
  Profile,
  CheckRun,
  ReviewDecision,
  OpenIssue,
  OpenIssueStatus,
} from '../types/domain';
import { DEMO_PROFILE, executeProfileChecks } from '../profiles/demo-evidence-completeness';
import { ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE } from '../fixtures/asteria-3';
import { MICROSAT_X_MISSION, MICROSAT_X_EVIDENCE } from '../fixtures/microsat-x';
import {
  checkApiHealth,
  fetchProvenanceLive,
  evaluateMissionLive,
  submitReviewDecisionLive,
  DEFAULT_API_BASE_URL
} from '../api/backend';

export interface OrbitState {
  activeMissionId: string;
  missions: Record<string, Mission>;
  evidence: Record<string, EvidenceItem[]>;
  activeProfile: Profile;
  checkRuns: Record<string, CheckRun | null>;
  reviewDecisions: Record<string, ReviewDecision[]>;
  openIssues: Record<string, OpenIssue[]>;
  selectedEvidenceId: string | null;
  isCheckRunStale: Record<string, boolean>;

  // Backend & Dual-Mode State
  apiMode: 'mock' | 'live';
  isApiConnected: boolean;
  apiServerUrl: string;
  provenance: {
    valid: boolean;
    checkedEvents: number;
    lastChecked?: string;
  };

  // Actions
  setActiveMission: (missionId: string) => void;
  selectEvidenceItem: (id: string | null) => void;
  addEvidenceItem: (
    missionId: string,
    item: Omit<EvidenceItem, 'id' | 'mission_id'>
  ) => void;
  updateEvidenceItem: (
    missionId: string,
    id: string,
    updates: Partial<EvidenceItem>
  ) => void;
  confirmEvidenceItem: (
    missionId: string,
    id: string,
    reviewerName: string
  ) => void;
  deleteEvidenceItem: (missionId: string, id: string) => void;
  runChecks: (missionId: string) => CheckRun;
  recordDecision: (
    missionId: string,
    decision: Omit<ReviewDecision, 'id' | 'recorded_at'>
  ) => void;
  addOpenIssue: (missionId: string, issue: Omit<OpenIssue, 'id'>) => void;
  updateOpenIssueStatus: (
    missionId: string,
    id: string,
    status: OpenIssueStatus
  ) => void;
  setApiMode: (mode: 'mock' | 'live') => Promise<boolean>;
  toggleApiMode: () => Promise<void>;
  syncProvenance: () => Promise<void>;
  resetDemo: () => void;
  clearData: () => void;
}

const INITIAL_MISSIONS: Record<string, Mission> = {
  'asteria-3': ASTERIA_3_MISSION,
  'microsat-x': MICROSAT_X_MISSION,
};

const INITIAL_EVIDENCE: Record<string, EvidenceItem[]> = {
  'asteria-3': ASTERIA_3_EVIDENCE,
  'microsat-x': MICROSAT_X_EVIDENCE,
};

const memoryMap = new Map<string, string>();
const memoryStorage: Storage = {
  length: 0,
  clear: () => memoryMap.clear(),
  getItem: (key: string) => memoryMap.get(key) ?? null,
  key: (index: number) => Array.from(memoryMap.keys())[index] ?? null,
  removeItem: (key: string) => {
    memoryMap.delete(key);
  },
  setItem: (key: string, value: string) => {
    memoryMap.set(key, value);
  },
};

const getSafeStorage = (): Storage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test if localStorage is functional
      const testKey = '__orbit_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // fallback to memory
  }
  return memoryStorage;
};

export const useOrbitStore = create<OrbitState>()(
  persist(
    (set, get) => ({
      activeMissionId: 'asteria-3',
      missions: INITIAL_MISSIONS,
      evidence: INITIAL_EVIDENCE,
      activeProfile: DEMO_PROFILE,
      checkRuns: {},
      reviewDecisions: {},
      openIssues: {},
      selectedEvidenceId: null,
      isCheckRunStale: {},

      // Backend & Dual-Mode State
      apiMode: 'mock',
      isApiConnected: false,
      apiServerUrl: DEFAULT_API_BASE_URL,
      provenance: {
        valid: true,
        checkedEvents: 14,
        lastChecked: new Date().toISOString(),
      },

      setActiveMission: (missionId: string) => {
        set({ activeMissionId: missionId, selectedEvidenceId: null });
      },

      selectEvidenceItem: (id: string | null) => {
        set({ selectedEvidenceId: id });
      },

      addEvidenceItem: (missionId, itemData) => {
        const newItem: EvidenceItem = {
          ...itemData,
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          mission_id: missionId,
        };

        const currentList = get().evidence[missionId] || [];
        set((state) => ({
          evidence: {
            ...state.evidence,
            [missionId]: [...currentList, newItem],
          },
          isCheckRunStale: {
            ...state.isCheckRunStale,
            [missionId]: true,
          },
        }));
      },

      updateEvidenceItem: (missionId, id, updates) => {
        const currentList = get().evidence[missionId] || [];
        const updatedList = currentList.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );

        set((state) => ({
          evidence: {
            ...state.evidence,
            [missionId]: updatedList,
          },
          isCheckRunStale: {
            ...state.isCheckRunStale,
            [missionId]: true,
          },
        }));
      },

      confirmEvidenceItem: (missionId, id, reviewerName) => {
        const currentList = get().evidence[missionId] || [];
        const now = new Date().toISOString();
        const updatedList = currentList.map((item) =>
          item.id === id
            ? {
                ...item,
                state: 'confirmed' as const,
                human_confirmed_by: reviewerName,
                human_confirmed_at: now,
              }
            : item
        );

        set((state) => ({
          evidence: {
            ...state.evidence,
            [missionId]: updatedList,
          },
          isCheckRunStale: {
            ...state.isCheckRunStale,
            [missionId]: true,
          },
        }));
      },

      deleteEvidenceItem: (missionId, id) => {
        const currentList = get().evidence[missionId] || [];
        const updatedList = currentList.filter((item) => item.id !== id);

        set((state) => ({
          evidence: {
            ...state.evidence,
            [missionId]: updatedList,
          },
          selectedEvidenceId:
            state.selectedEvidenceId === id ? null : state.selectedEvidenceId,
          isCheckRunStale: {
            ...state.isCheckRunStale,
            [missionId]: true,
          },
        }));
      },

      runChecks: (missionId) => {
        const mission = get().missions[missionId] || ASTERIA_3_MISSION;
        const evidenceList = get().evidence[missionId] || [];
        const profile = get().activeProfile;

        const checkRun = executeProfileChecks(mission, evidenceList, profile);

        set((state) => ({
          checkRuns: {
            ...state.checkRuns,
            [missionId]: checkRun,
          },
          isCheckRunStale: {
            ...state.isCheckRunStale,
            [missionId]: false,
          },
        }));

        if (get().apiMode === 'live' && get().isApiConnected) {
          evaluateMissionLive(missionId, profile.id, get().apiServerUrl)
            .then(() => get().syncProvenance())
            .catch((err) => {
              console.warn('Live API evaluation error, preserved deterministic local run:', err);
            });
        }

        return checkRun;
      },

      recordDecision: (missionId, decisionData) => {
        const existing = get().reviewDecisions[missionId] || [];
        const newDecision: ReviewDecision = {
          ...decisionData,
          id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          recorded_at: new Date().toISOString(),
        };

        // Replace any previous decision for the same finding
        const filtered = existing.filter((d) => d.finding_id !== decisionData.finding_id);

        set((state) => ({
          reviewDecisions: {
            ...state.reviewDecisions,
            [missionId]: [...filtered, newDecision],
          },
        }));

        if (get().apiMode === 'live' && get().isApiConnected) {
          submitReviewDecisionLive(
            missionId,
            decisionData.finding_id,
            decisionData.decision,
            decisionData.rationale,
            decisionData.reviewer_name,
            get().apiServerUrl
          )
            .then(() => get().syncProvenance())
            .catch((err) => {
              console.error('Failed to submit review decision to live backend:', err);
            });
        }
      },

      addOpenIssue: (missionId, issueData) => {
        const existing = get().openIssues[missionId] || [];
        const newIssue: OpenIssue = {
          ...issueData,
          id: `iss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        };

        set((state) => ({
          openIssues: {
            ...state.openIssues,
            [missionId]: [...existing, newIssue],
          },
        }));
      },

      updateOpenIssueStatus: (missionId, id, status) => {
        const existing = get().openIssues[missionId] || [];
        const updated = existing.map((iss) =>
          iss.id === id ? { ...iss, status } : iss
        );

        set((state) => ({
          openIssues: {
            ...state.openIssues,
            [missionId]: updated,
          },
        }));
      },

      setApiMode: async (mode: 'mock' | 'live') => {
        if (mode === 'live') {
          try {
            const health = await checkApiHealth(get().apiServerUrl);
            if (health.ok) {
              set({ apiMode: 'live', isApiConnected: true });
              await get().syncProvenance();
              return true;
            }
          } catch {
            set({ apiMode: 'mock', isApiConnected: false });
            return false;
          }
        }
        set({ apiMode: 'mock' });
        return true;
      },

      toggleApiMode: async () => {
        const current = get().apiMode;
        if (current === 'mock') {
          await get().setApiMode('live');
        } else {
          await get().setApiMode('mock');
        }
      },

      syncProvenance: async () => {
        try {
          const res = await fetchProvenanceLive(get().apiServerUrl);
          if (res && res.verification) {
            set({
              provenance: {
                valid: res.verification.valid,
                checkedEvents: res.verification.checked_events,
                lastChecked: new Date().toISOString(),
              },
            });
          }
        } catch {
          // If offline, keep local verification state
        }
      },

      resetDemo: () => {
        set((state) => ({
          missions: {
            ...state.missions,
            'asteria-3': ASTERIA_3_MISSION,
          },
          evidence: {
            ...state.evidence,
            'asteria-3': ASTERIA_3_EVIDENCE,
          },
          checkRuns: {
            ...state.checkRuns,
            'asteria-3': null,
          },
          reviewDecisions: {
            ...state.reviewDecisions,
            'asteria-3': [],
          },
          openIssues: {
            ...state.openIssues,
            'asteria-3': [],
          },
          isCheckRunStale: {
            ...state.isCheckRunStale,
            'asteria-3': false,
          },
          selectedEvidenceId: null,
        }));
      },

      clearData: () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('orbitscore_store_v1');
          }
        } catch {
          // ignore localStorage clear issues
        }

        set({
          activeMissionId: 'asteria-3',
          missions: INITIAL_MISSIONS,
          evidence: INITIAL_EVIDENCE,
          checkRuns: {},
          reviewDecisions: {},
          openIssues: {},
          isCheckRunStale: {},
          selectedEvidenceId: null,
        });
      },
    }),
    {
      name: 'orbitscore_store_v1',
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        activeMissionId: state.activeMissionId,
        missions: state.missions,
        evidence: state.evidence,
        checkRuns: state.checkRuns,
        reviewDecisions: state.reviewDecisions,
        openIssues: state.openIssues,
        isCheckRunStale: state.isCheckRunStale,
        apiMode: state.apiMode,
      }),
    }
  )
);

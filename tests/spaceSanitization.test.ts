import { cloneDeep } from "lodash";
import { vi } from "vitest";
import { sanitizeTabConfig } from "@/common/utils/sanitizeTabConfig";
import { createAppStore } from "@/common/data/stores/app";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialSpaceConfig";

const createMockLocalStorage = () => {
  let storage = new Map<string, string>();
  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  } as Storage;
};

describe("sanitizeTabConfig", () => {
  it("rejects non-plain objects", () => {
    expect(
      sanitizeTabConfig(undefined, {
        log: vi.fn(),
      }),
    ).toBeUndefined();
    expect(
      sanitizeTabConfig(5 as unknown as Record<string, unknown>, {
        log: vi.fn(),
      }),
    ).toBeUndefined();
  });

  it("coerces isPrivate to a boolean when present", () => {
    const candidate = {
      ...INITIAL_SPACE_CONFIG_EMPTY,
      isPrivate: 1 as unknown as boolean,
    };

    const result = sanitizeTabConfig(candidate, { requireIsPrivate: true });

    expect(result?.isPrivate).toBe(true);
  });

  it("deep clones the candidate to avoid external mutation", () => {
    const candidate = {
      ...INITIAL_SPACE_CONFIG_EMPTY,
      theme: { ...INITIAL_SPACE_CONFIG_EMPTY.theme },
      isPrivate: false,
    };

    const result = sanitizeTabConfig(candidate, { requireIsPrivate: true });

    expect(result).not.toBe(candidate);
    result!.theme.primary = "updated" as any;
    expect((candidate.theme as any).primary).not.toBe("updated");
  });
});

describe("space store sanitization", () => {
  beforeEach(() => {
    (globalThis as any).localStorage = createMockLocalStorage();
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it("prevents invalid configs from being saved locally", async () => {
    const store = createAppStore();
    const invalidConfig = {
      ...INITIAL_SPACE_CONFIG_EMPTY,
      layoutDetails: { ...INITIAL_SPACE_CONFIG_EMPTY.layoutDetails },
      theme: { ...INITIAL_SPACE_CONFIG_EMPTY.theme },
      isPrivate: false,
      fidgetInstanceDatums: {
        broken: 42 as any,
      },
    };

    await store.getState().space.saveLocalSpaceTab(
      "space-1",
      "Profile",
      invalidConfig as any,
    );

    expect(store.getState().space.localSpaces["space-1"]).toBeUndefined();
  });

  it("filters corrupted tabs when reading current space config", () => {
    const store = createAppStore();
    const timestamp = new Date().toISOString();
    const validTab = {
      ...cloneDeep(INITIAL_SPACE_CONFIG_EMPTY),
      isPrivate: false,
      timestamp,
    } as any;
    const invalidTab = {
      ...cloneDeep(INITIAL_SPACE_CONFIG_EMPTY),
      isPrivate: false,
      fidgetInstanceDatums: {
        broken: 42 as any,
      },
    } as any;

    store.setState((state) => ({
      ...state,
      space: {
        ...state.space,
        localSpaces: {
          "space-1": {
            id: "space-1",
            updatedAt: timestamp,
            tabs: {
              Profile: validTab,
              Bad: invalidTab,
            },
            order: ["Profile", "Bad"],
            changedNames: {},
          },
        },
      },
    }));

    store.getState().currentSpace.setCurrentSpaceId("space-1");

    const config = store.getState().currentSpace.getCurrentSpaceConfig();

    expect(config?.tabs.Profile).toBeDefined();
    expect(config?.tabs.Bad).toBeUndefined();
  });
});

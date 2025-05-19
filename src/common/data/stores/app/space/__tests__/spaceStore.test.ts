import assert from "assert";
import { create as mutativeCreate } from "mutative";
import { createSpaceStoreFunc, spaceStoreprofiles } from "../spaceStore";

function createTestStore(initialState: any) {
  let state = { space: { ...spaceStoreprofiles, ...initialState } } as any;
  const set = (fn: any) => {
    state = mutativeCreate(fn)(state);
  };
  const get = () => state;
  return { actions: createSpaceStoreFunc(set, get), getState: () => state };
}

test("merge concurrent saves", async () => {
  const initial = {
    localSpaces: {
      space1: {
        id: "space1",
        updatedAt: "",
        tabs: {
          Tab1: {
            layoutID: "grid",
            layoutDetails: { layoutFidget: "grid", layoutConfig: { layout: [{ i: "fid1", x: 0, y: 0 }] } },
            theme: {},
            fidgetInstanceDatums: {
              fid1: { id: "fid1", fidgetType: "test", config: { editable: true, settings: {}, data: {} } },
            },
            fidgetTrayContents: [],
            isPrivate: false,
          },
        },
        order: ["Tab1"],
        changedNames: {},
      },
    },
  };

  const { actions, getState } = createTestStore(initial);

  await actions.saveLocalSpaceTab("space1", "Tab1", {
    fidgetInstanceDatums: {
      fid1: { id: "fid1", fidgetType: "test", config: { editable: true, settings: { foo: 1 }, data: {} } },
    },
    debugSaveId: 1,
  });

  await actions.saveLocalSpaceTab("space1", "Tab1", {
    layoutConfig: { layout: [{ i: "fid1", x: 1, y: 1 }] },
    debugSaveId: 2,
  });

  const final = getState().space.localSpaces.space1.tabs.Tab1;
  assert.strictEqual(final.layoutConfig.layout[0].x, 1);
  assert.strictEqual((final.fidgetInstanceDatums as any).fid1.config.settings.foo, 1);
});

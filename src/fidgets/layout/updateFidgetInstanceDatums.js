export function updateFidgetInstanceDatums(current, id, newConfig) {
  return {
    ...current,
    [id]: {
      ...current[id],
      config: newConfig,
    },
  };
}

export function updateFidgetInstanceDatums(current, id, newConfig) {
  if (!current[id]) {
    return current;
  }

  return {
    ...current,
    [id]: {
      ...current[id],
      config: newConfig,
    },
  };
}

export default function until(
  conditionFunction: () => boolean | Promise<boolean>,
) {
  const poll = async (resolve) => {
    if (await Promise.resolve(conditionFunction())) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
}

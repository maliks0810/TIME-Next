const e = (o) => ((typeof o != "number" || isNaN(o)) && console.error("Invalid Input"), o / 1e6);
export {
  e as convertToMillions
};

const map = (value, inMin, inMax, outMin, outMax) =>
  outMin + ((outMax - outMin) * (value - inMin)) / (inMax - inMin);
export default map;

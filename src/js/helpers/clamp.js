function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

export default clamp;

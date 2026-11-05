const DEFAULT_STROKE_WIDTH = 2;
function scaledStrokeWidth(strokeWidth, viewBoxSize) {
  return strokeWidth * (viewBoxSize / 24);
}
export {
  DEFAULT_STROKE_WIDTH,
  scaledStrokeWidth
};

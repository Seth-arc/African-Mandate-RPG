import type {
  SyntheticCoordinate,
  SyntheticPolygon,
} from "../schemas/fixture-artifacts.js";

export const POINT_ASSIGNMENTS = ["INSIDE", "OUTSIDE", "BOUNDARY"] as const;
export type PointAssignment = (typeof POINT_ASSIGNMENTS)[number];

const pointOnSegment = (
  [pointX, pointY]: SyntheticCoordinate,
  [startX, startY]: SyntheticCoordinate,
  [endX, endY]: SyntheticCoordinate,
): boolean => {
  const cross =
    (pointY - startY) * (endX - startX) - (pointX - startX) * (endY - startY);
  if (cross !== 0) return false;
  return (
    pointX >= Math.min(startX, endX) &&
    pointX <= Math.max(startX, endX) &&
    pointY >= Math.min(startY, endY) &&
    pointY <= Math.max(startY, endY)
  );
};

export const assignPointToSyntheticPolygon = (
  point: SyntheticCoordinate,
  polygon: SyntheticPolygon,
): PointAssignment => {
  const ring = polygon.ring;
  let inside = false;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const start = ring[index]!;
    const end = ring[index + 1]!;
    if (pointOnSegment(point, start, end)) return "BOUNDARY";

    const [pointX, pointY] = point;
    const [startX, startY] = start;
    const [endX, endY] = end;
    const crossesRay =
      startY > pointY !== endY > pointY &&
      pointX < ((endX - startX) * (pointY - startY)) / (endY - startY) + startX;
    if (crossesRay) inside = !inside;
  }

  return inside ? "INSIDE" : "OUTSIDE";
};

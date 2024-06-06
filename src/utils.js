function isPointInPolygon(polygon, point) {
  const x = point.x,
    y = point.y;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function dist2(x0, y0, x1, y1) {
  const distx = x1 - x0;
  const disty = y1 - y0;
  const dist = Math.sqrt(distx * distx + disty * disty);
  return dist;
}

function box2points(x, y, width, height, rotation) {
  const box = { w: width, h: height, x, y, rotation };
  const a1 = Math.atan(box.w / box.h) - box.rotation;
  const a2 = Math.atan(box.w / -box.h) - box.rotation;
  const a3 = Math.atan(box.w / box.h) + Math.PI - box.rotation;
  const a4 = Math.atan(box.w / -box.h) + Math.PI - box.rotation;
  const center2Axis = dist2(box.x, box.y, box.x + box.w / 2, box.y + box.h / 2);
  const boxPoints = [
    {
      x: Math.sin(a1) * center2Axis + box.x,
      y: Math.cos(a1) * center2Axis + box.y,
    },
    {
      x: Math.sin(a2) * center2Axis + box.x,
      y: Math.cos(a2) * center2Axis + box.y,
    },
    {
      x: Math.sin(a3) * center2Axis + box.x,
      y: Math.cos(a3) * center2Axis + box.y,
    },
    {
      x: Math.sin(a4) * center2Axis + box.x,
      y: Math.cos(a4) * center2Axis + box.y,
    },
  ];
  return boxPoints;
}

function deg2Rad(deg) {
  return (Math.PI / 180) * deg;
}

function getLineIntersectionPoint(
  line1StartX,
  line1StartY,
  line1EndX,
  line1EndY,
  line2StartX,
  line2StartY,
  line2EndX,
  line2EndY
) {
  var denominator,
    a,
    b,
    numerator1,
    numerator2,
    result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false,
    };
  denominator =
    (line2EndY - line2StartY) * (line1EndX - line1StartX) -
    (line2EndX - line2StartX) * (line1EndY - line1StartY);
  if (denominator == 0) {
    return result;
  }
  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;
  numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
  numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  result.x = line1StartX + a * (line1EndX - line1StartX);
  result.y = line1StartY + a * (line1EndY - line1StartY);

  // if line1 is a segment and line2 is infinite, they intersect if:
  if (a > 0 && a < 1) {
    result.onLine1 = true;
  }
  // if line2 is a segment and line1 is infinite, they intersect if:
  if (b > 0 && b < 1) {
    result.onLine2 = true;
  }
  // if line1 and line2 are segments, they intersect if both of the above are true
  return result;
}

function getIntersectionData(line, box) {
  const points = box2points(box.x, box.y, box.width, box.height, box.r);
  const intersectionDatas = [];
  points.forEach((p, i) => {
    const face = [p, points[(i + 1) % points.length]];
    let intersectionData = {};
    const rawCollisionPoint = getLineIntersectionPoint(
      face[0].x,
      face[0].y,
      face[1].x,
      face[1].y,
      line[0].x,
      line[0].y,
      line[1].x,
      line[1].y
    );
    if (rawCollisionPoint && rawCollisionPoint.onLine1 && rawCollisionPoint.onLine2) {
      intersectionData.point = { x: rawCollisionPoint.x, y: rawCollisionPoint.y };
      intersectionData.face = face;
      intersectionData.faceAngle = Math.atan2(
        face[0].y - face[1].y,
        face[0].x - face[1].x
      );
      intersectionDatas.push(intersectionData);
    }
  });
  function getRightIntersectionData() {
    let correctData = null;
    let point = line[0];
    intersectionDatas.forEach((data) => {
      if (
        correctData === null ||
        dist2(correctData.face[0].x, correctData.face[0].y, point.x, point.y) >
          dist2(data.face[0].x, data.face[0].y, point.x, point.y)
      ) {
        correctData = data;
      }
    });
    return correctData;
  }
  return intersectionDatas.length > 1 ? getRightIntersectionData() : intersectionDatas[0];
}

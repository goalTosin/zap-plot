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

function lineCircIntersection(line, circle) {
  function closestPointToLine(line, point) {
    function getBearing(x0, y0, x1, y1) {
      return Math.atan2(x1 - x0, y1 - y0);
    }

    function clamp(v, mi, ma) {
      return Math.max(mi, Math.min(ma, v));
    }
    function dist2(x0, y0, x1, y1) {
      const distx = x1 - x0;
      const disty = y1 - y0;
      const dist = Math.sqrt(distx * distx + disty * disty);
      return dist;
    }
    function projectPoint(
      line = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      point = { x: 2, y: 1 }
    ) {
      const a = dist2(point.x, point.y, line[0].x, line[0].y);
      const b = dist2(point.x, point.y, line[1].x, line[1].y);
      const c = dist2(line[0].x, line[0].y, line[1].x, line[1].y);
      const pow = Math.pow;
      return (pow(a, 2) - pow(b, 2) + pow(c, 2)) / (2 * c);
    }

    function projectPointh(
      line = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      point = { x: 2, y: 1 }
    ) {
      const h = projectPoint(line, point);
      const a = dist2(point.x, point.y, line[0].x, line[0].y);
      const p = Math.pow;
      return Math.sqrt(p(a, 2) - p(h, 2));
    }

    const d = clamp(
      projectPoint(line, point),
      0,
      dist2(line[0].x, line[0].y, line[1].x, line[1].y)
    );

    const h = projectPointh(line, point);
    const angle = getBearing(line[0].x, line[0].y, line[1].x, line[1].y);
    const x = Math.sin(angle) * d + line[0].x;
    const y = Math.cos(angle) * d + line[0].y;
    const dist = dist2(x, y, point.x, point.y);
    const b = getBearing(point.x, point.y, x, y);
    const e = dist2(
      Math.sin(b) * h + point.x,
      Math.cos(b) * h + point.y,
      point.x,
      point.y
    );
    return dist;
  }

  const dist = closestPointToLine(line, circle);
  return dist < circle.r;
}

function createWindow(name = "Window Name", elt = str2elt("<div>Hey there...</div>")) {
  const windowElt = str2elt(`
<div class="window">
  <div class="top">
    <h2 class="name">${name}</h2>
    <div class="cancel" onclick="setTimeout((() => {this.parentElement.parentElement.previousElementSibling.remove();this.parentElement.parentElement.remove()}).bind(this), 300);this.parentElement.parentElement.classList.add('deleted')">
      <svg viewBox="-1 -1 12 12" height="1em" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="none"
          stroke-linecap="round"
          stroke="white"
          d="M0,0L10,10M10,0L0, 10" />
      </svg>
    </div>
  </div>
</div>`);
  let backgroundElt = str2elt(`<div class="back"></div>`);
  windowElt.appendChild(elt);
  document.body.insertBefore(backgroundElt, document.querySelector("script"));
  document.body.insertBefore(windowElt, document.querySelector("script"));
}

function str2elt(str) {
  const d = document.createElement("div");
  d.innerHTML = str.trim();
  return d.firstChild;
}
function makeElt(name, attrs, inner) {
  if (Array.isArray(attrs) || typeof attrs === "string") {
    [attrs, inner] = [inner, attrs];
  }
  return `<${name} ${
    attrs && !Array.isArray(attrs)
      ? Object.keys(attrs).map((k) => `${k}=${attrs[k]}`)
      : ""
  }>${inner ? (Array.isArray(inner) ? inner.join(" ") : inner) : ""}</${name}>`;
}

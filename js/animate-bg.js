const refreshDuration = 5000;
let lastRefresh = 0;
let numPointsX, numPointsY, unitWidth, unitHeight, points = [], polygons = [];

$(function () {
    const $svgContainer = $('<div id="bg"></div>');
    $('header').after($svgContainer);

    $(window).on('resize', onResize);
    onLoad();
    requestAnimationFrame(tick);
});

function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

function onLoad() {
    const viewport = getViewportSize();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', viewport.width);
    svg.setAttribute('height', viewport.height - 4);
    $('#bg').empty().append(svg);

    const unitSize = (viewport.width + viewport.height) / 40;
    numPointsX = Math.ceil(viewport.width / unitSize) + 1;
    numPointsY = Math.ceil(viewport.height / unitSize) + 1;
    unitWidth = Math.ceil(viewport.width / (numPointsX - 1));
    unitHeight = Math.ceil(viewport.height / (numPointsY - 1));
    points = [];

    for (let y = 0; y < numPointsY; y++) {
        for (let x = 0; x < numPointsX; x++) {
            const px = unitWidth * x;
            const py = unitHeight * y;

            // Случайное смещение внутри одной ячейки
            const offsetX = (x > 0 && x < numPointsX - 1) ? (Math.random() * unitWidth - unitWidth / 2) : 0;
            const offsetY = (y > 0 && y < numPointsY - 1) ? (Math.random() * unitHeight - unitHeight / 2) : 0;

            const startX = px + offsetX;
            const startY = py + offsetY;

            points.push({
                originX: px,
                originY: py,
                x: startX,
                y: startY,
                prevX: startX,
                prevY: startY,
                targetX: startX,
                targetY: startY,
            });
        }
    }

    const ns = svg.namespaceURI;
    polygons = [];

    for (let i = 0; i < points.length; i++) {
        if (points[i].originX !== unitWidth * (numPointsX - 1) && points[i].originY !== unitHeight * (numPointsY - 1)) {
            const rando = Math.floor(Math.random() * 1.5);
            for (let n = 0; n < 2; n++) {
                const polygon = document.createElementNS(ns, 'polygon');
                let p1, p2, p3;

                if (rando === 0) {
                    if (n === 0) [p1, p2, p3] = [i, i + numPointsX, i + numPointsX + 1];
                    else [p1, p2, p3] = [i, i + 1, i + numPointsX + 1];
                } else {
                    if (n === 0) [p1, p2, p3] = [i, i + numPointsX, i + 1];
                    else [p1, p2, p3] = [i + numPointsX, i + 1, i + numPointsX + 1];
                }

                polygon.point1 = p1;
                polygon.point2 = p2;
                polygon.point3 = p3;
                polygon.setAttribute('fill', `rgba(0,0,0,${Math.random() / 2})`);
                svg.appendChild(polygon);
                polygons.push(polygon);
            }
        }
    }

    randomizeTargets();
}

function randomizeTargets() {
    for (const p of points) {
        p.prevX = p.x;
        p.prevY = p.y;

        if (p.originX !== 0 && p.originX !== unitWidth * (numPointsX - 1)) {
            p.targetX = p.originX + Math.random() * unitWidth - unitWidth / 2;
        } else {
            p.targetX = p.originX;
        }

        if (p.originY !== 0 && p.originY !== unitHeight * (numPointsY - 1)) {
            p.targetY = p.originY + Math.random() * unitHeight - unitHeight / 2;
        } else {
            p.targetY = p.originY;
        }
    }
}

function updatePolygons(t) {
    const progress = Math.min((t - lastRefresh) / refreshDuration, 1);

    for (const p of points) {
        p.x = p.prevX + (p.targetX - p.prevX) * progress;
        p.y = p.prevY + (p.targetY - p.prevY) * progress;
    }

    for (const poly of polygons) {
        poly.setAttribute(
            'points',
            `${points[poly.point1].x},${points[poly.point1].y} ${points[poly.point2].x},${points[poly.point2].y} ${points[poly.point3].x},${points[poly.point3].y}`
        );
    }
}

function tick(t) {
    if (!lastRefresh) lastRefresh = t;

    updatePolygons(t);

    if (t - lastRefresh > refreshDuration) {
        lastRefresh = t;
        randomizeTargets();
    }

    requestAnimationFrame(tick);
}

function onResize() {
    onLoad();
    lastRefresh = performance.now();
}

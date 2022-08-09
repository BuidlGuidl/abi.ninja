import { useEffect } from "react";

let navigation;
let navigationMarker;
let navigationItems;

// Factor of screen size that the element must cross
// before it's considered visible
const TOP_MARGIN = 0.025;
const BOTTOM_MARGIN = 0.025;

let pathLength;
// eslint-disable-next-line
let lastPathStart;
// eslint-disable-next-line
let lastPathEnd;

const drawPath = () => {
  navigationItems = [].slice.call(navigation?.querySelectorAll("li"));

  // Cache element references and measurements
  navigationItems = navigationItems.map(function (item) {
    const anchor = item.querySelector("span");
    const target = document.getElementById(anchor?.dataset.target);

    return {
      listItem: item,
      anchor: anchor,
      target: target,
    };
  });

  // Remove missing targets
  navigationItems = navigationItems.filter(function (item) {
    return !!item.target;
  });

  const path = [];
  let pathIndent;

  navigationItems.forEach(function (item, i) {
    const x = item.anchor.offsetLeft - 5;
    const y = item.anchor.offsetTop;
    const height = item.anchor.offsetHeight;

    if (i === 0) {
      path.push("M", x, y, "L", x, y + height);
      item.pathStart = 0;
    } else {
      // Draw an additional line when there's a change in
      // indent levels
      if (pathIndent !== x) path.push("L", pathIndent, y);

      path.push("L", x, y);

      // Set the current path so that we can measure it
      navigationMarker.setAttribute("d", path.join(" "));
      item.pathStart = navigationMarker.getTotalLength() || 0;

      path.push("L", x, y + height);
    }

    pathIndent = x;

    navigationMarker.setAttribute("d", path.join(" "));
    item.pathEnd = navigationMarker.getTotalLength();
  });

  pathLength = navigationMarker.getTotalLength();

  sync();
};

const sync = () => {
  const windowHeight = window.innerHeight;
  let pathStart = pathLength;
  let pathEnd = 0;
  let visibleItems = 0;

  navigationItems.forEach(function (item) {
    const targetBounds = item.target.getBoundingClientRect();

    if (targetBounds.bottom > windowHeight * TOP_MARGIN && targetBounds.top < windowHeight * (1 - BOTTOM_MARGIN)) {
      pathStart = Math.min(item.pathStart, pathStart);
      pathEnd = Math.max(item.pathEnd, pathEnd);

      visibleItems += 1;

      item.listItem.classList.add("visible");
    } else {
      item.listItem.classList.remove("visible");
    }
  });

  // Specify the visible path or hide the path altogether
  // if there are no visible items
  if (visibleItems > 0 && pathStart < pathEnd) {
    navigationMarker.setAttribute("stroke-dashoffset", "1");
    navigationMarker.setAttribute(
      "stroke-dasharray",
      "1, " + pathStart + ", " + (pathEnd - pathStart) + ", " + pathLength,
    );
    navigationMarker.setAttribute("opacity", 1);
  } else {
    navigationMarker.setAttribute("opacity", 0);
  }

  lastPathStart = pathStart;
  lastPathEnd = pathEnd;
};

export default function ContractNavigationMarker() {
  useEffect(() => {
    navigation = document.querySelector(".contract-navigation");
    navigationMarker = document.querySelector(".navigation-marker path");

    window.addEventListener("resize", drawPath, false);
    window.addEventListener("scroll", sync, false);

    drawPath();
    // eslint-disable-next-line
  }, [navigationItems]);

  return (
    <svg className="navigation-marker" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <path
        stroke="#551D98"
        strokeWidth="3"
        fill="transparent"
        strokeDasharray="0, 0, 0, 1000"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-0.5, -0.5)"
      />
    </svg>
  );
}

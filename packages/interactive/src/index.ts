import * as turf from "@turf/helpers";
import { debounce } from "lodash-es";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import scrollama from "scrollama";

import { chapters } from "./config";
import { COLORS } from "./colors";
import { getBreakpoint } from "./utils";
import { createPulsingDot } from "./waypoint";

import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

// Get the height of the viewport to set as a custom property on the document.
// We need a stable value for the `vh` unit, and unfortunately mobile Brave
// is the only browser that does not keep this value stable when the address
// bar is shown or hidden.
document.documentElement.style.setProperty(
  "--scrolly-vh",
  `${window.innerHeight * 0.01}px`,
);

function handleResize() {
  document.documentElement.style.setProperty(
    "--scrolly-vh",
    `${window.innerHeight * 0.01}px`,
  );
}

window.addEventListener(
  "resize",
  debounce(handleResize, 150, { leading: true }),
);

// Get the current breakpoint.
const breakpoint = getBreakpoint();

// Register the PMTiles protocol.
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Instantate the map instance.
const map = new maplibregl.Map({
  container: "map",
  style: `${import.meta.env.BASE_URL}styles/yakama.json`,
  center: chapters[0].center[breakpoint],
  zoom: chapters[0].zoom[breakpoint],
  dragPan: false, // Disable drag panning, so that users don't accidentally move the map.
  scrollZoom: false, // Disable scroll zoom, since we'll be hijacking scroll to drive the animation.
});

map.on("load", () => {
  // Load up all sources, images, and layers.

  // Historical range of the Yakama Nation from native-land.ca.
  map.addSource("yakama-nation-range", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/yakama-nation-range.pmtiles`,
  });

  map.addLayer({
    id: "yakama-nation-range",
    source: "yakama-nation-range",
    "source-layer": "yakama-nation-range",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 2.5,
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "yakama-nation-range-offset",
    source: "yakama-nation-range",
    "source-layer": "yakama-nation-range",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 0.5,
      "line-opacity": 0,
      "line-offset": 3,
    },
  });

  map.addLayer({
    id: "yakama-nation-range-fill",
    source: "yakama-nation-range",
    "source-layer": "yakama-nation-range",
    type: "fill",
    paint: {
      "fill-color": COLORS.GREEN,
      "fill-opacity": 0,
    },
  });

  // WA Territory.
  map.addSource("wa-territory", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/wa-territory.pmtiles`,
  });

  map.addLayer({
    id: "wa-territory",
    source: "wa-territory",
    "source-layer": "wa-territory",
    type: "line",
    paint: {
      "line-color": COLORS.SMOGGIER,
      "line-width": ["step", ["zoom"], 1.5, 5, 2.5],
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "wa-territory-offset",
    source: "wa-territory",
    "source-layer": "wa-territory",
    type: "line",
    paint: {
      "line-color": COLORS.SMOGGIER,
      "line-width": ["step", ["zoom"], 0, 5, 0.5],
      "line-opacity": 0,
      "line-offset": 3,
    },
  });

  // Ex. 56 georeferenced image of the state treaty map.
  map.addSource("ex-56-state", {
    type: "image",
    url: `${import.meta.env.BASE_URL}assets/png/ex-56-state.png`,
    coordinates: [
      [-125.4852301399999988, 49.6577846799999989],
      [-112.8112151520000026, 49.6577846799999989],
      [-112.8112151520000026, 44.1486966319999965],
      [-125.4852301399999988, 44.1486966319999965],
    ],
  });

  map.addLayer({
    id: "ex-56-state",
    type: "raster",
    source: "ex-56-state",
    paint: {
      "raster-opacity": 0,
    },
  });

  // Bounding box of the Yakama Reservation on Ex. 56.
  map.addSource("yakama-extent", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/yakama-extent.pmtiles`,
  });

  map.addLayer({
    id: "yakama-extent",
    source: "yakama-extent",
    "source-layer": "yakama-extent",
    type: "line",
    paint: {
      "line-color": COLORS.RED,
      "line-opacity": 0,
    },
  });

  // Modern boundary of the Yakama Reservation, which we'll animate with repeat-
  // ed calls to `setData` on scroll.
  map.addSource("yakama", {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addLayer({
    id: "yakama-outline",
    type: "line",
    source: "yakama",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 4,
    },
  });

  map.addLayer({
    id: "yakama-offset-outline",
    type: "line",
    source: "yakama",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 0.5,
      "line-offset": -5,
    },
  });

  // Pulsing dot animation for the treaty waypoints.
  map.addImage("pulsing-dot", createPulsingDot(map), { pixelRatio: 2 });

  // Treaty waypoints.
  map.addSource("treaty-waypoints", {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addLayer({
    id: "treaty-waypoints",
    type: "symbol",
    source: "treaty-waypoints",
    layout: {
      "icon-image": "pulsing-dot",
    },
  });

  // Ex. 56 georeferenced image of the Yakama Reservation, zoomed in on the
  // reservation boundaries with more aggressive local georeferencing.
  map.addSource("ex-56-reservation", {
    type: "image",
    url: `${import.meta.env.BASE_URL}assets/png/ex-56-reservation.png`,
    coordinates: [
      [-122.5965703338193293, 47.3195137752489501],
      [-118.7514176152076431, 47.3195137752489501],
      [-118.7514176152076431, 45.1255544832635067],
      [-122.5965703338193293, 45.1255544832635067],
    ],
  });

  map.addLayer({
    id: "ex-56-reservation",
    type: "raster",
    source: "ex-56-reservation",
    paint: {
      "raster-opacity": 0,
    },
  });

  // Ex. 79 georeferenced image of the Yakama Reservation, showing various fed-
  // eral survey boundaries.
  map.addSource("ex-79", {
    type: "image",
    url: `${import.meta.env.BASE_URL}assets/png/ex-79.png`,
    coordinates: [
      [-121.7191593226884407, 46.7675346937065441],
      [-119.7798641192351283, 46.7675346937065441],
      [-119.7798641192351283, 45.7420200609038901],
      [-121.7191593226884407, 45.7420200609038901],
    ],
  });

  map.addLayer({
    id: "ex-79",
    type: "raster",
    source: "ex-79",
    paint: {
      "raster-opacity": 0,
    },
  });

  // Schwartz survey.
  map.addSource("schwartz", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/schwartz.pmtiles`,
  });

  map.addLayer({
    id: "schwartz-outline-glow-1",
    source: "schwartz",
    "source-layer": "schwartz",
    type: "line",
    paint: {
      "line-color": COLORS.CLAY,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "schwartz-outline-glow-2",
    source: "schwartz",
    "source-layer": "schwartz",
    type: "line",
    paint: {
      "line-color": COLORS.CLAY,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "schwartz-outline-glow-3",
    source: "schwartz",
    "source-layer": "schwartz",
    type: "line",
    paint: {
      "line-color": COLORS.WHITE,
      "line-width": 1,
      "line-opacity": 0,
    },
  });

  // Campbell survey.
  map.addSource("campbell", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/campbell.pmtiles`,
  });

  map.addLayer({
    id: "campbell-outline-glow-1",
    source: "campbell",
    "source-layer": "campbell",
    type: "line",
    paint: {
      "line-color": COLORS.PURPLE,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "campbell-outline-glow-2",
    source: "campbell",
    "source-layer": "campbell",
    type: "line",
    paint: {
      "line-color": COLORS.PURPLE,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "campbell-outline-glow-3",
    source: "campbell",
    "source-layer": "campbell",
    type: "line",
    paint: {
      "line-color": COLORS.WHITE,
      "line-width": 1,
      "line-opacity": 0,
    },
  });

  // Pecore survey.
  map.addSource("pecore", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/pecore.pmtiles`,
  });

  map.addLayer({
    id: "pecore-outline-glow-1",
    source: "pecore",
    "source-layer": "pecore",
    type: "line",
    paint: {
      "line-color": COLORS.MARIGOLD,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "pecore-outline-glow-2",
    source: "pecore",
    "source-layer": "pecore",
    type: "line",
    paint: {
      "line-color": COLORS.MARIGOLD,
      "line-width": 10,
      "line-opacity": 0,
      "line-blur": 3,
    },
  });

  map.addLayer({
    id: "pecore-outline-glow-3",
    source: "pecore",
    "source-layer": "pecore",
    type: "line",
    paint: {
      "line-color": COLORS.WHITE,
      "line-width": 1,
      "line-opacity": 0,
    },
  });

  // Ex. 35 georeferenced image of the Yakama Reservation, showing a more modern
  // view of the federal survey boundaries.
  map.addSource("ex-35", {
    type: "image",
    url: `${import.meta.env.BASE_URL}assets/png/ex-35.png`,
    coordinates: [
      [-122.1208876709153799, 47.233720691032687],
      [-118.4663773007695085, 47.233720691032687],
      [-118.4663773007695085, 45.3130594901093815],
      [-122.1208876709153799, 45.3130594901093815],
    ],
  });

  map.addLayer({
    id: "ex-35",
    type: "raster",
    source: "ex-35",
    paint: {
      "raster-opacity": 0,
    },
  });

  // Tract D.
  map.addSource("tract-d", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/tract-d.pmtiles`,
  });

  map.addLayer({
    id: "tract-d-outline",
    source: "tract-d",
    "source-layer": "tract-d",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 4,
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "tract-d-offset-outline",
    source: "tract-d",
    "source-layer": "tract-d",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 0.5,
      "line-offset": 5,
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "tract-d-fill",
    source: "tract-d",
    "source-layer": "tract-d",
    type: "fill",
    paint: {
      "fill-color": COLORS.GREEN,
      "fill-opacity": 0,
    },
  });

  // A more precise boundary of the Yakama Reservation. This helps when we zoom
  // in to Tract D and no longer need to animate the boundary.
  map.addSource("yakama-precise", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/yakama-reservation.pmtiles`,
  });

  map.addLayer({
    id: "yakama-precise-outline",
    source: "yakama-precise",
    "source-layer": "yakama-reservation",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 4,
      "line-opacity": 0,
    },
  });

  map.addLayer({
    id: "yakama-precise-offset-outline",
    source: "yakama-precise",
    "source-layer": "yakama-reservation",
    type: "line",
    paint: {
      "line-color": COLORS.GREEN,
      "line-width": 0.5,
      "line-offset": 5,
      "line-opacity": 0,
    },
  });

  // WA State Trust Lands.
  map.addSource("wa-trust-lands", {
    type: "vector",
    url: `pmtiles://${import.meta.env.BASE_URL}data/pmtiles/wa-trust-lands.pmtiles`,
  });

  map.addLayer({
    id: "wa-trust-lands",
    source: "wa-trust-lands",
    "source-layer": "wa-trust-lands",
    type: "fill",
    paint: {
      "fill-color": COLORS.RED,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
  });

  // Set up the scrollama instance.
  const scroller = scrollama();

  function handleStepEnter(response: scrollama.CallbackResponse) {
    const { index, direction } = response;
    const chapter = chapters[index];

    map.flyTo({
      center: chapter.center[breakpoint],
      zoom: chapter.zoom[breakpoint],
      essential: true,
    });

    const el = document.querySelector<HTMLParagraphElement>(
      `[data-step-content='${index + 1}']`,
    )!;
    el.style.display = "block";
    el.style.opacity = "1";

    chapter.onChapterEnter?.(map, direction);
  }

  function handleStepExit(response: scrollama.CallbackResponse) {
    const { index, direction } = response;
    const chapter = chapters[index];

    const el = document.querySelector<HTMLParagraphElement>(
      `[data-step-content='${index + 1}']`,
    )!;
    el.style.opacity = "0";
    el.style.display = "none";

    chapter.onChapterExit?.(map, direction);
  }

  function handleStepProgress(response: scrollama.ProgressCallbackResponse) {
    const { index, progress } = response;
    const chapter = chapters[index];

    chapter.onChapterProgress?.(map, progress);
  }

  scroller
    .setup({
      step: "#scrolly article .step",
      progress: true,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
    .onStepProgress(handleStepProgress);
});

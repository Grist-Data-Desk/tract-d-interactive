import * as turf from "@turf/helpers";
import { scaleLinear } from "d3-scale";
import { FeatureCollection } from "geojson";
import { GeoJSONSource, type Map } from "maplibre-gl";
import scrollama from "scrollama";

import treatyWaypoints from "../data/treaty-waypoints.json";
import yakamaReservation from "../data/yakama-reservation-simplified.json";

interface Chapter {
  center: {
    sm: [number, number];
    md: [number, number];
    lg: [number, number];
    xl: [number, number];
  };
  zoom: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  onChapterEnter?: (
    map: Map,
    direction: scrollama.CallbackResponse["direction"],
  ) => void;
  onChapterExit?: (
    map: Map,
    direction: scrollama.CallbackResponse["direction"],
  ) => void;
  onChapterProgress?: (map: Map, progress: number) => void;
}

const yakamaCoordinates = yakamaReservation.features[0].geometry.coordinates[0];
const yakamaAnimationScale = scaleLinear(
  [0, 0.9],
  [0, yakamaCoordinates.length - 1],
).clamp(true);

/**
 * Highlight a passage of the treaty text.
 *
 * @param index – The index of the passage to highlight.
 */
function highlightTreatyText(index: number): void {
  document.querySelectorAll(".highlight").forEach((el) => {
    el.classList.remove("highlight");
  });

  document.getElementById(`treaty-text-${index}`)?.classList.add("highlight");
}

export const chapters: Chapter[] = [
  {
    center: {
      sm: [-120.085, 46.8],
      md: [-120.085, 47.35],
      lg: [-120.085, 47.35],
      xl: [-120.085, 47.35],
    },
    zoom: {
      sm: 5.25,
      md: 6.5,
      lg: 6,
      xl: 6.5,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("yakama-nation-range", "line-opacity", 1);
      map.setPaintProperty("yakama-nation-range-offset", "line-opacity", 1);
      map.setPaintProperty("yakama-nation-range-fill", "fill-opacity", 0.1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("yakama-nation-range", "line-opacity", 0);
        map.setPaintProperty("yakama-nation-range-offset", "line-opacity", 0);
        map.setPaintProperty("yakama-nation-range-fill", "fill-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-118.55, 47.65],
      md: [-118.55, 47.65],
      lg: [-118.55, 47.65],
      xl: [-118.55, 47.65],
    },
    zoom: {
      sm: 4.25,
      md: 5.25,
      lg: 5.75,
      xl: 6,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("wa-territory", "line-opacity", 1);
      map.setPaintProperty("wa-territory-offset", "line-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("wa-territory", "line-opacity", 0);
        map.setPaintProperty("wa-territory-offset", "line-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-119.15, 47],
      md: [-119.15, 47],
      lg: [-119.15, 48],
      xl: [-119.3, 47.65],
    },
    zoom: {
      sm: 4.25,
      md: 5.25,
      lg: 5.25,
      xl: 5.5,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("yakama-nation-range", "line-opacity", 0);
      map.setPaintProperty("yakama-nation-range-offset", "line-opacity", 0);
      map.setPaintProperty("yakama-nation-range-fill", "fill-opacity", 0);
      map.setPaintProperty("wa-territory", "line-opacity", 0);
      map.setPaintProperty("wa-territory-offset", "line-opacity", 0);

      map.setPaintProperty("ex-56-state", "raster-opacity", 1);
      map.setPaintProperty("yakama-extent", "line-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("yakama-nation-range", "line-opacity", 1);
        map.setPaintProperty("yakama-nation-range-offset", "line-opacity", 1);
        map.setPaintProperty("yakama-nation-range-fill", "fill-opacity", 0.1);
        map.setPaintProperty("wa-territory", "line-opacity", 1);
        map.setPaintProperty("wa-territory-offset", "line-opacity", 1);

        map.setPaintProperty("ex-56-state", "raster-opacity", 0);
        map.setPaintProperty("yakama-extent", "line-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-120.75, 45.5],
      md: [-120.75, 46.55],
      lg: [-121.4, 46.45],
      xl: [-121.15, 46.3],
    },
    zoom: {
      sm: 7,
      md: 8,
      lg: 7.75,
      xl: 8.25,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("ex-56-state", "raster-opacity", 0);
      map.setPaintProperty("yakama-extent", "line-opacity", 0);

      map
        .getSource<GeoJSONSource>("treaty-waypoints")
        ?.setData(treatyWaypoints as FeatureCollection);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("ex-56-state", "raster-opacity", 1);
        map.setPaintProperty("yakama-extent", "line-opacity", 1);

        map
          .getSource<GeoJSONSource>("treaty-waypoints")
          ?.setData(turf.featureCollection([]));
      }
    },
  },
  {
    center: {
      sm: [-120.75, 45.5],
      md: [-120.75, 46.55],
      lg: [-121.4, 46.45],
      xl: [-121.15, 46.3],
    },
    zoom: {
      sm: 7,
      md: 8,
      lg: 7.75,
      xl: 8.25,
    },
    onChapterProgress: (map, progress) => {
      const yakamaCoordinatesIndex = yakamaAnimationScale(progress);
      const slice = yakamaCoordinates.slice(0, yakamaCoordinatesIndex + 1);

      map
        .getSource<GeoJSONSource>("yakama")
        ?.setData(
          slice.length > 1 ? turf.lineString(slice) : turf.point(slice[0]),
        );

      if (progress < 0.083) {
        highlightTreatyText(1);
      } else if (progress < 0.21) {
        highlightTreatyText(2);
      } else if (progress < 0.348) {
        highlightTreatyText(3);
      } else if (progress < 0.45) {
        highlightTreatyText(4);
      } else if (progress < 0.585) {
        highlightTreatyText(5);
      } else if (progress < 0.714) {
        highlightTreatyText(6);
      } else {
        highlightTreatyText(7);
      }
    },
  },
  {
    center: {
      sm: [-120.65, 46.25],
      md: [-120.65, 46.25],
      lg: [-120.65, 46.5],
      xl: [-120.65, 46.5],
    },
    zoom: {
      sm: 6,
      md: 6.75,
      lg: 6.75,
      xl: 7.25,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("ex-56-reservation", "raster-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      map.setPaintProperty("ex-56-reservation", "raster-opacity", 0);
      if (direction === "down") {
        map
          .getSource<GeoJSONSource>("yakama")
          ?.setData(turf.featureCollection([]));
        map
          .getSource<GeoJSONSource>("treaty-waypoints")
          ?.setData(turf.featureCollection([]));
      } else {
        map
          .getSource<GeoJSONSource>("yakama")
          ?.setData(yakamaReservation as FeatureCollection);
        map
          .getSource<GeoJSONSource>("treaty-waypoints")
          ?.setData(treatyWaypoints as FeatureCollection);
      }
    },
  },
  {
    center: {
      sm: [-120.65, 46.25],
      md: [-120.65, 46.25],
      lg: [-120.65, 46.5],
      xl: [-120.65, 46.5],
    },
    zoom: {
      sm: 6,
      md: 6.75,
      lg: 6.75,
      xl: 7.25,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("ex-79", "raster-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("ex-79", "raster-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-120.75, 46.2],
      md: [-120.75, 46.3],
      lg: [-120.75, 46.35],
      xl: [-120.75, 46.3],
    },
    zoom: {
      sm: 7.35,
      md: 8.25,
      lg: 8.75,
      xl: 8.75,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("schwartz-outline-glow-1", "line-opacity", 1);
      map.setPaintProperty("schwartz-outline-glow-2", "line-opacity", 0.4);
      map.setPaintProperty("schwartz-outline-glow-3", "line-opacity", 1);
    },
    onChapterExit: (map) => {
      map.setPaintProperty("schwartz-outline-glow-1", "line-opacity", 0);
      map.setPaintProperty("schwartz-outline-glow-2", "line-opacity", 0);
      map.setPaintProperty("schwartz-outline-glow-3", "line-opacity", 0);
    },
  },
  {
    center: {
      sm: [-120.75, 46.2],
      md: [-120.75, 46.3],
      lg: [-120.75, 46.35],
      xl: [-120.75, 46.3],
    },
    zoom: {
      sm: 7.35,
      md: 8.25,
      lg: 8.75,
      xl: 8.75,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("campbell-outline-glow-1", "line-opacity", 1);
      map.setPaintProperty("campbell-outline-glow-2", "line-opacity", 0.4);
      map.setPaintProperty("campbell-outline-glow-3", "line-opacity", 1);
    },
    onChapterExit: (map) => {
      map.setPaintProperty("campbell-outline-glow-1", "line-opacity", 0);
      map.setPaintProperty("campbell-outline-glow-2", "line-opacity", 0);
      map.setPaintProperty("campbell-outline-glow-3", "line-opacity", 0);
    },
  },
  {
    center: {
      sm: [-120.75, 46.2],
      md: [-120.75, 46.3],
      lg: [-120.75, 46.35],
      xl: [-120.75, 46.3],
    },
    zoom: {
      sm: 7.35,
      md: 8.25,
      lg: 8.75,
      xl: 8.75,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("pecore-outline-glow-1", "line-opacity", 1);
      map.setPaintProperty("pecore-outline-glow-2", "line-opacity", 0.4);
      map.setPaintProperty("pecore-outline-glow-3", "line-opacity", 1);
    },
    onChapterExit: (map) => {
      map.setPaintProperty("pecore-outline-glow-1", "line-opacity", 0);
      map.setPaintProperty("pecore-outline-glow-2", "line-opacity", 0);
      map.setPaintProperty("pecore-outline-glow-3", "line-opacity", 0);
    },
  },
  {
    center: {
      sm: [-120.3, 46.25],
      md: [-120.45, 46.35],
      lg: [-120.35, 46.65],
      xl: [-120.35, 46.55],
    },
    zoom: {
      sm: 6.25,
      md: 6.8,
      lg: 6.75,
      xl: 7.25,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("ex-35", "raster-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("ex-35", "raster-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-121.28, 46.028],
      md: [-121.28, 46.05],
      lg: [-121.28, 46.05],
      xl: [-121.28, 46.028],
    },
    zoom: {
      sm: 9.25,
      md: 10,
      lg: 9.75,
      xl: 10,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("tract-d-outline", "line-opacity", 1);
      map.setPaintProperty("tract-d-offset-outline", "line-opacity", 1);
      map.setPaintProperty("tract-d-fill", "fill-opacity", 0.5);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("tract-d-outline", "line-opacity", 0);
        map.setPaintProperty("tract-d-offset-outline", "line-opacity", 0);
        map.setPaintProperty("tract-d-fill", "fill-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-121.28, 46.028],
      md: [-121.28, 46.05],
      lg: [-121.28, 46.05],
      xl: [-121.28, 46.028],
    },
    zoom: {
      sm: 9.25,
      md: 10,
      lg: 9.75,
      xl: 10,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("ex-35", "raster-opacity", 0);
      map.setPaintProperty("ex-79", "raster-opacity", 0);
      map.setPaintProperty("ex-56-reservation", "raster-opacity", 0.5);
      map.setPaintProperty("yakama-precise-outline", "line-opacity", 1);
      map.setPaintProperty("yakama-precise-offset-outline", "line-opacity", 1);
      map.moveLayer("treaty-waypoints");

      map
        .getSource<GeoJSONSource>("treaty-waypoints")
        ?.setData(treatyWaypoints as FeatureCollection);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("ex-35", "raster-opacity", 1);
        map.setPaintProperty("ex-79", "raster-opacity", 1);
        map.setPaintProperty("yakama-precise-outline", "line-opacity", 0);
        map.setPaintProperty(
          "yakama-precise-offset-outline",
          "line-opacity",
          0,
        );
        map.moveLayer("treaty-waypoints", "ex-35");
        map.moveLayer("treaty-waypoints", "ex-79");

        map
          .getSource<GeoJSONSource>("treaty-waypoints")
          ?.setData(turf.featureCollection([]));

        map.setPaintProperty("ex-56-reservation", "raster-opacity", 0);
      }
    },
  },
  {
    center: {
      sm: [-121.28, 46.028],
      md: [-121.28, 46.05],
      lg: [-121.28, 46.05],
      xl: [-121.28, 46.028],
    },
    zoom: {
      sm: 9.25,
      md: 10,
      lg: 9.75,
      xl: 10,
    },
    onChapterEnter: (map) => {
      map.setPaintProperty("wa-trust-lands", "fill-opacity", 0.5);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("wa-trust-lands", "fill-opacity", 0);
      }
    },
  },
];

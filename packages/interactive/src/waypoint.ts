import maplibregl from "maplibre-gl";

const size = 80;

/**
 * Create a pulsing dot to be used as a map marker.
 *
 * @param map – The map instance.
 * @returns — An Object implementing MapLibre GL JS's StyleImage interface. See:
 * https://maplibre.org/maplibre-gl-js/docs/API/interfaces/StyleImageInterface/
 */
export function createPulsingDot(map: maplibregl.Map) {
  return {
    width: size,
    height: size,
    data: new Uint8ClampedArray(size * size * 4),
    ctx: null as CanvasRenderingContext2D | null,

    // When the layer is added to the map, get the rendering context for the map
    // canvas.
    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    },

    // Call render once before every frame where the icon will be used.
    render: function () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const ctx = this.ctx!;

      // Draw the outer circle.
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(71, 96, 57, ${1 - t})`;
      ctx.fill();

      // Draw the inner circle.
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(71, 96, 57, 1)";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2 + 4 * (1 - t);
      ctx.fill();
      ctx.stroke();

      // Update this image's data with data from the canvas.
      this.data = ctx.getImageData(0, 0, this.width, this.height).data;

      // Continuously repaint the map, resulting
      // in the smooth animation of the dot.
      map.triggerRepaint();

      // Return `true` to let the map know that the image was updated.
      return true;
    },
  };
}

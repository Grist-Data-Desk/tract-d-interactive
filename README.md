# Wiped Off the Map

This repository contains the source code for the scrolling interactive featured in [Wiped Off the Map](https://grist.org/indigenous/state-trust-lands-yakama-nation-washington/).

## Repository Structure

This repository is a monorepo, hosting the main client-side code for the interactive in `packages/interactive` and accompanying scripts for data and asset management in `packages/scripts`. We use [`pnpm` workspaces](https://pnpm.io/workspaces) to manage dependencies across packages.

## Development

### Interactive

The main scrolling interactive in the piece uses [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) for map rendering and [Scrollama](https://github.com/russellsamora/scrollama) for handling transitions and animations between layers. It's implemented in TypeScript, uses [Vite](https://vite.dev/) as its build tool, and uses [Tailwind CSS](https://tailwindcss.com/) for styling.

To get started developing the interactive:

1. **Install dependencies from the repository root.**

```sh
pnpm install
```

2. **Navigate to the `packages/interactive` directory.**

```sh
cd packages/interactive
```

3. **Run the `dev` script.**

```sh
pnpm dev
```

This will start a local development server at http://localhost:5173.

### Scripts

The `packages/scripts` directory contains multiple Node.js scripts for generating and deploying both datasets and static build assets. All scripts are implemented in TypeScript.

To get started running scripts:

1. **Install dependencies from the repository root.**

```sh
pnpm install
```

2. **Navigate to the `packages/scripts` directory.**

```sh
cd packages/scripts
```

3. **Run a desired script using `pnpm run <script>`.**

```sh
pnpm run <script>
```

The available scripts include:

```sh
pnpm run deploy
```

Deploy build assets at `packages/interactive/dist` to Grist's Digital Ocean Spaces bucket.

```sh
pnpm run gen:pmtiles
```

Generate [PMTiles archives](https://docs.protomaps.com/pmtiles/) for the GeoJSON datasets listed in `packages/scripts/src/generate-pmtiles.ts`.

```sh
pnpm run store:pmtiles
```

Push all PMTiles archives in `packages/scripts/data/output` to Grist's Digital Ocean Spaces bucket.

```sh
pnpm run store:png
```

Push all PNGs in `packages/scripts/assets` to Grist's Digital Ocean Spaces bucket.

```sh
pnpm run store:styles
```

Push all JSON files containing MapLibre Style Specifications in `packages/scripts/styles` to Grist's Digital Spaces bucket.

## Production

To build the interactive for production, navigate to the `packages/interactive` directory and run the `build` script.

```sh
cd packages/interactive
pnpm build
```

Build assets will be written to `packages/interactive/dist`.

If you'd like to preview the production build, you can run:

```sh
pnpm preview
```

The production build will be served at http://localhost:4173.

## Deployment

All datasets and build assets in this repository are deployed to the Grist's Digital Ocean Spaces bucket. [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces) is an S3-compatible object storage service; it allows us to host static files (e.g., JS, CSS, PMTiles) that we can access via the Digital Ocean CDN and inject into the WordPress build.

Deployment of build assets is handled by the `deploy` script in `packages/interactive`. Deployment of PMTiles archives, PNGs, and JSON files is handled by the `store:*` scripts.

## Integration with WordPress

To integrate this interactive with a post on WordPress, take the following steps:

1. Deploy the interactive and take note of the names of the built CSS and JS files.
2. In WordPress, create a custom HTML block.
3. Paste the contents within the `<body>` tag of `packages/interactive/dist/index.html` into the HTML block.
4. Add the following HTML to the custom HTML block.

```html
<script
  type="module"
  crossorigin=""
  src="https://grist.nyc3.cdn.digitaloceanspaces.com/<path/to/js>.js"
></script>
<script>
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.crossOrigin = "";
  link.href = "https://grist.nyc3.cdn.digitaloceanspaces.com/<path/to/css>.css";

  document.head.appendChild(link);
</script>
```

Make sure to replace `<path/to/js>.js` and `<path/to/css>.css` with the appropriate paths to the deployed static assets in the Grist Digital Ocean Spaces bucket.

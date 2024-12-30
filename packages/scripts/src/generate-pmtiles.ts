import { exec } from "node:child_process";
import path from "node:path";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const files = [
  "../data/input/campbell.json",
  "../data/input/pecore.json",
  "../data/input/schwartz.json",
  "../data/input/tract-d.json",
  "../data/input/wa-territory.json",
  "../data/input/wa-trust-lands.json",
  "../data/input/yakama-extent.json",
  "../data/input/yakama-nation-range.json",
  "../data/input/yakama-reservation.json",
];

/**
 * Generate PMTiles archives for a subset of GeoJSON datasets.
 */
async function main(): Promise<void> {
  for await (const file of files) {
    const name = path.parse(file).name;

    const inFilePath = path.resolve(__dirname, file);
    const outFilePath = path.resolve(
      __dirname,
      file.replace("input", "output").replace(".json", ".pmtiles"),
    );

    const cmd = `tippecanoe -zg -o ${outFilePath} -l ${name} --extend-zooms-if-still-dropping --force ${inFilePath}`;
    console.log(`Generating PMTiles for ${file}.`);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Failed to convert input file ${file} to PMTiles.`, err);
        return;
      }

      console.log(stdout);
      console.error(stderr);
    });
  }
}

main();

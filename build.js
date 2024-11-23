import { build } from "esbuild";

const buildScript = async () => {
  try {
    await build({
      entryPoints: ["./scripts/content.js"],
      bundle: true,
      outfile: "./scripts/content_script.js",
      // minify: true, // Optional: Minify the output for production
      sourcemap: true, // Optional: Generate source maps for debugging
      // format: "iife", // Use IIFE format for browser compatibility
    });
    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
  }
};

buildScript();

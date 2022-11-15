
export default {
    // pick source from outDir "output"
    input: "tests/to-dir/output/index.js",
    output: {
        format: "esm",
        file: "tests/to-dir/dist/bundle.js",
    },
}
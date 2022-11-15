
module.exports = {
    srcDir: 'tests/to-dir/src',
    outDir: 'tests/to-dir/output',
    log: true,
    preprocessOptions: {
        defines: [
            "MY_DIRECTIVE"
        ],
        mode: "plain"
    }
}
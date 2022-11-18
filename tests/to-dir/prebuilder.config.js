
module.exports = {
    srcDir: 'tests/to-dir/src',
    outDir: 'tests/to-dir/output',
    log: false,
    watch_RunCmdFirstTimeOnly: true,
    preprocessOptions: {
        defines: [
            "MY_DIRECTIVE"
        ],
        mode: "plain"
    }
}
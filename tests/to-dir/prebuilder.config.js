
module.exports = {
    srcDir: 'tests/to-dir/src',
    outDir: 'tests/to-dir/output',
    log: false,
    wrap_RunCmdFirstTimeOnly: true,
    preprocessOptions: {
        defines: [
            "MY_DIRECTIVE"
        ],
        mode: "plain"
    }
}
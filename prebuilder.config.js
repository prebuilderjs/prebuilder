
module.exports = {
    srcDir: 'test/src',
    outDir: 'test/output',
    log: true,
    onTheSpot: true,
    preprocessOptions: {
        defines: [
            "MY_DIRECTIVE"
        ],
        mode: "plain"
    }
}
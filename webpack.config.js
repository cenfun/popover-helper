module.exports = {
    mode: "production",
    //mode: "development",
    output: {
        filename: "popover-helper.js",
        umdNamedDefine: true,
        library: "popover-helper",
        libraryTarget: "umd"
    }
};
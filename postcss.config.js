module.exports = {
    plugins: [
        require('autoprefixer'), //  will use the data based on current browser popularity and property support to apply prefixes (-webkit-)
        require('css-mqpacker'), //merge media things into one (media as parameter)
        require('cssnano')({ //optimize and minify code for production environment
            preset: [
                'default', {
                    discardComments: {
                        removeAll: true,
                    }
                }
            ]
        })
    ]
};
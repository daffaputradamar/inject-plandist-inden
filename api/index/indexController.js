const { inject } = require("./indexModel");

module.exports = {
    index: (req, res) => {
        res.render('index', { title: 'Inject Plandist Inden', BASE_URL: process.env.BASE_URL });
    },
    inject: async (req, res) => {
        try {
            const { body } = req
            const data = await inject(body)
            res.json({
                success: true,
                message: "Berhasil Diinject",
                data
            })    
        } catch (error) {
            res.json({
                success: false,
                message: error,
                data: []
            })
        }
        
    }
}
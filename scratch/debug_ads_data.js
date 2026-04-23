const ProductAdModel = require('./model/productAd/index');
const ProductModel = require('./model/product/index');
const sequelize = require('./sequelize');

async function debugData() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const ads = await ProductAdModel.findAll({
            include: [{ model: ProductModel }]
        });

        console.log('Found Ads Count:', ads.length);
        ads.forEach(ad => {
            console.log(`Ad ID: ${ad.id}, Title: ${ad.title}, Product ID: ${ad.product_id}, Product Match: ${ad.product ? ad.product.name : 'NO MATCH'}, Start: ${ad.start_date}, End: ${ad.end_date}, Status: ${ad.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugData();

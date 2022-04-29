const https = require('https');

const DATA_URL = "https://www.monogo.pl/competition/input.txt"

const req = https.request(DATA_URL, res => {

    let rawData = '';

    res.on('data', chunk => { rawData += chunk; });

    res.on('end', () => {
        try {
            // 1. 
            const parsedData = JSON.parse(rawData)
            const products = transform(parsedData.products)

            // 2.
            const groupingData = [
                {
                    dataset: parsedData.colors,
                    field: 'color'
                },
                {
                    dataset: parsedData.sizes,
                    field: 'size'
                },
            ]
            
            const productsToGroup = new Map(products.entries())
            for (let group of groupingData) {
                groupByProduct(productsToGroup, group.dataset, group.field)
            }

            // 3.
            const filteredProducts = filter(productsToGroup, parsedData.selectedFilters)

            const sortedProductsByPrice = sortByProductPrice(filteredProducts)

            // first and last
            const lowestPrice = Array.from(sortedProductsByPrice)[0]
            const highestPrice = Array.from(sortedProductsByPrice)[sortedProductsByPrice.size - 1]

            // 4.
            const roundedResult = Math.round(lowestPrice[1].price * highestPrice[1].price)

            // 5.
            const reduced = Array.from(String(roundedResult)).reduce((acc, value, index, arr) => {
                if (index % 2 == 0) {
                    acc.push(parseInt(value) + parseInt(arr[index + 1]))
                }
                return acc
            }, [])

            console.log('result:', calculateResult(reduced, roundedResult));

        } catch (e) {
            console.error(e.message);
        }
    });

});

req.on('error', error => {
    console.error(error);
});

req.end();

const transform = (products) => {
    return new Map(products.map(product => [product.id, product]))
}

const groupByProduct = (products, data, valueName) => {
    data.sort((a, b) => (a.id > b.id) ? 1 : -1)
    for (let el of data) {
        const product = products.get(parseInt(el.id))
        products.set(product.id, {
            ...product,
            [valueName]: el.value
        })
    }
    return products;
}

const filter = (products, filters) => {
    return new Map(Array.from(products)
        .filter(([key, value]) => {
            return filters.colors.includes(value.color)
                && filters.sizes.includes(value.size)
                && value.price > 200
        }))
}

const sortByProductPrice = (products) => {
    return new Map([...products].sort((a, b) => a[1].price > b[1].price ? 1 : -1))
}

const calculateResult = (point5result, point4result) => point5result.indexOf(14) * point4result * 'Monogo'.length
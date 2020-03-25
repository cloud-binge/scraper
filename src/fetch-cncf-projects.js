const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require("path");

const fileDestination = '../out/cncf-landscape.json'

async function fetchCncfLandscape() {
    return fetch('https://landscape.cncf.io/data.json')
        .then(res => res.json())
        .then(x => fs.writeFile(path.resolve(__dirname, fileDestination), JSON.stringify(x), 'utf8'))
        .then(() => console.log('[Fetch CNCF Landscape] Fetched landscape and saved it in: ', fileDestination))
}

exports.fetchCncfLandscape = fetchCncfLandscape;
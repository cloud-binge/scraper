const fs = require('fs');
const path = require("path");

function cleanDist() {
    const ytMeta = require('../out/yt-meta.json');
    const schedRegex = /https?:\/\/sched\.co\/(\w+)/;


    const dist = ytMeta.map(meta => {
        const schedIdMatches = schedRegex.exec(meta.schedLink);

        if (schedIdMatches && schedIdMatches.length == 2) {
            const filePath = `../out/sched-${schedIdMatches[1]}.json`
            if (fs.existsSync(path.resolve(__dirname, filePath))) {
                const schedContent = require(filePath);
                meta = Object.assign(meta, schedContent)
            }
        }
        return meta;
    });

    const finalDistFile = './out/cloud-binge.json';
    fs.writeFileSync(finalDistFile, JSON.stringify(dist), 'utf8');
    console.log('[Clean Dist] Saved final dist in ', finalDistFile);
}

exports.cleanDist = cleanDist;


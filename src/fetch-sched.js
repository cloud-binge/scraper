const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const fsPromises = require('fs').promises;

const schedRegex = /https?:\/\/sched\.co\/(\w+)/;

async function parsePage(pageContentHtml) {

    const $ = cheerio.load(pageContentHtml);

    const speakers = [];
    const slides = [];
    const tags = [];

    $('.sched-person').each(function () {
        const name = $(this).find('h2').first().text();
        const role = $(this).find('.sched-event-details-role-company').first().text();
        const bio = $(this).find('.sched-event-details-role-bio').first().text();
        speakers.push({ name, role, bio });
    });

    $('.sched-file a.file-uploaded').each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        slides.push({ title, url })
    });

    $('.sched-event-type a').each(function () {
        tags.push($(this).text().trim());
    });

    const sessionDate = $('.sched-event-details-timeandplace').first().text().trim();

    return {
        speakers,
        slides,
        tags,
        sessionDate
    }
}

async function downloadSchedContent(url) {
    const schedIdMatches = schedRegex.exec(url);
    if (!schedIdMatches || schedIdMatches.length != 2) {
        console.warn("[Fetch Sched] no sched content for: " + url);
        return;
    }

    const schedId = schedIdMatches[1];
    const filePath = `./out/sched-${schedId}.json`
    if (fs.existsSync(filePath)) {
        console.debug('[Fetch Sched] File already exists: ', filePath);
        return;
    }


    const pageContentHtml = await fetch(url).then(res => res.text());
    const schedContent = await parsePage(pageContentHtml);
    return fsPromises.writeFile(filePath, JSON.stringify(schedContent), 'utf8')
}


async function downloadAllScheds() {
    const ytMeta = require('../out/yt-meta.json');
    for (let index = 0; index < ytMeta.length; index++) {
        const meta = ytMeta[index];
        if (meta.schedLink) {
            await downloadSchedContent(meta.schedLink);
        } else {
            console.warn("[Fetch Sched] no link in: ", meta.videoUrl);
        }
    }
    console.warn("[Fetch Sched] Done fetching sched info");
}

exports.downloadAllScheds = downloadAllScheds;
const fetchCncfLandscape = require('./src/fetch-cncf-projects').fetchCncfLandscape;
const fetchAllPlaylistVideos = require('./src/fetch-yt-playlist').fetchAllPlaylistVideos;
const cleanAllPlaylists = require('./src/clean-playlistitems').cleanAllPlaylists;
const downloadAllScheds = require('./src/fetch-sched').downloadAllScheds;
const cleanDist = require('./src/clean-dist').cleanDist;

async function scrapePlaylistInfo() {
    await fetchCncfLandscape();
    await fetchAllPlaylistVideos();
    await cleanAllPlaylists();
    await downloadAllScheds();
    await cleanDist();
}

scrapePlaylistInfo();

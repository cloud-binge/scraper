const fs = require('fs').promises;
const fg = require('fast-glob');
const path = require('path');

const playlistsConfig = require('../config/playlists.json');


const playlistIndex = {};
playlistsConfig.forEach(playlist => {
    playlistIndex[playlist.playlistId] = {
        name: playlist.name,
        ads: playlist.ads
    }
});


function cleanPlaylist(filePath) {
    const cncfProjects = require('../out/cncf-landscape.json').map(x => x.name);
    const ytVideos = require(filePath);
    return ytVideos
        .filter(video => video.snippet.resourceId.kind === 'youtube#video')
        .map(video => {
            const playlistId = video.snippet.playlistId;
            let description = video.snippet.description;


            playlistIndex[playlistId].ads.forEach(ad => {
                description = description.replace(ad, '').trim()
            });

            const descriptionLower = description.toLowerCase();

            let projects = cncfProjects.filter(project => descriptionLower.indexOf(project.toLowerCase()) != -1)

            const regexp = /https?:\/\/sched\.co\/\w+/g;
            const schedLinks = description.match(regexp);
            description = description.replace(regexp, '').trim();

            return {
                title: video.snippet.title,
                description,
                channel: video.snippet.channelTitle,
                event: playlistIndex[playlistId].name,
                videoUrl: 'https://www.youtube.com/watch?v=' + video.snippet.resourceId.videoId,
                thumbnail: video.snippet.thumbnails ? (video.snippet.thumbnails.standard || video.snippet.thumbnails.high || video.snippet.thumbnails.default) : null,
                schedLink: schedLinks ? schedLinks[0] : null,
                projects
            }
        });
}

async function cleanAllPlaylists() {
    const entries = await fg([path.resolve(__dirname, '../out/playlistitems-*.json')], { dot: true });
    const videos = [].concat(...entries.map(filePath => cleanPlaylist(filePath)));
    await fs.writeFile(path.resolve(__dirname, `../out/yt-meta.json`), JSON.stringify(videos), 'utf8');
    console.log('[Clean Playlists] cleaned ', videos.length, ' playlist entries.')
}

exports.cleanAllPlaylists = cleanAllPlaylists;

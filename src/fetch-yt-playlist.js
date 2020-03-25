const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const playlistsConfig = require('../config/playlists.json');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YT_API_KEY
});

async function fetchPlaylistVideos(playlistId, pageToken) {
    const response = await youtube.playlistItems.list({
        part: 'id,snippet',
        playlistId,
        maxResults: 50,
        pageToken,
        headers: {},
    });
    const videos = response.data.items;
    const nextPageToken = response.data.nextPageToken;
    if (!nextPageToken) {
        return videos;
    } else {
        console.log('[Fetch YT Playlist]  fetching playlist: ', playlistId, ' page: ', nextPageToken);
        const nextVideos = await fetchPlaylistVideos(playlistId, nextPageToken);
        return [...videos, ...nextVideos];
    }
}

async function fetchAllPlaylistVideos() {
    for (let index = 0; index < playlistsConfig.length; index++) {
        const playlistConfig = playlistsConfig[index];
        const videos = await fetchPlaylistVideos(playlistConfig.playlistId);
        await fs.writeFile(`./out/playlistitems-${playlistConfig.playlistId}.json`, JSON.stringify(videos), 'utf8');
    }
}

exports.fetchAllPlaylistVideos = fetchAllPlaylistVideos;

const SERVER_URL = 'http://localhost:8080/api/v1/';

document.getElementById('form-artist').addEventListener('submit', getArtist);
document.getElementById('form-songs').addEventListener('submit', getSongs);
document.getElementById('form-answer').addEventListener('submit', getInfo);
const SERVER_URL = 'http://localhost:8080/api/v1/';
console.log("Playmaker JS loaded");

document.addEventListener("DOMContentLoaded", function () {
    // Form submission handler
    document.getElementById('form-songs').addEventListener('submit', getSongs);

    // Add animation to nav items
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Show the corresponding page
            const pageId = this.getAttribute('data-page');
            if (pageId === 'explore') {
                showExplorePage();
            } else if (pageId === 'playlists') {
                showPage('home-page');
            }
        });
    });

    // Enhance the playlist results display
    const resultContainer = document.getElementById('result');
    if (resultContainer) {
        resultContainer.addEventListener('DOMNodeInserted', enhancePlaylistDisplay);
    }

    // Initialize audio player
    initAudioPlayer();

    // By default load the home page
    showPage('home-page');

    // Set first nav item as active
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
});

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

function showExplorePage() {
    showPage('explore-page');
    loadTopArtists();
}

async function loadTopArtists() {
    const artistsGrid = document.getElementById('top-artists-grid');
    const spinner = document.getElementById('explore-spinner');

    if (!artistsGrid) return;

    // Show spinner while loading
    spinner.style.display = 'flex';
    artistsGrid.innerHTML = '';

    try {
        const response = await fetch(`${SERVER_URL}lastfm/top-artists?limit=20`).then(handleHttpErrors);

        if (response && response.artists && response.artists.artist) {
            const artists = response.artists.artist;
            let artistsHTML = '';

            artists.forEach(artist => {
                const imageUrl = getArtistImageUrl(artist.image);
                const listeners = parseInt(artist.listeners).toLocaleString();

                artistsHTML += `
                <div class="artist-card" data-artist="${artist.name}">
                    <img src="${imageUrl}" alt="${artist.name}" class="artist-img">
                    <div class="artist-info">
                        <h3 class="artist-name">${artist.name}</h3>
                        <p class="artist-listeners">${listeners} listeners</p>
                    </div>
                </div>`;
            });

            artistsGrid.innerHTML = artistsHTML;

            // Add event listeners to artist cards
            const artistCards = document.querySelectorAll('.artist-card');
            artistCards.forEach(card => {
                card.addEventListener('click', function() {
                    const artistName = this.getAttribute('data-artist');
                    loadArtistDetails(artistName);
                });
            });
        } else {
            artistsGrid.innerHTML = '<p>No artists found</p>';
        }
    } catch (error) {
        console.error('Error loading top artists:', error);
        artistsGrid.innerHTML = `<p>Error loading artists: ${error.message}</p>`;
    } finally {
        spinner.style.display = 'none';
    }
}

function getArtistImageUrl(images) {
    // Last.fm returns an array of images with different sizes
    // Get the largest one (usually the last one)
    if (!images || images.length === 0) {
        return '/api/placeholder/200/200';
    }

    // Find the large image (index 3) or use the largest available
    const largeImage = images.find(img => img.size === 'large' || img.size === 'extralarge');
    return largeImage && largeImage['#text'] ? largeImage['#text'] : '/api/placeholder/200/200';
}

async function loadArtistDetails(artistName) {
    try {
        const artistsInput = document.getElementById('artists');

        // Populate the input field with the artist name
        if (artistsInput) {
            artistsInput.value = artistName;

            // Scroll to the top to show the form
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Navigate to the home page
            showPage('home-page');

            // Update the nav
            const navItems = document.querySelectorAll('.nav-links li');
            navItems.forEach(i => i.classList.remove('active'));
            navItems[0].classList.add('active');
        }
    } catch (error) {
        console.error('Error loading artist details:', error);
    }
}

async function getSongs(event) {
    event.preventDefault();
    console.log("Form submitted");

    const artistsInput = document.getElementById('artists');
    const spinner = document.getElementById('spinner1');
    const result = document.getElementById('result');
    const generateBtn = document.querySelector('.generate-btn span');
    const resultsContainer = document.querySelector('.results-container');

    if (!artistsInput.value.trim()) {
        showError("Please enter at least one artist for inspiration");
        return;
    }

    const URL = `${SERVER_URL}songs?artists=${encodeURIComponent(artistsInput.value)}`;

    // Reset and prepare UI for loading
    result.innerHTML = '';
    result.style.color = "var(--spotify-text)";
    spinner.style.display = "block";
    generateBtn.textContent = "Generating...";

    try {
        const response = await fetch(URL).then(handleHttpErrors);

        // Process and display the response
        if (response.answer) {
            result.innerHTML = formatPlaylistResponse(response.answer);
            resultsContainer.style.display = "block";

            // Scroll to results with animation
            resultsContainer.scrollIntoView({ behavior: 'smooth' });

            // Add event listeners to play buttons
            const playButtons = document.querySelectorAll('.play-btn');
            playButtons.forEach(btn => {
                btn.addEventListener('click', handlePlayClick);
            });
        } else {
            showError("Received empty response from server");
        }
    } catch (e) {
        showError(e.message);
    } finally {
        // Reset UI after loading
        spinner.style.display = "none";
        generateBtn.textContent = "Generate Playlist";
    }
}

function formatPlaylistResponse(text) {
    // Extract the songs from the numbered list
    const songPattern = /(\d+)\.\s*([^-]+)\s*-\s*([^(\n]+)/g;
    let match;
    const songs = [];

    while ((match = songPattern.exec(text)) !== null) {
        const number = match[1];
        const artist = match[2].trim();
        const track = match[3].trim();

        songs.push({ number, artist, track });
    }

    // If no songs were extracted using the pattern, fallback to the original text
    if (songs.length === 0) {
        return formatPlaylistResponseFallback(text);
    }

    // Create styled HTML for each song
    let formattedHtml = '';

    songs.forEach(song => {
        formattedHtml += `
        <div class="playlist-item" data-artist="${song.artist}" data-track="${song.track}">
            <div class="playlist-number">${song.number}</div>
            <div class="playlist-content">
                <div class="song-details">
                    <strong>${song.artist}</strong> - ${song.track}
                </div>
                <button class="play-btn" title="Preview song">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        </div>`;
    });

    return '<div class="playlist-items">' + formattedHtml + '</div>';
}

function formatPlaylistResponseFallback(text) {
    // Convert numbered list to styled items (fallback method)
    let formattedText = text.replace(/(\d+\.\s*)(.*?)(?=\d+\.|$)/gs, (match, number, content) => {
        return `<div class="playlist-item">
                    <div class="playlist-number">${number.trim()}</div>
                    <div class="playlist-content">
                        <div class="song-details">${content.trim()}</div>
                        <button class="play-btn" title="Preview song"><i class="fas fa-play"></i></button>
                    </div>
                </div>`;
    });

    return '<div class="playlist-items">' + formattedText + '</div>';
}

function enhancePlaylistDisplay() {
    // Add event listeners to play buttons if not already added
    const playButtons = document.querySelectorAll('.play-btn:not([listener])');
    playButtons.forEach(btn => {
        btn.setAttribute('listener', 'true');
        btn.addEventListener('click', handlePlayClick);
    });
}

async function handlePlayClick(event) {
    // Get the song details from the parent element
    const playlistItem = this.closest('.playlist-item');
    const songDetails = playlistItem.querySelector('.song-details').textContent.trim();

    // Try to extract artist and track from data attributes or from text content
    let artist, track;

    if (playlistItem.hasAttribute('data-artist') && playlistItem.hasAttribute('data-track')) {
        artist = playlistItem.getAttribute('data-artist');
        track = playlistItem.getAttribute('data-track');
    } else {
        // Try to parse from the song details text
        const match = songDetails.match(/^([^-]+)-(.+)$/);
        if (match) {
            artist = match[1].trim();
            track = match[2].trim();
        } else {
            // If no dash found, assume everything is the track name
            // and use the artist from the input field
            track = songDetails;
            artist = document.getElementById('artists').value.split(',')[0].trim();
        }
    }

    // Disable the button and show a loading state
    const originalIcon = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    this.disabled = true;

    try {
        // Search for the track using the Last.fm API
        const searchURL = `${SERVER_URL}lastfm/search-track?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
        const response = await fetch(searchURL).then(handleHttpErrors);

        // Check if we have track matches
        if (response && response.results && response.results.trackmatches &&
            response.results.trackmatches.track && response.results.trackmatches.track.length > 0) {

            const foundTrack = response.results.trackmatches.track[0];
            const trackName = foundTrack.name;
            const artistName = foundTrack.artist;

            // For now, we don't have direct audio URLs from Last.fm
            // So we'll play a placeholder audio or simulate playing
            playAudio(trackName, artistName);
        } else {
            console.log('Track not found:', artist, track);
            // Show a message that no preview is available
            showSnackbar('No preview available for this track');
        }
    } catch (error) {
        console.error('Error searching for track:', error);
        showSnackbar('Error loading track preview');
    } finally {
        // Reset the button state
        this.innerHTML = originalIcon;
        this.disabled = false;
    }
}

// Audio player functions
let currentAudio = null;
let currentPlayButton = null;

function initAudioPlayer() {
    const audioElement = document.getElementById('audio-element');
    const playerToggle = document.getElementById('player-toggle');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');

    // Update progress bar as audio plays
    audioElement.addEventListener('timeupdate', function() {
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration || 1;
        const progressPercent = (currentTime / duration) * 100;

        progress.style.width = `${progressPercent}%`;
        currentTimeDisplay.textContent = formatTime(currentTime);
    });

    // Set duration when metadata is loaded
    audioElement.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTime(audioElement.duration);
    });

    // Handle click on the progress bar
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const duration = audioElement.duration || 1;

        audioElement.currentTime = clickPosition * duration;
    });

    // Toggle play/pause
    playerToggle.addEventListener('click', function() {
        if (audioElement.paused) {
            audioElement.play();
            this.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioElement.pause();
            this.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // When audio ends
    audioElement.addEventListener('ended', function() {
        playerToggle.innerHTML = '<i class="fas fa-play"></i>';
        progress.style.width = '0%';
        currentTimeDisplay.textContent = '0:00';

        // Reset the play button in the playlist
        if (currentPlayButton) {
            currentPlayButton.innerHTML = '<i class="fas fa-play"></i>';
            currentPlayButton = null;
        }
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function playAudio(trackName, artistName) {
    const audioElement = document.getElementById('audio-element');
    const audioPlayer = document.getElementById('audio-player');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerToggle = document.getElementById('player-toggle');
    const playerImg = document.getElementById('player-img');

    // For this implementation, we'll use a placeholder audio
    // In a real application, you would need to use a service that provides audio previews
    const audioSrc = "https://p.scdn.co/mp3-preview/6dfc1f7dad9b737dfe2cdfe9618bd7c9f0e58f2c";

    // Update player UI
    playerTitle.textContent = trackName;
    playerArtist.textContent = artistName;
    playerToggle.innerHTML = '<i class="fas fa-pause"></i>';

    // Show the player
    audioPlayer.classList.add('visible');

    // Set the audio source and play
    audioElement.src = audioSrc;
    audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        showSnackbar('Preview not available. Try another track.');
    });
}

function stopAudio() {
    const audioElement = document.getElementById('audio-element');
    const playerToggle = document.getElementById('player-toggle');

    audioElement.pause();
    playerToggle.innerHTML = '<i class="fas fa-play"></i>';
}

function showSnackbar(message) {
    // Check if snackbar already exists
    let snackbar = document.getElementById('snackbar');

    if (!snackbar) {
        // Create snackbar element
        snackbar = document.createElement('div');
        snackbar.id = 'snackbar';
        document.body.appendChild(snackbar);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #snackbar {
                visibility: hidden;
                min-width: 250px;
                background-color: #333;
                color: #fff;
                text-align: center;
                border-radius: 8px;
                padding: 16px;
                position: fixed;
                z-index: 1;
                left: 50%;
                bottom: 100px;
                transform: translateX(-50%);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                font-size: 14px;
            }
            
            #snackbar.show {
                visibility: visible;
                animation: fadein 0.5s, fadeout 0.5s 2.5s;
            }
            
            @keyframes fadein {
                from {bottom: 0; opacity: 0;}
                to {bottom: 100px; opacity: 1;}
            }
            
            @keyframes fadeout {
                from {bottom: 100px; opacity: 1;}
                to {bottom: 0; opacity: 0;}
            }
        `;
        document.head.appendChild(style);
    }

    // Set the message
    snackbar.textContent = message;

    // Add the show class
    snackbar.className = 'show';

    // After 3 seconds, remove the show class
    setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

function showError(message) {
    const result = document.getElementById('result');
    result.style.color = "#ff4040";
    result.innerHTML = `<div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>${message}</span>
                        </div>`;

    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.style.display = "block";
}

async function handleHttpErrors(res) {
    if (!res.ok) {
        const errorResponse = await res.json().catch(() => ({ message: "Unknown error occurred" }));
        const msg = errorResponse.message ? errorResponse.message : "No error details provided";
        throw new Error(msg);
    }
    return res.json();
}
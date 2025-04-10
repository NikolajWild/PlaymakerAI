const SERVER_URL = 'http://localhost:8080/api/v1/';
console.log("Playmaker JS loaded");

document.addEventListener("DOMContentLoaded", function () {
    // Form submission handler
    document.getElementById('form-songs').addEventListener('submit', getSongs);

    // Add click event to nav items
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
    if (!images || images.length === 0) {
        return '/api/placeholder/200/200';
    }

    // Find the large image or use the largest available
    const largeImage = images.find(img => img.size === 'large' || img.size === 'extralarge');
    return largeImage && largeImage['#text'] ? largeImage['#text'] : '/api/placeholder/200/200';
}

function loadArtistDetails(artistName) {
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
                    </div>
                </div>`;
    });

    return '<div class="playlist-items">' + formattedText + '</div>';
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
const SERVER_URL = 'http://localhost:8080/api/v1/';
console.log("Playmaker JS loaded");

document.addEventListener("DOMContentLoaded", function () {
    // Form submission handler
    document.getElementById('form-songs').addEventListener('submit', getSongs);

    // Add animation to nav items
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Enhance the playlist results display
    const resultContainer = document.getElementById('result');
    if (resultContainer) {
        resultContainer.addEventListener('DOMNodeInserted', enhancePlaylistDisplay);
    }
});

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
    spinner.parentElement.style.display = "flex";
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
        spinner.parentElement.style.display = "none";
        generateBtn.textContent = "Generate Playlist";
    }
}

function formatPlaylistResponse(text) {
    // Convert numbered list to styled items
    let formattedText = text.replace(/(\d+\.\s*)(.*?)(?=\d+\.|$)/gs, (match, number, content) => {
        return `<div class="playlist-item">
                    <div class="playlist-number">${number.trim()}</div>
                    <div class="playlist-content">
                        <div class="song-details">${content.trim()}</div>
                        <button class="play-btn"><i class="fas fa-play"></i></button>
                    </div>
                </div>`;
    });

    // Add CSS for playlist items
    const style = `
        <style>
            .playlist-item {
                display: flex;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .playlist-number {
                color: var(--spotify-subtext);
                font-size: 16px;
                width: 30px;
                text-align: center;
            }
            .playlist-content {
                display: flex;
                flex: 1;
                justify-content: space-between;
                align-items: center;
            }
            .song-details {
                flex: 1;
            }
            .play-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: transparent;
                color: var(--spotify-text);
                border: 1px solid var(--spotify-subtext);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.2s ease;
            }
            .playlist-item:hover .play-btn {
                opacity: 1;
                background: var(--spotify-green);
                border-color: var(--spotify-green);
                color: #000;
            }
        </style>
    `;

    return style + '<div class="playlist-items">' + formattedText + '</div>';
}

function enhancePlaylistDisplay() {
    // Add event listeners to play buttons
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        if (!btn.hasAttribute('listener')) {
            btn.setAttribute('listener', 'true');
            btn.addEventListener('click', function() {
                const songDetails = this.closest('.playlist-content').querySelector('.song-details').textContent;
                console.log(`Would play: ${songDetails}`);

                // Toggle icon
                const icon = this.querySelector('i');
                if (icon.classList.contains('fa-play')) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                } else {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            });
        }
    });
}

function showError(message) {
    const result = document.getElementById('result');
    result.style.color = "#ff4040";
    result.innerHTML = `<div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>${message}</span>
                        </div>`;

    // Style for error message
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            display: flex;
            align-items: center;
            padding: 12px;
            background-color: rgba(255, 64, 64, 0.1);
            border-radius: 4px;
        }
        .error-message i {
            margin-right: 8px;
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
}

async function handleHttpErrors(res) {
    if (!res.ok) {
        const errorResponse = await res.json();
        const msg = errorResponse.message ? errorResponse.message : "No error details provided";
        throw new Error(msg);
    }
    return res.json();
}
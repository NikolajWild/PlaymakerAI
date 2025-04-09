const SERVER_URL = 'http://localhost:8080/api/v1/';

document.getElementById('form-artist').addEventListener('submit', getArtist);
document.getElementById('form-songs').addEventListener('submit', getSongs);
document.getElementById('form-answer').addEventListener('submit', getInfo);

async function getSongs(event) {
    // Prevent the form from reloading the page.
    event.preventDefault();

    const URL = `${SERVER_URL}artist?songs= + ${document.getElementById('songs').value}`
    const spinner = document.getElementById('spinner1');
    const result = document.getElementById('result');
    result.style.color = "black";

    try {
        spinner.style.display = "block";
        const response = await fetch(URL).then(handleHttpErrors)
        document.getElementById('result').innerText = response.answer;
    } catch (e) {
        result.style.color = "red";
        result.innerText = e.message;
    }
    finally {
        spinner.style.display = "none";
    }
}
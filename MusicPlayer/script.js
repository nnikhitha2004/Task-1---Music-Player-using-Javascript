const audio = document.getElementById("audio");
const playlist = document.getElementById("playlist");

const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const autoplay = document.getElementById("autoplay");
const status = document.getElementById("status");
const coverWrap = document.querySelector(".cover-wrap");

// Add your songs, artists, MP3 files and images here.
const songs = [
    {
        title: "My Song 1",
        artist: "My Artist 1",
        src: "music/song1.mp3",
        image: "images/artist1.jpg"
    },
    {
        title: "My Song 2",
        artist: "My Artist 2",
        src: "music/song2.mp3",
        image: "images/artist2.jpg"
    },
    {
        title: "My Song 3",
        artist: "My Artist 3",
        src: "music/song3.mp3",
        image: "images/artist3.jpg"
    }
];

let currentSong = 0;
let shuffle = false;
let repeat = false;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Create the playlist.
function createPlaylist() {
    playlist.innerHTML = "";

    songs.forEach((song, index) => {
        const item = document.createElement("li");
        item.className = "song-item";

        const name = document.createElement("strong");
        name.textContent = song.title;

        const artistName = document.createElement("span");
        artistName.className = "track-artist";
        artistName.textContent = song.artist;

        item.append(name, artistName);

        item.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        playlist.appendChild(item);
    });

    updatePlaylist();
}

// Highlight the selected song.
function updatePlaylist() {
    playlist.querySelectorAll(".song-item").forEach((item, index) => {
        item.classList.toggle("active", index === currentSong);
    });
}

// Display the selected song and artist image.
function loadSong(index) {
    currentSong = index;
    const song = songs[currentSong];

    audio.pause();
    audio.src = song.src;
    audio.load();

    title.textContent = song.title;
    artist.textContent = song.artist;

    // Display the artist image in the existing cover area.
    const cover = document.getElementById("cover-placeholder");

    cover.innerHTML = "";

    const img = document.createElement("img");
    img.src = song.image;
    img.alt = song.artist;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    // Show a music symbol if the image cannot be loaded.
    img.onerror = () => {
        cover.textContent = "🎵";
        cover.style.fontSize = "90px";
    };

    img.onload = () => {
        cover.style.fontSize = "initial";
    };

    cover.appendChild(img);

    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    progress.value = 0;

    playBtn.textContent = "▶";
    playBtn.title = "Play";
    coverWrap.classList.remove("playing");
    status.textContent = "";

    updatePlaylist();
}

// Play the selected song.
async function playSong() {
    try {
        status.textContent = "Loading song...";

        await audio.play();

        playBtn.textContent = "⏸";
        playBtn.title = "Pause";
        coverWrap.classList.add("playing");
        status.textContent = "";
    } catch (error) {
        playBtn.textContent = "▶";
        coverWrap.classList.remove("playing");

        if (error.name === "NotSupportedError") {
            status.textContent = "Cannot play this audio. Check the MP3 file.";
        } else if (error.name === "NotAllowedError") {
            status.textContent = "Click Play again to start the song.";
        } else if (error.name !== "AbortError") {
            status.textContent = "Song could not be played. Check the file path.";
            console.error(error);
        }
    }
}

// Pause the song.
function pauseSong() {
    audio.pause();
    playBtn.textContent = "▶";
    playBtn.title = "Play";
    coverWrap.classList.remove("playing");
    status.textContent = "";
}

// Play/Pause button.
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

// Play the next song.
function nextSong() {
    if (shuffle && songs.length > 1) {
        let nextIndex;

        do {
            nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentSong);

        loadSong(nextIndex);
    } else {
        loadSong((currentSong + 1) % songs.length);
    }

    playSong();
}

// Play the previous song.
function previousSong() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    loadSong((currentSong - 1 + songs.length) % songs.length);
    playSong();
}

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

// Show the total song duration.
audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

// Update the playback progress.
audio.addEventListener("timeupdate", () => {
    currentTime.textContent = formatTime(audio.currentTime);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }
});

// Allow the user to seek through the song.
progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
});

// Update the play button and cover animation.
audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    playBtn.title = "Pause";
    coverWrap.classList.add("playing");
});

audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    playBtn.title = "Play";
    coverWrap.classList.remove("playing");
});

// Handle missing or unsupported audio files.
audio.addEventListener("error", () => {
    status.textContent =
        "Audio file not found or unsupported. Check the selected MP3 file.";
});

// Volume control.
volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
});

// Shuffle control.
shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("selected", shuffle);
    shuffleBtn.title = shuffle ? "Shuffle On" : "Shuffle Off";
});

// Repeat control.
repeatBtn.addEventListener("click", () => {
    repeat = !repeat;
    audio.loop = repeat;
    repeatBtn.classList.toggle("selected", repeat);
    repeatBtn.title = repeat ? "Repeat On" : "Repeat Off";
});

// Automatically play the next song when the current one ends.
audio.addEventListener("ended", () => {
    if (repeat) return;

    if (autoplay.checked) {
        nextSong();
    } else {
        playBtn.textContent = "▶";
        coverWrap.classList.remove("playing");
    }
});

// Initialize the player.
audio.volume = Number(volume.value);
volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;

createPlaylist();
loadSong(0);
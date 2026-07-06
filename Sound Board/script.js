const sounds = [
    {
        "name": "Bell",
        "file": "bell.mp3",
        "color": "bg-red"
    },
    {
        "name": "Discord Call",
        "file": "discord-call.mp3",
        "color": "bg-orange"
    },
    {
        "name": "Fah",
        "file": "fah.mp3",
        "color": "bg-blue"
    },
    {
        "name": "Failure Trumpet",
        "file": "failure-trumpet.mp3",
        "color": "bg-green"
    },
    {
        "name": "Fart",
        "file": "fart.mp3",
        "color": "bg-red"
    },
    {
        "name": "Goofy Car Horn",
        "file": "goofy-car-horn.mp3",
        "color": "bg-orange"
    },
    {
        "name": "Hahaha",
        "file": "hahaha.mp3",
        "color": "bg-blue"
    },
    {
        "name": "Hehe Boi",
        "file": "hehe-boi.mp3",
        "color": "bg-green"
    },
    {
        "name": "I Got This",
        "file": "i-got-this.mp3",
        "color": "bg-red"
    },
    {
        "name": "Mischievous Laugh",
        "file": "mischievous-laugh.mp3",
        "color": "bg-orange"
    },
    {
        "name": "Oouuuu",
        "file": "oouuuu.mp3",
        "color": "bg-blue"
    },
    {
        "name": "Shocked",
        "file": "shocked.mp3",
        "color": "bg-green"
    },
    {
        "name": "Sus",
        "file": "sus.mp3",
        "color": "bg-red"
    },
    {
        "name": "Wait A Minute",
        "file": "wait-a-minute.mp3",
        "color": "bg-orange"
    },
    {
        "name": "Wow",
        "file": "wow.mp3",
        "color": "bg-blue"
    },
    {
        "name": "Yo Phone Linging",
        "file": "yo-phone-linging.mp3",
        "color": "bg-green"
    }
];
// Rendering the board
const board = document.getElementById("board");

sounds.forEach((sound) => {
    const button = document.createElement("button")

    button.className = `${sound.color} h-24 border-2 border-black rounded-3xl text-2xl text-black font-semibold text-white shadow-lg hover:scale-105 transition-all duration-200`;
    
    button.textContent = sound.name;
    
    board.appendChild(button);

    const audio = new Audio(`sounds/${sound.file}`);

    button.addEventListener("click", () => {
        audio.currentTime = 0;
        audio.play();
    });

    sound.audio = audio;
})

// Volume Adjust
const volume = document.getElementById("volume");
const volumeText = document.getElementById("volText")
volumeText.innerHTML = "Volume: " + volume.value*100;

volume.addEventListener("input", () => {
    volumeText.innerHTML = "Volume: " + Math.round(volume.value*100);
    sounds.forEach((sound) => {
        sound.audio.volume = volume.value;
    })
})

// Stop playing
const stopBtn = document.getElementById("stopBtn");

stopBtn.addEventListener("click", () => {
    sounds.forEach((sound) => {
        sound.audio.pause();
        sound.audio.currentTime = 0;
    })
})
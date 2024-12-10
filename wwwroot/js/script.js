
$(document).ready(function () {

    // Show dropdown
    $('.selected').click(function () {
        $('.custom-sel').addClass('show-sel');
        $('.custom-sel a').removeClass('hidden');
    });

    // Hide dropdown when not focused
    $('.custom-sel').focusout(function () {
        $('.custom-sel').removeClass('show-sel');
        $('.custom-sel a:not(:first)').addClass('hidden');
    }).blur(function () {
        $('.custom-sel').removeClass('show-sel');
        $('.custom-sel a:not(:first)').addClass('hidden');
    });

});
$(document).ready(function () {
    $('#recButton').addClass("notRec");

    $('#recButton').click(function () {
        if ($('#recButton').hasClass('notRec')) {
            $('#recButton').removeClass("notRec");
            $('#recButton').addClass("Rec");
            startRecording();
        }
        else {
            $('#recButton').removeClass("Rec");
            $('#recButton').addClass("notRec");
            stopRecording();
        }
    });
});

Swal.fire({
    title: "Do you want to fullscreen?",
    showCancelButton: true,
    confirmButtonText: "Yes",
}).then((result) => {

    if (result.isConfirmed) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }

    }

});

function changeLang(lang) { language = lang }

function AddEvent() {
    document.getElementById("recButton").style.display = "block";
}


function RemoveEvent() {
    document.getElementById("recButton").style.display = "none";
}
let language;
let recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (recognition) {
    recognition = new recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let result;
    recognition.onstart = () => {
        console.log('Recording started');
    };

    recognition.onresult = function (event) {
        result = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                result += event.results[i][0].transcript + ' ';
            } else {
                result += event.results[i][0].transcript;
            }
        }
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
        if (event.error == "not-allowed") {
            Swal.fire({
                title: "Permission Denied",
                text: "Click on the button by the URL and allow access to the microphone.",
                imageUrl: "img/Mic.png",
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: "Custom image"
            });
        }
    };

    recognition.onend = function () {
        console.log(result);
        sendToServer(result);
        console.log('Speech recognition ended');
    };
} else {
    console.error('Speech recognition not supported');
}

function startRecording() {
    recognition.start();
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
}
document.getElementById("eyes").classList.remove("recording");

// Function to stop speaking
function stopSpeech() {
    window.speechSynthesis.cancel();
}
async function getVoicesAsync() {
    return new Promise(resolve => {
        const voices = speechSynthesis.getVoices();

        if (voices.length) {
            // اگر صداها از قبل بارگذاری شده‌اند
            resolve(voices);
        } else {
            // اگر صداها هنوز بارگذاری نشده‌اند
            speechSynthesis.addEventListener('voiceschanged', () => {
                resolve(speechSynthesis.getVoices());
            });
        }
    });
}
async function sendToServer(text) {
    RemoveEvent();
    load();

    $.post('Home/chatAi', { userMessage: text },
        async function (response) {
            endLoad();
            const text = response;
            var voices = await getVoicesAsync();
            const speech = new SpeechSynthesisUtterance(text);
            // Set some properties
            speech.lang = 'en-US'; // Language
            speech.pitch = 1; // Pitch (0 to 2)
            speech.rate = 1; // Speed (0.1 to 10)
            speech.volume = 1; // Volume (0 to 1)
            speech.voice = voices[2];
            speech.onstart = () => { talk(); }
            speech.onend = () => { endTalk(); AddEvent(); }
            // Speak the text
            window.speechSynthesis.speak(speech);
        }
    ).fail(function () {

    });
}

function talk() {
    const bars = document.getElementById("bars");

    bars.style.display = "flex";

}
function endTalk() {
    const bars = document.getElementById("bars");

    bars.style.display = "none";
}
function load() {
    const loader = document.getElementById("load");
    loader.style.display = "block";

}
function endLoad() {
    const loader = document.getElementById("load");
    loader.style.display = "none";

}

function createWave(event) {
    event.preventDefault();

    // ایجاد عنصر برای ایجاد موج
    const wave = document.createElement('div');
    wave.classList.add('wave')

    document.body.appendChild(wave);

    wave.addEventListener('animationend', () => wave.remove());
}

function removeWave() {
    const waves = document.querySelectorAll('.wave');
    waves.forEach(wave => wave.remove());
}
/* ==========================================================================
   KhojSetu — Shared Frontend JavaScript
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // Auto-dismiss flash messages after 5 seconds
    const flashes = document.querySelectorAll(".flash-message");
    flashes.forEach(function (flash) {
        setTimeout(function () {
            flash.style.opacity = "0";
            setTimeout(function () {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, 300);
        }, 5000);
    });

    initScrollReveal();
    initSidebar();
    initScrollProgress();
});

/* ----------------------------------------------------------------------
   Scroll-reveal via Intersection Observer
   Sections fade/slide up as they enter the viewport. Respects
   prefers-reduced-motion.
   ---------------------------------------------------------------------- */

function initScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll(".reveal").forEach(function (el) {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
        observer.observe(el);
    });
}

/* ----------------------------------------------------------------------
   Mobile sidebar toggle
   ---------------------------------------------------------------------- */

function initSidebar() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggle || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add("sidebar--visible");
        overlay.classList.add("sidebar--visible");
        document.body.classList.add("sidebar--open");
        toggle.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
        sidebar.classList.remove("sidebar--visible");
        overlay.classList.remove("sidebar--visible");
        document.body.classList.remove("sidebar--open");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        expanded ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);

    // Close sidebar when a nav link is clicked
    sidebar.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeSidebar);
    });
}

/* Exposed globally so any inline callers still work */
window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    const expanded = sidebar && sidebar.classList.contains("sidebar--visible");
    expanded ? closeSidebarIfDefined() : openSidebarIfDefined();
};

function openSidebarIfDefined() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const toggle = document.querySelector(".mobile-menu-toggle");
    if (!sidebar || !overlay || !toggle) return;
    sidebar.classList.add("sidebar--visible");
    overlay.classList.add("sidebar--visible");
    document.body.classList.add("sidebar--open");
    toggle.setAttribute("aria-expanded", "true");
}

function closeSidebarIfDefined() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const toggle = document.querySelector(".mobile-menu-toggle");
    if (!sidebar || !overlay || !toggle) return;
    sidebar.classList.remove("sidebar--visible");
    overlay.classList.remove("sidebar--visible");
    document.body.classList.remove("sidebar--open");
    toggle.setAttribute("aria-expanded", "false");
}

/* ----------------------------------------------------------------------
   Scroll progress indicator
   ---------------------------------------------------------------------- */

function initScrollProgress() {
    const progress = document.getElementById("scrollProgress");
    if (!progress) return;

    window.addEventListener("scroll", function () {
        const winScroll =
            document.body.scrollTop || document.documentElement.scrollTop;
        const height =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const scrolled = height ? (winScroll / height) * 100 : 0;
        progress.style.transform = "scaleX(" + scrolled / 100 + ")";
    });
}

/* ----------------------------------------------------------------------
   Voice Recording (Gnani Prisma transcription)
   Used on the report page to transcribe spoken item descriptions.
   ---------------------------------------------------------------------- */

let recorderContext = null;
let processor = null;
let microphone = null;
let audioStream = null;
let audioChunks = [];

function startRecording(statusElementId, languageElementId, descriptionElementId) {
    const statusEl = document.getElementById(statusElementId);
    const stopBtn = document.getElementById("stopBtn");

    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
            audioStream = stream;
            recorderContext = new (window.AudioContext || window.webkitAudioContext)();
            microphone = recorderContext.createMediaStreamSource(audioStream);
            processor = recorderContext.createScriptProcessor(4096, 1, 1);
            audioChunks = [];

            processor.onaudioprocess = function (event) {
                audioChunks.push(
                    new Float32Array(event.inputBuffer.getChannelData(0))
                );
                event.outputBuffer.getChannelData(0).fill(0);
            };

            microphone.connect(processor);
            processor.connect(recorderContext.destination);

            if (statusEl) statusEl.textContent = "Recording... Speak now!";
            if (stopBtn) {
                stopBtn.disabled = false;
                stopBtn.textContent = "Stop Recording";
            }
        })
        .catch(function (error) {
            if (statusEl) {
                statusEl.textContent = "Microphone error: " + error.message;
            }
        });
}

function stopRecording(statusElementId, languageElementId, descriptionElementId) {
    if (!processor) return;

    const statusEl = document.getElementById(statusElementId);
    const stopBtn = document.getElementById("stopBtn");

    processor.disconnect();
    microphone.disconnect();

    if (audioStream) {
        audioStream.getTracks().forEach(function (track) {
            track.stop();
        });
    }

    const sampleRate = recorderContext.sampleRate;

    const totalLength = audioChunks.reduce(function (sum, chunk) {
        return sum + chunk.length;
    }, 0);

    const samples = new Float32Array(totalLength);
    let offset = 0;

    audioChunks.forEach(function (chunk) {
        samples.set(chunk, offset);
        offset += chunk.length;
    });

    const wav = createWav(samples, sampleRate);

    recorderContext.close();
    processor = null;

    if (stopBtn) {
        stopBtn.disabled = true;
    }
    if (statusEl) {
        statusEl.textContent = "Recording complete. Sending to Gnani...";
    }

    sendAudio(wav, statusElementId, descriptionElementId);
}

function createWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");

    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    for (let i = 0; i < samples.length; i++) {
        const value = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(
            44 + i * 2,
            value < 0 ? value * 32768 : value * 32767,
            true
        );
    }

    return new Blob([buffer], { type: "audio/wav" });
}

function sendAudio(wav, statusElementId, descriptionElementId) {
    const statusEl = document.getElementById(statusElementId);
    const descEl = document.getElementById(descriptionElementId);
    const languageSelect = document.getElementById("language");

    const formData = new FormData();
    formData.append("audio", wav, "recording.wav");
    formData.append(
        "language",
        languageSelect ? languageSelect.value : "hi-IN"
    );

    fetch("/transcribe", {
        method: "POST",
        body: formData,
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (descEl && result.transcript) {
                descEl.value = result.transcript;
            }
            if (statusEl) {
                statusEl.textContent = "Voice transcribed successfully!";
            }
        })
        .catch(function (error) {
            if (statusEl) {
                statusEl.textContent = "Error: " + error.message;
            }
        });
}

/* ----------------------------------------------------------------------
   Text-to-Speech (Gnani Timbre)
   Used on match-details page to read match updates aloud.
   ---------------------------------------------------------------------- */

let currentAudioUrl = null;

function initTTS(
    speakButtonId,
    languageSelectId,
    statusTextId,
    audioPlayerId,
    matchDataId
) {
    const speakButton = document.getElementById(speakButtonId);
    const languageSelect = document.getElementById(languageSelectId);
    const statusText = document.getElementById(statusTextId);
    const audioPlayer = document.getElementById(audioPlayerId);
    const matchData = document.getElementById(matchDataId);

    if (!speakButton || !languageSelect || !statusText || !audioPlayer || !matchData) {
        return;
    }

    const score = matchData.dataset.score || "0";
    const originalItem = matchData.dataset.originalItem || "your item";
    const matchedItem = matchData.dataset.matchedItem || "a matching item";
    const matchedLocation = matchData.dataset.matchedLocation || "unknown location";

    speakButton.addEventListener("click", async function () {
        const language = languageSelect.value;

        let message;
        if (language === "hi-IN") {
            message =
                "आपकी रिपोर्ट " +
                originalItem +
                " के लिए एक संभावित मैच मिला है। दूसरी रिपोर्ट में " +
                matchedItem +
                " का उल्लेख है। स्थान " +
                matchedLocation +
                " है। समानता स्कोर " +
                score +
                " प्रतिशत है। कृपया वस्तु लौटाने से पहले मालिकाना हक की पुष्टि करें।";
        } else {
            message =
                "A possible match has been found for your report about " +
                originalItem +
                ". The other report mentions " +
                matchedItem +
                " at " +
                matchedLocation +
                ". The similarity score is " +
                score +
                " percent. Please verify ownership before returning the item.";
        }

        speakButton.disabled = true;
        statusText.textContent = "Generating voice... Please wait.";
        audioPlayer.hidden = true;
        audioPlayer.pause();

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }

        try {
            const response = await fetch("/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, language: language }),
            });

            if (!response.ok) {
                let errorMessage = "Speech generation failed. Please try again.";
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // keep default
                }
                throw new Error(errorMessage);
            }

            const audioBlob = await response.blob();
            currentAudioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = currentAudioUrl;
            audioPlayer.hidden = false;
            statusText.textContent = "Voice generated. Press play to listen.";
            await audioPlayer.play();
        } catch (error) {
            statusText.textContent = error.message || "Unable to generate voice. Please try again.";
        } finally {
            speakButton.disabled = false;
        }
    });
}

/* ----------------------------------------------------------------------
   Expose recording functions to HTML inline event handlers
   ---------------------------------------------------------------------- */

window.startRecording = startRecording;
window.stopRecording = stopRecording;
window.initTTS = initTTS;

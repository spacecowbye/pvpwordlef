let stylesInjected = false;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement("style");

    style.textContent = `
    /* ---------- Toast ---------- */
    .pvp-toast-container {
        position: fixed;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
    }

    .pvp-toast {
        background: var(--text);
        color: var(--bg);
        font-family: 'Clear Sans', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow: 0 4px 23px rgba(0, 0, 0, 0.5);
        animation: pvpToastIn .15s ease forwards;
        text-align: center;
    }

    /* ---------- Modern Wordle Minimal Notification ---------- */
    .pvp-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.82);
        z-index: 99998;
        animation: pvpFade .15s ease;
    }

    .pvp-dialog-minimal {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 32px 24px;
        width: min(340px, 88vw);
        box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
        text-align: center;
        font-family: 'Clear Sans', sans-serif;
    }

    .pvp-dialog-text {
        color: var(--text);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.6;
        letter-spacing: 0.02em;
        margin: 0 0 24px 0;
    }

    .pvp-btn-minimal {
        width: 100%;
        height: 44px;
        border-radius: 6px;
        border: none;
        background: var(--text);
        color: var(--bg);
        font-family: 'Clear Sans', sans-serif;
        font-weight: 700;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: filter 0.15s;
    }

    .pvp-btn-minimal:hover {
        filter: brightness(0.9);
    }

    @keyframes pvpToastIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: none; }
    }

    @keyframes pvpFade {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    `;

    document.head.appendChild(style);
}

function toastContainer() {
    let c = document.getElementById("pvp-toast-container");
    if (c) return c;
    c = document.createElement("div");
    c.id = "pvp-toast-container";
    c.className = "pvp-toast-container";
    document.body.appendChild(c);
    return c;
}

function showToast(message, duration = 2000) {
    injectStyles();

    const toast = document.createElement("div");
    toast.className = `pvp-toast`;
    toast.textContent = message;

    toastContainer().appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all .18s ease";
        setTimeout(() => toast.remove(), 180);
    }, duration);
}

function showNotification(message) {
    injectStyles();

    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.className = "pvp-overlay";

        overlay.innerHTML = `
        <div class="pvp-dialog-minimal">
            <p class="pvp-dialog-text">${message}</p>
            <button class="pvp-btn-minimal">OK</button>
        </div>
        `;

        document.body.appendChild(overlay);

        const closeNotification = () => {
            overlay.remove();
            window.removeEventListener("keydown", keyHandler);
            resolve();
        };

        overlay.querySelector(".pvp-btn-minimal").onclick = closeNotification;
        
        overlay.onclick = e => {
            if (e.target === overlay) closeNotification();
        };

        const keyHandler = e => {
            if (e.key === "Escape" || e.key === "Enter") {
                closeNotification();
            }
        };
        window.addEventListener("keydown", keyHandler);
    });
}

function showError(message) {
    const failureSayings = [
        "Expected: 42, Your Output: null. So close!",
        "Passed 5/5 sample cases. Failed 98/100 hidden cases.",
        "Edge cases? Never heard of her.",
        "Runtime Error. Time to flip burgers.",
        "Wrong Answer. Yeah, time to switch majors.",
        "Your job prospects just took a segmentation dump.",
        "At this rate, you’ll be debugging cash registers instead of code.",
        "Congrats, you've unlocked the 'Unpaid Internship' achievement."
    ];
    
    const finalMessage = message || failureSayings[Math.floor(Math.random() * failureSayings.length)];
    return showNotification(finalMessage);
}
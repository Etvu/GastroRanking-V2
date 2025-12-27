let timeout;

export const MessageService = {
    show(message, type = "success", duration = 2500) {
        const el = document.getElementById("message");

        if (!el) {
            console.warn("⚠️ #message introuvable dans le HTML");
            return;
        }

        clearTimeout(timeout);

        el.textContent = message;

        el.className = `message show ${type}`;

        timeout = setTimeout(() => {
            el.classList.remove("show");
        }, duration);
    }
};
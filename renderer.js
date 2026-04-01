function renderMessages(messages, previewElement) {
    previewElement.innerHTML = '';

    // Fake time to make it look real
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.isAgent ? 'in' : 'out'}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';

        if (msg.isAgent) {
            const senderSpan = document.createElement('div');
            senderSpan.className = 'message-sender';
            senderSpan.textContent = msg.sender;
            bubbleDiv.appendChild(senderSpan);
        }

        const textSpan = document.createElement('span');
        // Join array with new lines
        textSpan.innerHTML = msg.text.join('\n').replace(/\n/g, '<br>');
        bubbleDiv.appendChild(textSpan);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = timeString;
        bubbleDiv.appendChild(timeSpan);

        msgDiv.appendChild(bubbleDiv);

        if (msg.buttons && msg.buttons.length > 0) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'message-buttons';
            msg.buttons.forEach(btnText => {
                const btnElement = document.createElement('div');
                btnElement.className = 'message-button';
                btnElement.textContent = btnText;
                buttonsContainer.appendChild(btnElement);
            });
            msgDiv.appendChild(buttonsContainer);
        }

        previewElement.appendChild(msgDiv);
    });

    // Scroll to bottom
    previewElement.scrollTop = previewElement.scrollHeight;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderMessages };
}

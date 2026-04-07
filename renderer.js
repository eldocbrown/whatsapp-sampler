function formatWhatsAppText(text, isAgent) {
    if (!text) return '';
    
    // HTML Escaping
    let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Bold: *text* -> <strong>text</strong>
    // Italic: _text_ -> <em>text</em>
    // Only applied for agent messages
    if (isAgent) {
        formatted = formatted.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    }

    // Newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

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

        if (msg.image) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'bubble-image-container';
            const imgElement = document.createElement('img');
            imgElement.src = msg.image;
            imgElement.className = 'bubble-image';
            imgContainer.appendChild(imgElement);
            bubbleDiv.appendChild(imgContainer);
        }

        const textSpan = document.createElement('span');
        // Join array with new lines and format
        textSpan.innerHTML = formatWhatsAppText(msg.text.join('\n'), msg.isAgent);
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

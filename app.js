document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('chat-preview');

    editor.addEventListener('input', updateChat);

    // Initial render if there is default text
    updateChat();

    function updateChat() {
        const text = editor.value;
        const lines = text.split('\n');
        
        let messages = [];
        let currentMessage = null;

        const senderRegex = /^([^:]+):\s*(.*)$/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip purely empty lines if we have no current message
            if (line.trim() === '' && !currentMessage) continue;

            const match = line.match(senderRegex);

            if (match) {
                // New sender
                if (currentMessage) {
                    messages.push(currentMessage);
                }
                
                const name = match[1].trim();
                const content = match[2].trim();
                
                const isAgent = (name.toLowerCase() === 'agent' || name.toLowerCase() === 'agente');
                
                currentMessage = {
                    sender: name,
                    isAgent: isAgent,
                    text: [content]
                };
            } else {
                // Determine what to do with lines that don't match "Name:"
                if (currentMessage) {
                    // Append to the current message
                    currentMessage.text.push(line);
                } else {
                    // First line without a sender, could treat as default Agent or System
                    if (line.trim() !== '') {
                        currentMessage = {
                            sender: 'Maria', // Default assumed other user
                            isAgent: false,
                            text: [line]
                        };
                    }
                }
            }
        }

        // Push the last one
        if (currentMessage) {
            messages.push(currentMessage);
        }

        renderMessages(messages);
    }

    function renderMessages(messages) {
        preview.innerHTML = '';

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
            preview.appendChild(msgDiv);
        });

        // Scroll to bottom
        preview.scrollTop = preview.scrollHeight;
    }
});

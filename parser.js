function parseChatText(text) {
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

    messages.forEach(msg => {
        if (msg.isAgent) {
            const buttons = [];
            const newText = [];
            let inButtonSection = false;

            for (let i = 0; i < msg.text.length; i++) {
                const line = msg.text[i].trim();
                
                if (line === '') {
                    if (!inButtonSection) {
                        newText.push(msg.text[i]); // Preserve original empty lines before buttons
                    }
                    continue;
                }

                const match = line.match(/^\[(.*?)\]$/);
                if (match) {
                    inButtonSection = true;
                    buttons.push(match[1].trim());
                } else {
                    if (!inButtonSection) {
                        newText.push(msg.text[i]);
                    }
                    // If we are in the button section, we dismiss this text.
                }
            }

            if (buttons.length > 0) {
                msg.buttons = buttons;
                msg.text = newText;
                
                // remove trailing empty lines from the remaining text
                while(msg.text.length > 0 && msg.text[msg.text.length - 1].trim() === '') {
                    msg.text.pop();
                }
            }
        }
    });

    return messages;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseChatText };
}

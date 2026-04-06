function parseChatText(text) {
    const lines = text.replace(/\r/g, '').replace(/\u2028|\u2029/g, '\n').split('\n');

    let messages = [];
    let currentMessage = null;

    const senderRegex = /^([^:]+):\s*(.*)$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip purely empty lines if we have no current message
        if (line.trim() === '' && !currentMessage) continue;

        const match = line.match(senderRegex);
        const isImageLine = line.trim().match(/^\[img:\s*.*?\]$/i);

        if (match && !isImageLine) {
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
                let lineContent = msg.text[i];
                let trimmedLine = lineContent.trim();
                
                if (trimmedLine === '') {
                    if (!inButtonSection) {
                        newText.push(lineContent);
                    }
                    continue;
                }

                // Check for image: [img: URL]
                const imgMatch = trimmedLine.match(/\[img:\s*(.*?)\]/i);
                if (imgMatch) {
                    msg.image = imgMatch[1].trim();
                    // Remove the [img: URL] part from the line
                    lineContent = lineContent.replace(/\[img:\s*.*?\]/i, '').trim();
                    if (lineContent === '') continue; // skip if line was only the image tag
                    trimmedLine = lineContent.trim();
                }

                const buttonMatch = trimmedLine.match(/^\[(.*?)\]$/);
                if (buttonMatch) {
                    inButtonSection = true;
                    buttons.push(buttonMatch[1].trim());
                } else {
                    if (!inButtonSection) {
                        newText.push(lineContent);
                    }
                }
            }

            if (buttons.length > 0 || msg.image) {
                if (buttons.length > 0) {
                    msg.buttons = buttons;
                }
                msg.text = newText;
            }
        }
    });

    return messages;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseChatText };
}

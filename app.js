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

    // --- Copy Chat as Image Logic ---
    const copyBtn = document.getElementById('copy-chat-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const tooltip = copyBtn.querySelector('.tooltip');
            const container = document.querySelector('.whatsapp-container');
            const body = document.querySelector('.whatsapp-body');

            // Save original CSS
            const origContainerProps = {
                height: container.style.height,
                overflow: container.style.overflow
            };
            const origBodyProps = {
                height: body.style.height,
                overflow: body.style.overflow,
                flex: body.style.flex
            };

            // Expand container fully to capture all content
            container.classList.add('exporting');
            container.style.height = 'auto';
            container.style.overflow = 'visible';

            body.style.height = body.scrollHeight + 'px';
            body.style.overflow = 'visible';
            body.style.flex = 'none';

            try {
                // Wait briefly for DOM to fully recalculate layout
                await new Promise(resolve => setTimeout(resolve, 50));

                const canvas = await html2canvas(container, {
                    useCORS: true,
                    scale: 2, // Retain high quality
                    backgroundColor: '#efeae2',
                });

                canvas.toBlob(async (blob) => {
                    try {
                        const item = new ClipboardItem({ "image/png": blob });
                        await navigator.clipboard.write([item]);
                        tooltip.textContent = "¡Copiado!";
                    } catch (err) {
                        console.error('Failed to copy to clipboard', err);
                        tooltip.textContent = "Error al copiar";
                    }

                    // Reset tooltip naturally after a delay
                    setTimeout(resetTooltip, 2000);
                }, 'image/png');

            } catch (err) {
                console.error("Error generating image:", err);
                tooltip.textContent = "Error";
                setTimeout(resetTooltip, 2000);
            } finally {
                // Instantly restore the scroll view
                container.classList.remove('exporting');
                container.style.height = origContainerProps.height;
                container.style.overflow = origContainerProps.overflow;

                body.style.height = origBodyProps.height;
                body.style.overflow = origBodyProps.overflow;
                body.style.flex = origBodyProps.flex;

                // Re-enforce scroll to bottom
                preview.scrollTop = preview.scrollHeight;
            }

            function resetTooltip() {
                tooltip.style.opacity = "";
                tooltip.style.visibility = "";
                tooltip.style.transitionDelay = "";
                setTimeout(() => {
                    tooltip.textContent = originalTooltipText;
                }, 200); // Wait for fade out
            }
        });
    }
});

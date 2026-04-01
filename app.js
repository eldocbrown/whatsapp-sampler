document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('chat-preview');

    editor.addEventListener('input', updateChat);

    // Initial render if there is default text
    updateChat();

    function updateChat() {
        const text = editor.value;
        const messages = parseChatText(text);

        renderMessages(messages, preview);
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

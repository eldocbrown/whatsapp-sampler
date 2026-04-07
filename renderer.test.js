/**
 * @jest-environment jsdom
 */

const { renderMessages } = require('./renderer');

describe('renderMessages', () => {
    let previewElement;

    beforeEach(() => {
        document.body.innerHTML = '<div id="preview"></div>';
        previewElement = document.getElementById('preview');
        
        Object.defineProperty(previewElement, 'scrollTop', { writable: true, value: 0 });
        Object.defineProperty(previewElement, 'scrollHeight', { writable: false, value: 100 });
    });

    test('should clear previous content', () => {
        previewElement.innerHTML = '<div>Old content</div>';
        renderMessages([], previewElement);
        expect(previewElement.innerHTML).toBe('');
    });

    test('should render a user (non-agent) message correctly', () => {
        const messages = [
            { isAgent: false, sender: 'User', text: ['Hello'] }
        ];

        renderMessages(messages, previewElement);

        const msgDivs = previewElement.querySelectorAll('.message');
        expect(msgDivs.length).toBe(1);
        
        const msgDiv = msgDivs[0];
        expect(msgDiv.classList.contains('out')).toBe(true);
        expect(msgDiv.classList.contains('in')).toBe(false);

        const senderSpan = msgDiv.querySelector('.message-sender');
        expect(senderSpan).toBeNull(); 

        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('Hello');
    });

    test('should render an agent message correctly', () => {
        const messages = [
            { isAgent: true, sender: 'Support', text: ['Hi there', 'How can I help?'] }
        ];

        renderMessages(messages, previewElement);

        const msgDivs = previewElement.querySelectorAll('.message');
        expect(msgDivs.length).toBe(1);
        
        const msgDiv = msgDivs[0];
        expect(msgDiv.classList.contains('in')).toBe(true);
        expect(msgDiv.classList.contains('out')).toBe(false);

        const senderSpan = msgDiv.querySelector('.message-sender');
        expect(senderSpan).not.toBeNull();
        expect(senderSpan.textContent).toBe('Support');

        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('Hi there<br>How can I help?');
    });

    test('should render multiple messages', () => {
        const messages = [
            { isAgent: false, sender: 'User', text: ['Hi'] },
            { isAgent: true, sender: 'Support', text: ['Hello', 'How can I help?'] }
        ];

        renderMessages(messages, previewElement);

        const msgDivs = previewElement.querySelectorAll('.message');
        expect(msgDivs.length).toBe(2);
        expect(msgDivs[0].classList.contains('out')).toBe(true);
        expect(msgDivs[1].classList.contains('in')).toBe(true);
    });

    test('should add time to messages', () => {
        const messages = [
            { isAgent: false, sender: 'User', text: ['Hi'] }
        ];

        renderMessages(messages, previewElement);

        const timeSpan = previewElement.querySelector('.message-time');
        expect(timeSpan).not.toBeNull();
        expect(timeSpan.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    test('should scroll to bottom', () => {
        renderMessages([], previewElement);
        expect(previewElement.scrollTop).toBe(100);
    });

    test('should render buttons for agent messages when present', () => {
        const messages = [
            { isAgent: true, sender: 'Support', text: ['Choose:'], buttons: ['Option 1', 'Option 2'] }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const buttonsContainer = msgDiv.querySelector('.message-buttons');
        expect(buttonsContainer).not.toBeNull();
        
        const buttons = buttonsContainer.querySelectorAll('.message-button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toBe('Option 1');
        expect(buttons[1].textContent).toBe('Option 2');
    });
    test('should render an image at the top of the bubble for agent messages', () => {
        const messages = [
            { isAgent: true, sender: 'Support', text: ['Hello'], image: 'https://example.com/test.jpg' }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const imgContainer = msgDiv.querySelector('.bubble-image-container');
        expect(imgContainer).not.toBeNull();
        
        const imgElement = imgContainer.querySelector('img.bubble-image');
        expect(imgElement).not.toBeNull();
        expect(imgElement.src).toBe('https://example.com/test.jpg');

        // Check order: sender -> image -> text
        const bubble = msgDiv.querySelector('.bubble');
        const children = Array.from(bubble.childNodes);
        const senderIndex = children.findIndex(n => n.classList?.contains('message-sender'));
        const imageIndex = children.findIndex(n => n.classList?.contains('bubble-image-container'));
        const textIndex = children.findIndex(n => n.tagName === 'SPAN' && !n.classList.contains('message-time'));

        expect(senderIndex).toBeLessThan(imageIndex);
        expect(imageIndex).toBeLessThan(textIndex);
    });

    test('should render bold text when wrapped in asterisks for agent messages', () => {
        const messages = [
            { isAgent: true, sender: 'Support', text: ['El precio es de *90 MXN*.'] }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('El precio es de <strong>90 MXN</strong>.');
    });

    test('should NOT render bold text when wrapped in asterisks for non-agent messages', () => {
        const messages = [
            { isAgent: false, sender: 'Juan', text: ['El precio es de *90 MXN*.'] }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('El precio es de *90 MXN*.');
    });

    test('should render italic text when wrapped in underscores for agent messages', () => {
        const messages = [
            { isAgent: true, sender: 'Support', text: ['El precio es de _90 MXN_.'] }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('El precio es de <em>90 MXN</em>.');
    });

    test('should NOT render italic text when wrapped in underscores for non-agent messages', () => {
        const messages = [
            { isAgent: false, sender: 'Juan', text: ['El precio es de _90 MXN_.'] }
        ];

        renderMessages(messages, previewElement);

        const msgDiv = previewElement.querySelector('.message');
        const textSpan = msgDiv.querySelector('span:not(.message-time)');
        expect(textSpan.innerHTML).toBe('El precio es de _90 MXN_.');
    });
});

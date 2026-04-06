/**
 * @jest-environment jsdom
 */
const { parseChatText } = require('./parser');

describe('parseChatText', () => {
    test('should parse a basic conversation between two users', () => {
        const text = `Cliente: Hola, quería saber el precio
Agente: ¡Hola! Claro, cuesta $500.`;
        const result = parseChatText(text);

        expect(result).toHaveLength(2);
        
        expect(result[0]).toEqual({
            sender: 'Cliente',
            isAgent: false,
            text: ['Hola, quería saber el precio']
        });

        expect(result[1]).toEqual({
            sender: 'Agente',
            isAgent: true,
            text: ['¡Hola! Claro, cuesta $500.']
        });
    });

    test('should handle multi-line messages correctly', () => {
        const text = `Agente: Hola.
Este es un mensaje en dos líneas.
Cliente: Gracias, no me interesa.
Para la próxima.`;
        const result = parseChatText(text);

        expect(result).toHaveLength(2);

        expect(result[0].sender).toBe('Agente');
        expect(result[0].text).toEqual(['Hola.', 'Este es un mensaje en dos líneas.']);

        expect(result[1].sender).toBe('Cliente');
        expect(result[1].text).toEqual(['Gracias, no me interesa.', 'Para la próxima.']);
    });

    test('should identify variants of "agent" and "agente" as isAgent=true', () => {
        const text = `agent: Test 1
AGENT: Test 2
Agente: Test 3
agente: Test 4
Otro: No es agente`;
        const result = parseChatText(text);

        expect(result).toHaveLength(5);
        expect(result[0].isAgent).toBe(true);
        expect(result[1].isAgent).toBe(true);
        expect(result[2].isAgent).toBe(true);
        expect(result[3].isAgent).toBe(true);
        expect(result[4].isAgent).toBe(false);
    });

    test('should ignore empty lines between messages', () => {
        const text = `Cliente: uno

DOS

Agente: tres


`;
        const result = parseChatText(text);

        expect(result).toHaveLength(2);

        expect(result[0].text).toEqual(['uno', '', 'DOS', '']);
        expect(result[1].text).toEqual(['tres', '', '', '']);
    });

    test('should fallback to default User (Maria) if starting without a sender', () => {
        const text = `Hola, este es un texto sin remitente.
Y sigue acá.
Agente: Hola Maria.`;
        
        const result = parseChatText(text);

        expect(result).toHaveLength(2);

        expect(result[0].sender).toBe('Maria');
        expect(result[0].isAgent).toBe(false);
        expect(result[0].text).toEqual(['Hola, este es un texto sin remitente.', 'Y sigue acá.']);

        expect(result[1].sender).toBe('Agente');
        expect(result[1].text).toEqual(['Hola Maria.']);
    });

    test('should return empty array for empty text', () => {
        const result = parseChatText('');
        expect(result).toHaveLength(0);
    });

    test('should extract buttons from agent messages', () => {
        const text = `Agente: Hola
¿Te interesa?
[Sí, me interesa]
[No por ahora]`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].text).toEqual(['Hola', '¿Te interesa?']);
        expect(result[0].buttons).toEqual(['Sí, me interesa', 'No por ahora']);
    });

    test('should not extract buttons from non-agent messages', () => {
        const text = `Cliente: Mi mensaje
[Boton falso]`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].text).toEqual(['Mi mensaje', '[Boton falso]']);
        expect(result[0].buttons).toBeUndefined();
    });

    test('should dismiss text after buttons in agent messages', () => {
        const text = `Agente: Hola
¿Te interesa?
[Sí, me interesa]
[No por ahora]
Este texto debe ser ignorado completamente.
Y este también.`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].text).toEqual(['Hola', '¿Te interesa?']);
        expect(result[0].buttons).toEqual(['Sí, me interesa', 'No por ahora']);
    });
    test('should extract image from agent messages and remove tag from text', () => {
        const text = `Agente: Hola [img: https://example.com/test.jpg]
¿Te interesa?`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].image).toBe('https://example.com/test.jpg');
        expect(result[0].text).toEqual(['Hola', '¿Te interesa?']);
    });

    test('should extract image from a separate line in agent messages', () => {
        const text = `Agente: Hola
[img: https://example.com/test.jpg]
¿Te interesa?`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].image).toBe('https://example.com/test.jpg');
        expect(result[0].text).toEqual(['Hola', '¿Te interesa?']);
    });

    test('should not extract image from non-agent messages', () => {
        const text = `Cliente: [img: https://example.com/test.jpg]`;
        const result = parseChatText(text);
        expect(result).toHaveLength(1);
        expect(result[0].image).toBeUndefined();
        expect(result[0].text).toEqual(['[img: https://example.com/test.jpg]']);
    });
});


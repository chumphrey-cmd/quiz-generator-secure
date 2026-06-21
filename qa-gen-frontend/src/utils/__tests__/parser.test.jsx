import { parseAndMapQuestions } from "../parser.js";

describe('parseAndMapQuestions', () => {

    it('should successfully parse a single valid question - parseRawText', () => {

        // Arrange
        const rawInputText = '1. What is the capital of France?\n' +
            'A. Berlin\n' +
            'B. Madrid\n' +
            'C. Paris*\n' +
            'D. Rome';

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert the shape of what the backend expects
        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.data).toEqual([
            {
                questionNumber: 1,
                text: "What is the capital of France?",
                options: [
                    "A. Berlin",
                    "B. Madrid",
                    "C. Paris",
                    "D. Rome"
                ],
                correctAnswers: [
                    "C. Paris"
                ]
            }
        ]);
    });

    it('should NOT parse the question if there is not (*) for the correct answer - validateQuestions', () => {

        // Arrange
        const rawInputText = '1. What is the capital of France?\n' +
            'A. Berlin\n' +
            'B. Madrid\n' +
            'C. Paris\n' +
            'D. Rome';

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toEqual([
            "Question 1 is missing properties or missing correct answer asterisk (*)."
        ]);
        expect(result.data).toEqual(null)
    });

    it('should throw error if there are < 2 answer options', () => {

        // Arrange
        const rawInputText = '1. What is the capital of France?\n' +
            'A. Rome*';

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toEqual([
            "Question 1: Must have at least two options."
        ]);
        expect(result.data).toBe(null);
    });

    it('should throw error if there are no valid questions', () => {

        // Arrange
        const rawInputText = 'What is the capital of France?';

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toEqual([
            "No valid questions found. Check text formatting."
        ]);
        expect(result.data).toBe(null);
    });

    it('should throw an error if there is not sequential lettering (A, B, C, ...)', () => {
        // Arrange
        const rawInputText = '1. What is the capital of France?\n' +
            'A. Berlin\n' +
            'C. Madrid*\n' +
            'C. Paris\n' +
            'D. Rome';

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toEqual([
            "Question 1: Lettering not sequential. Expected B."
        ]);
        expect(result.data).toBe(null);
    });

    it('should not find any valid questions if user submits random information', () => {
        // Arrange
        const rawInputText = "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. Placerat in id cursus mi pretium tellus duis. Pretium tellus duis convallis tempus leo eu aenean."

        // Act
        const result = parseAndMapQuestions(rawInputText);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toEqual([
            "No valid questions found. Check text formatting."
        ]);
        expect(result.data).toBe(null);
    });
});
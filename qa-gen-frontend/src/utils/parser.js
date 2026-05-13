/**
 * Main function. Takes raw text, parses it, validates it,
 * and maps it to Spring Boot QuestionDTO format.
 */
export function parseAndMapQuestions(text) {
    // 1. Extract raw data
    const parsedQuestions = parseRawText(text);

    // 2. Validate data
    const errors = validateQuestions(parsedQuestions);

    // 3. Return errors if validation fails
    if (errors.length > 0) {
        return { success: false, errors: errors, data: null };
    }

// 4. Map to QuestionDTO expected by Java backend
    const mappedQuestions = parsedQuestions.map(q => ({
        questionNumber: q.number,
        text: q.text,
        options: q.answers.map(a => `${a.letter}. ${a.text}`),

        // Map the correct letters to their full matching option string so Spring Boot's .contains() validation passes perfectly.
        correctAnswers: q.answers
            .filter(a => q.correct.includes(a.letter))
            .map(a => `${a.letter}. ${a.text}`)
    }));

    return { success: true, errors: [], data: mappedQuestions };
}

// Private function: Parses text into JS objects
function parseRawText(text) {
    const questions = [];

    // Clean and normalize the input text
    // \r represents a carriage return character
    // \n represents a line feed (newline) character
    // /g is a global flag that means "replace all occurrences" in the text, not just the first match
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split text into separate question blocks
    // Use + to handle multiple blank lines between questions
    const questionBlocks = cleanText.split(/\n\s*\n+/);

    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').map(line => line.trim());

        // Check if the first line exists before trying to match
        if (!lines[0]) return;

        const questionMatch = lines[0].match(/^(\d+)\.\s*(.*)/);

        if (questionMatch) {

            // Extract question number and text
            const questionNumber = parseInt(questionMatch[1], 10);
            const questionText = questionMatch[2];
            const answers = [];

            // Use an array to store multiple correct letters
            let correctAnswers = [];

            // Index to track current line being processed for answers
            let lineIndex = 1;

            // Process answers (A, B, C, D, ...) dynamically
            // Using a while loop to handle variable number of answer lines.
            while (lineIndex < lines.length && lines[lineIndex]) {
                const answerMatch = lines[lineIndex].match(/^([A-Z])\.\s*(.*)/);

                if (answerMatch) {
                    const letter = answerMatch[1];
                    let text = answerMatch[2].trim();

                    // Strip asterisk and save correct letter
                    if (text.endsWith('*')) {
                        text = text.slice(0, -1).trim();
                        correctAnswers.push(letter);
                    }

                    answers.push({ letter, text });
                } else {
                    // If the line doesn't start with an uppercase letter and period, assume it's not an answer and stop processing answers for this question.
                    break;
                }
                lineIndex++;
            }

            // Check if correctAnswers array has at least one entry.
            if (answers.length >= 2 && correctAnswers.length > 0) {
                questions.push({
                    // Original number, will be renumbered after shuffle
                    number: questionNumber,
                    text: questionText,
                    answers: answers,
                    // Store the array of correct letters
                    correct: correctAnswers
                });
            }
        }
    });

    return questions;
}

// Validation function to check question format and requirements. Maps to business logic.
function validateQuestions(questions) {
    const errors = [];

    if (!Array.isArray(questions) || questions.length === 0) {
        errors.push("No valid questions found. Check text formatting.");
        return errors;
    }

    questions.forEach((question, index) => {
        if (!question || typeof question !== 'object') {
            errors.push(`Item at index ${index} is not a valid question.`);
            return;
        }

        if (typeof question.number !== 'number' ||
            typeof question.text !== 'string' ||
            !Array.isArray(question.answers) || // Must be an array
            !Array.isArray(question.correct) ||
            question.correct.length === 0 || // Must not be empty
            !question.correct.every(c => typeof c === 'string')) { // All elements must be strings.
            errors.push(`Question ${question.number || (index + 1)} is missing properties or missing correct answer asterisk (*).`);
        }

        if (question.answers.length < 2) {
            errors.push(`Question ${question.number}: Must have at least two options.`);
        }
        // Check if the stored 'correct' letters exist in the parsed answers. Only run this check if question.correct is a valid array (helps avoid errors)
        if (Array.isArray(question.correct) && question.correct.length > 0) {
            const answerLetters = question.answers.map(ans => ans.letter);
            const invalidCorrectLetters = question.correct.filter(correctLetter => !answerLetters.includes(correctLetter));

            if (invalidCorrectLetters.length > 0) {
                errors.push(`Question ${question.number}: Marked answers ('${invalidCorrectLetters.join(', ')}') do not match options.`);
            }
        }

        // Check answer letters sequence (A, B, C, ...)
        for (let i = 0; i < question.answers.length; i++) {
            const expectedLetter = String.fromCharCode(65 + i);
            if (!question.answers[i] || question.answers[i].letter !== expectedLetter) {
                errors.push(`Question ${question.number}: Lettering not sequential. Expected ${expectedLetter}.`);
                break;
            }
        }
    });

    return errors;
}
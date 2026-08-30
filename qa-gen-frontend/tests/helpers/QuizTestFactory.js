export const ValidQuizTestFactory = () => {
    return (
        '1. What is the capital of France?\n' +
        'A. Berlin\n' +
        'B. Madrid\n' +
        'C. Paris*\n' +
        'D. Rome\n' +
        '\n' +
        '2. Which planet is known as the Red Planet?\n' +
        'A. Earth\n' +
        'B. Mars*\n' +
        'C. Jupiter\n' +
        'D. Saturn\n' +
        '\n' +
        '3. Select all of the following that are numbers.\n' +
        'A. 1*\n' +
        'B. 2*\n' +
        'C. 3*\n' +
        'D. $\n' +
        'E. 5*\n' +
        'F. ^'
    );
};

export const InvalidQuizTestFactory = () => {
    return ('1. What is the capital of France?\n' +
        'A. Berlin\n' +
        'B. Madrid\n' +
        'C. Paris*\n' +
        'D. Rome\n' +
        '\n' +
        '2. MISSING ANSWER (*) HERE...\n' +
        'A. Earth\n' +
        'B. Mars\n' +
        'C. Jupiter\n' +
        'D. Saturn\n' +
        '\n' +
        '3. Select all of the following that are numbers.\n' +
        'A. 1*\n' +
        'B. 2*\n' +
        'C. 3*\n' +
        'D. $\n' +
        'E. 5*\n' +
        'F. ^'
    )
}
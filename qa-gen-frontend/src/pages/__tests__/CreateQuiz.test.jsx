import {render, screen} from "@testing-library/react";
import CreateQuiz from "../CreateQuiz.jsx";
import {MemoryRouter} from "react-router-dom";
import {userEvent} from "@testing-library/user-event/dist/cjs/setup/index.js";
import api from "../../services/api.js";
import {InvalidQuizTestFactory, ValidQuizTestFactory} from "../../../tests/helpers/QuizTestFactory.js";

const validQuiz = ValidQuizTestFactory;
const invalidQuiz = InvalidQuizTestFactory;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('CreateQuiz', () => {

    beforeEach(() =>
        render(
            <MemoryRouter>
                <CreateQuiz/>
            </MemoryRouter>
        )
    );

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render Create Quiz Heading', () => {
        expect(screen.getByRole('heading', {name: /create new quiz/i})).toBeVisible();
    });

    it('should render the heading, text field to input a quiz title, text box to paste the content of your quiz, and the save quiz button', () => {
        expect(screen.getByRole('textbox', {name: /quiz title/i})).toBeVisible();
        expect(screen.getByPlaceholderText(/e\.g\., demo quiz 1/i)).toBeVisible();

        expect(screen.getByRole('textbox', {name: /paste quiz text/i})).toBeVisible();
        expect(screen.getByPlaceholderText(/what is the capital of france/i)).toBeVisible();
        expect(screen.getByRole('button', {name: /save quiz/i})).toBeVisible();
    });

    it('should allow the user input information into all field, click submit, and be redirected back to dashboard', async () => {
        const spyApi = vi.spyOn(api, 'post').mockResolvedValue({
            data : { message: "Success"}
        });

        const user = userEvent.setup();
        const quizTitle = screen.getByRole('textbox', {name: (/quiz title/i)});
        const quizPasteText = screen.getByRole('textbox', {name: /paste quiz text/i});
        const quizSubmission = screen.getByRole('button', {name: /save quiz/i});

        await user.type(quizTitle, 'Demo Quiz 1');
        await user.type(quizPasteText, validQuiz());


        await user.click(quizSubmission);

        expect(spyApi).toHaveBeenCalledTimes(1);
        expect(spyApi).toHaveBeenCalledWith(
            '/api/quizzes',
            expect.objectContaining({
                title: 'Demo Quiz 1',
                questions: expect.any(Array)
            })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should display error message for improperly formatted quiz question(s) and prevent submission if quiz is missing a correct answer', async () => {
        const spyApi = vi.spyOn(api, 'post').mockResolvedValue({
            data : { message: "Success"}
        });

        const user = userEvent.setup();
        const quizTitle = screen.getByRole('textbox', {name: (/quiz title/i)});
        const quizPasteText = screen.getByRole('textbox', {name: /paste quiz text/i});
        const quizSubmission = screen.getByRole('button', {name: /save quiz/i});

        await user.type(quizTitle, 'Demo Quiz 1');
        await user.type(quizPasteText, invalidQuiz());
        await user.click(quizSubmission);

        expect(spyApi).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText(/parsing errors found:/i)).toBeVisible();

    });

});
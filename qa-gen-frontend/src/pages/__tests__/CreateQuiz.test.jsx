import {render, screen} from "@testing-library/react";
import CreateQuiz from "../CreateQuiz.jsx";
import {MemoryRouter} from "react-router-dom";
import {container} from "jsdom/lib/generated/css-property-descriptors.js";

describe('CreateQuiz', () => {

    beforeEach(() =>
        render(
            <MemoryRouter>
                <CreateQuiz/>
            </MemoryRouter>
        )
    );

    it('should render Create Quiz Heading', () => {
        expect(screen.getByRole('heading', {name: /create new quiz/i})).toBeVisible();
    });

    it('should render the heading and text field to input a quiz title', () => {
        expect(screen.getByText(/quiz title/i)).toBeVisible();
        expect(screen.getByPlaceholderText(/e\.g\., demo quiz 1/i)).toBeVisible();
        expect(screen.getByPlaceholderText(/1\. what is the capital of france/i)).toBeVisible();
    });

    it('should display Save Quiz button', () => {
        expect(screen.getByRole('button', {name: /save quiz/i})).toBeVisible();
    });
});
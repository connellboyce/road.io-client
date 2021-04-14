import {render, screen} from '@testing-library/react';
import App from './App';

//Basic tests for main page
test('Globe and text present', () => {
    render(<App/>);
    const titleElement = screen.getByText(/Anxiety-free/i);
    expect(titleElement).toBeInTheDocument();

    const animationElement = screen.getByAltText(/logo/i)
    expect(animationElement).toBeInTheDocument();
});

test('Renders get started button', () => {
    render(<App/>);
    const linkElement = screen.getByText(/Get started/i);
    expect(linkElement).toBeInTheDocument();
});

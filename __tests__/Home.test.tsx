import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home", () => {
  it("renders Hello World text", () => {
    render(<Home />);
    const text = screen.getByText("Hello World");
    expect(text).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer component", () => {
  it("renders footer text", () => {
    render(<Footer />);
    const footerText = screen.getByText(/© 2025.*DocuManage.*rights reserved/i);
    expect(footerText).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Footer />);
    const privacyLink = screen.getByText(/privacy/i);
    const termsLink = screen.getByText(/terms/i);

    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import Header from "./Header";

describe("Header component", () => {
  it("renders the logo", () => {
    render(<Header />);
    const logo = screen.getByText(/DocuManage/i); 
    expect(logo).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    const featuresLink = screen.getByText(/features/i);
    const pricingLink = screen.getByText(/pricing/i);
    const contactLink = screen.getByText(/contact/i);

    expect(featuresLink).toBeInTheDocument();
    expect(pricingLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });
});

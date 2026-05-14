import { Button as EmailButton } from "@react-email/components";
import * as React from "react";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
};

export function Button({ href, children }: ButtonProps) {
  return (
    <EmailButton href={href} style={button}>
      {children}
    </EmailButton>
  );
}

const button = {
  backgroundColor: "#111111",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "400",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 16px",
};

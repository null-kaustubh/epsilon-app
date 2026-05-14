import { Section, Text } from "@react-email/components";

import { Button } from "../components/Button";
import { Layout } from "../components/Layout";

type ResetPasswordEmailProps = {
  resetUrl: string;
  username?: string;
};

export default function ResetPasswordEmail({
  resetUrl,
  username,
}: ResetPasswordEmailProps) {
  return (
    <Layout preview="Reset your Epsilon password">
      <Text style={heading}>{username ? `Hi ${username}!` : "epsilon"}</Text>

      <Text style={paragraph}>
        Someone has requested a link to change your password.
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Text style={paragraph}>
        If you didn't request this, you can safely ignore this email and your
        password will not be changed.
      </Text>

      <Text style={smallText}>
        If the button above does not work, copy and paste this URL into your
        browser:
      </Text>

      <Text style={linkText}>{resetUrl}</Text>
    </Layout>
  );
}

const heading = {
  fontSize: "28px",
  lineHeight: "36px",
  color: "#111111",
  margin: "0 0 10px",
  fontWeight: "600",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#444444",
  margin: "0 0 6px",
};

const buttonContainer = {
  margin: "20px 0",
};

const smallText = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#666666",
  margin: "0 0 14px",
};

const linkText = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#111111",
  wordBreak: "break-all" as const,
  margin: "0 0 24px",
};

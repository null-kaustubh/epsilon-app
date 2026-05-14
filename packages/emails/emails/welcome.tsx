import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { Button } from "../components/Button";
import { Layout } from "../components/Layout";

type WelcomeEmailProps = {
  username: string;
  appUrl: string;
};

export default function WelcomeEmail({ username, appUrl }: WelcomeEmailProps) {
  return (
    <Layout preview="Welcome to Epsilon">
      <Heading style={heading}>Welcome to Epsilon, {username}</Heading>

      <Text style={paragraph}>
        Your workspace is ready. Start building notes, canvases, and ideas in
        one place.
      </Text>

      <Section style={buttonContainer}>
        <Button href={appUrl}>Open Epsilon</Button>
      </Section>

      <Text style={paragraph}>We’re excited to have you here.</Text>
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

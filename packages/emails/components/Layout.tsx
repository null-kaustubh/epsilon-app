import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type LayoutProps = {
  preview: string;
  children: React.ReactNode;
  username?: string;
};

export function Layout({ preview, children, username }: LayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>{preview}</Preview>

      <Body style={body}>
        <Container style={container}>
          <Section style={card}>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f5f5f5",
  fontFamily: '"Inter", Helvetica, sans-serif',
  margin: 0,
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  padding: "0 16px",
  maxWidth: "560px",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "35px 40px",
  border: "1px solid #e5e5e5",
};

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { ContactFormValues } from "../lib/validations/contact";

interface ContactNotificationEmailProps {
  data: ContactFormValues;
}

export default function ContactNotificationEmail({
  data,
}: ContactNotificationEmailProps) {
  const { name, email, subject, message } = data;

  return (
    <Html>
      <Head />
      <Preview>New Contact Message: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Message</Heading>
          <Text style={text}>
            You have received a new message from the contact form.
          </Text>
          
          <Section style={section}>
            <Text style={label}>Subject:</Text>
            <Text style={value}>{subject.toUpperCase()}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>From:</Text>
            <Text style={value}>{name} ({email})</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={paragraph}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  padding: "0 40px",
};

const section = {
  padding: "0 40px",
  marginBottom: "10px",
};

const label = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const value = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "500",
  marginTop: "4px",
};

const paragraph = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

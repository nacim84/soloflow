import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  url: string;
}

export function VerificationEmail({ url }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ margin: '40px auto', padding: '20px' }}>
          <Section
            style={{
              backgroundColor: '#fff',
              padding: '40px',
              borderRadius: '8px',
            }}
          >
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              Verify your email address
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}
            >
              Click the button below to verify your email address and activate
              your account.
            </Text>
            <Button
              href={url}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Verify Email
            </Button>
            <Text
              style={{ fontSize: '14px', color: '#999', marginTop: '24px' }}
            >
              This link expires in 24 hours. If you didn&apos;t request this,
              you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

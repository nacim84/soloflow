import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  url: string;
}

export function ResetPasswordEmail({ url }: ResetPasswordEmailProps) {
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
              Reset your password
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}
            >
              Click the button below to reset your password. If you
              didn&apos;t request this, you can safely ignore this email.
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
              Reset Password
            </Button>
            <Text
              style={{ fontSize: '14px', color: '#999', marginTop: '24px' }}
            >
              This link expires in 1 hour.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

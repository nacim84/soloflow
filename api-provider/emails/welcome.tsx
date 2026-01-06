import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
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
                color: '#111',
              }}
            >
              Welcome to SoloFlow! 🎉
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}
            >
              Hi {name},
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}
            >
              Thank you for joining SoloFlow! We&apos;re excited to have you on
              board. Your account has been successfully created and you&apos;re
              ready to start building with our powerful API services.
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}
            >
              Here&apos;s what you can do next:
            </Text>
            <ul
              style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '24px',
                paddingLeft: '20px',
              }}
            >
              <li style={{ marginBottom: '8px' }}>
                Create your first API key
              </li>
              <li style={{ marginBottom: '8px' }}>
                Explore our services (PDF processing, AI, and more)
              </li>
              <li style={{ marginBottom: '8px' }}>
                Purchase credits to get started
              </li>
              <li style={{ marginBottom: '8px' }}>
                Check out the documentation
              </li>
            </ul>
            <Button
              href={dashboardUrl}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go to Dashboard
            </Button>
            <Text
              style={{
                fontSize: '14px',
                color: '#999',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #eee',
              }}
            >
              Need help? Contact us at support@soloflow.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

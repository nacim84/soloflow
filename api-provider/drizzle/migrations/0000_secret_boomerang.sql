CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"event" text NOT NULL,
	"provider" text,
	"ipAddress" text,
	"userAgent" text,
	"success" boolean NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "premium_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"stripePaymentId" text NOT NULL,
	"upgradedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "premium_users_userId_unique" UNIQUE("userId"),
	CONSTRAINT "premium_users_stripePaymentId_unique" UNIQUE("stripePaymentId")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "stripe_events_event_id_unique" UNIQUE("event_id")
);

CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_log" ADD CONSTRAINT "auth_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "idx_account_userId" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_account_provider" ON "account" USING btree ("providerId","accountId");--> statement-breakpoint
CREATE INDEX "idx_session_token" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_session_userId" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_session_expiresAt" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "idx_verification_identifier" ON "verification" USING btree ("identifier");

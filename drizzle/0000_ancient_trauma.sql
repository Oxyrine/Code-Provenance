CREATE TABLE "activity_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"detail" text NOT NULL,
	"timestamp" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"author_role" varchar(100) NOT NULL,
	"date" varchar(50) NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"date" varchar(50) NOT NULL,
	"time" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"is_virtual" boolean NOT NULL,
	"virtual_link" varchar(255),
	"speaker" varchar(255),
	"speaker_role" varchar(255),
	"organizer" varchar(255) NOT NULL,
	"banner_url" text NOT NULL,
	"max_capacity" integer NOT NULL,
	"registered_user_ids" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"status" varchar(50) NOT NULL,
	"timeline" varchar(50),
	"recording_url" varchar(255),
	"gallery_urls" text[],
	"created_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"company_or_org" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"location" varchar(255) NOT NULL,
	"stipend_or_salary" varchar(100),
	"deadline" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"apply_url" varchar(255) NOT NULL,
	"requirements" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"posted_date" varchar(50) NOT NULL,
	"logo_url" text,
	"banner_url" text,
	"status" varchar(50) NOT NULL,
	"timeline" varchar(50),
	"created_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"tagline" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"domain" varchar(100) NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"author_institution" varchar(255) NOT NULL,
	"team_members" text[] NOT NULL,
	"github_url" varchar(255) NOT NULL,
	"demo_url" varchar(255),
	"likes" integer DEFAULT 0 NOT NULL,
	"liked_by_user_ids" text[] NOT NULL,
	"tags" text[] NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"image_url" text,
	"status" varchar(50),
	"timeline" varchar(50),
	"achievements" text
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"type" varchar(100) NOT NULL,
	"author_or_provider" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"tags" text[] NOT NULL,
	"level" varchar(50) NOT NULL,
	"featured" boolean,
	"timeline" varchar(50),
	"published_year" varchar(20),
	"created_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(50) NOT NULL,
	"gender" varchar(50) NOT NULL,
	"dob" varchar(50) NOT NULL,
	"city" varchar(100) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"bio" text,
	"skills" text[],
	"interests" text[],
	"github_url" varchar(255),
	"linkedin_url" varchar(255),
	"avatar_url" text,
	"points" integer DEFAULT 0,
	"joined_at" varchar(100) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

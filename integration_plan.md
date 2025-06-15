# Integration Plan

## 1. Information Gathering

*   Read the contents of the existing portal page (`src/pages/PortalPage.tsx`) to understand its current structure and functionality.
*   Inspect the `package.json` file to identify existing dependencies and potential conflicts.
*   Examine the `supabase/functions/submit-lead/index.ts` file to understand the current lead submission process.

## 2. Feature Breakdown and Implementation Plan

*   **Social Accounts & API Connections Tab:**
    *   Create a new "Social Accounts & API Connections" tab in the main portal.
    *   Within this tab:
        *   Display a list of the user's connected social media accounts (Facebook, Instagram, Twitter, LinkedIn).
        *   Allow users to connect and disconnect their social media accounts.
        *   Implement authentication and authorization for each social media platform.
        *   Provide options to connect to other APIs like Twilio.

*   **Social Sharing Integration:**
    *   Integrate social sharing functionality into the quiz display page.
    *   Allow users to share the quiz link directly to their connected social media accounts.
    *   Pre-populate the share message with a relevant description of the quiz.
    *   Potentially allow users to customize the share message.

*   **Lead Generation:**
    *   Implement both simple contact forms and interactive quizzes.
    *   Connect lead capture mechanisms to the existing lead submission process (`supabase/functions/submit-lead/index.ts`).
    *   Store lead data in the Supabase database.

*   **Canva API Integration:**
    *   Explore the Canva API documentation to understand its capabilities.
    *   Identify use cases for Canva integration (e.g., creating social media graphics for sharing quizzes).
    *   Implement Canva API calls to perform the desired actions if feasible.
    *   You have a Canva account but need to create an API key.

*   **Twilio Integration:**
    *   Integrate Twilio API for sending SMS notifications and enabling calling features.
    *   Implement SMS notifications for new leads or other relevant events.
    *   Potentially add calling functionality to connect with leads directly.
    *   You have a Twilio account but need to create an API key.
    *   Client needs Twilio integration in the platform so they can set up for SMS and emails.

## 3. Technical Design

*   **Frontend (React/TypeScript):**
    *   Create reusable components for social account management, API connection management, social sharing, lead capture forms, and other UI elements.
    *   Use appropriate UI libraries (e.g., Material UI, Chakra UI) for styling and layout.
    *   Implement API calls to fetch data from social media platforms, Canva, Twilio, and other services.
    *   Manage state using React Context or a similar state management solution.

*   **Backend (Supabase Functions):**
    *   Create Supabase functions to handle API requests from the frontend.
    *   Implement logic for interacting with the Canva API, Twilio API, and other services.
    *   Securely store API keys and credentials.
    *   Update the `submit-lead` function to handle new lead data.
    *   Implement logic for managing social account connections and API connections.

*   **Database (Supabase):**
    *   Define database schema for storing lead data, social media content, and other relevant information.
    *   Implement database queries to retrieve and update data.
    *   Set up appropriate security policies to protect data.
    *   Store social account connection details and API connection details securely.

## 4. Testing

*   Write unit tests for individual components and functions.
*   Implement integration tests to verify the interaction between different parts of the system.
*   Perform end-to-end tests to ensure the entire workflow is working correctly.

## 5. Deployment

*   Deploy the updated frontend to Vercel.
*   Deploy the updated Supabase functions to Supabase.
*   Configure API keys and environment variables.

## 6. Mermaid Diagram

```mermaid
graph LR
    A[Portal Page] --> B("Social Accounts & API Connections" Tab);
    B --> C{Social Accounts};
    C --> D[Social Media APIs];
    B --> E{API Connections};
    E --> F[Twilio API etc.];
    A --> G(Quiz Display Page);
    G --> H(Social Sharing Component);
    H --> D;
    A --> I(Lead Generation Component);
    I --> J{Lead Data};
    J --> K[Supabase Database];
    A --> L(Canva API);
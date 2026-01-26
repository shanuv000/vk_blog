# urTechy Blogs

> A modern, feature-rich blog application built with Next.js, GraphQL, and Tailwind CSS.
>
> 🚀 **Live Demo:** [https://blog.urtechy.com/](https://blog.urtechy.com/)

urTechy Blogs is a fully responsive, high-performance blogging platform designed to deliver content across technology, entertainment, sports, and more. It leverages the power of Next.js for server-side rendering and static generation, Hygraph (GraphCMS) for flexible content management, and specialized integrations for live cricket scores and social media sharing.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (React)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & SASS
-   **CMS:** [Hygraph (GraphCMS)](https://hygraph.com/)
-   **Data Fetching:** GraphQL (`graphql-request`, `@apollo/client`)
-   **State Management:** React Context API
-   **Animation:** [Framer Motion](https://www.framer.com/motion/)
-   **Error Tracking:** [Sentry](https://sentry.io/)
-   **Deployment:** [Vercel](https://vercel.com/)
-   **Analytics:** Google Analytics & Microsoft Clarity

## ✨ Key Features

-   **Dynamic Content:** Full markdown support for rich articles with syntax highlighting and embeds.
-   **High Performance:** Optimized with SSG/ISR (Incremental Static Regeneration), image optimization, and code splitting.
-   **Live Cricket Scores:** Real-time integration with cricket data APIs.
-   **Smart Categorization:** Organized content architecture with category-specific pages.
-   **Interactive Elements:** Comments, social sharing, and responsive carousels.
-   **SEO Optimized:** Built-in SEO best practices including dynamic meta tags, Open Graph support, and sitemaps.
-   **PWA Ready:** Designed for a native-app-like experience on mobile devices.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/urtechy-blog.git
    cd urtechy-blog
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**

    Copy the `.env.example` file to `.env.local` and fill in your API keys:

    ```bash
    cp .env.example .env.local
    ```

    You will need keys for:
    -   `NEXT_PUBLIC_GRAPHCMS_ENDPOINT` (Hygraph API)
    -   `GRAPHCMS_TOKEN` (Hygraph Auth Token)
    -   `SENTRY_AUTH_TOKEN` (if using Sentry)
    -   Other service specific keys (Firebase, RapidAPI, etc.)

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
.
├── components/         # Reusable UI components (Layout, Cards, Header, etc.)
├── pages/              # Next.js pages and API routes
│   ├── api/            # Server-side API endpoints
│   ├── post/[slug].js  # Dynamic blog post pages
│   └── category/       # Category archive pages
├── public/             # Static assets (images, icons)
├── services/           # GraphQL queries and API utilities
├── store/              # Global state management context
├── styles/             # Global CSS and SCSS files
└── utils/              # Helper functions and constants
```

## 📜 Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint checks.
-   `npm run analyze`: Builds the app and launches the bundle analyzer.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Vaibhav**

-   LinkedIn: [Vaibhav on LinkedIn](https://www.linkedin.com/in/shanuv000/)
-   Website: [urTechy](https://urtechy.com/)

# Scaffold Next.js (without Tailwind)
npx --yes create-next-app@latest frontend --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm --no-tailwind

# Go into frontend dir
cd frontend

# Install other dependencies (No shadcn/ui)
npm install axios @tanstack/react-query react-hook-form @hookform/resolvers zod lucide-react

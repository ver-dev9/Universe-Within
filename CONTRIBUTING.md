# Contributing to UNIVERSE WITHIN

Thank you for your interest in contributing to **UNIVERSE WITHIN — A Journey Beyond the Visible**!

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in all discussions and pull requests.

## How to Contribute
1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/universe-within-3d.git
   cd universe-within-3d
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Develop and Test:**
   - Run the development server with `npm run dev`.
   - Verify TypeScript compilation and production build with `npm run build`.
   - Ensure all astronomical values are verifiable against NASA/ESA publications.
6. **Commit your changes:**
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push to GitHub & Open a Pull Request.**

## Coding Standards
- Use TypeScript strict mode with explicit typing.
- Maintain decoupled architectures between 3D scenes (`src/scenes/`), components (`src/components/`), and datasets (`src/data/`).
- Do not add uncompressed external media assets without prior discussion.

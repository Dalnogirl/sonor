export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎵 Sonor - Music School Management</h1>
      <p>Welcome to your music school management application!</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Architecture Overview</h2>
        <ul>
          <li><strong>Framework:</strong> Next.js 15 (App Router) + tRPC v11</li>
          <li><strong>Architecture:</strong> Hexagonal (Ports & Adapters)</li>
          <li><strong>Principles:</strong> SOLID, GRASP, Domain-Driven Design</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Start</h2>
        <p>The project structure follows hexagonal architecture:</p>
        <ul>
          <li><code>domain/</code> - Pure business logic (entities, ports)</li>
          <li><code>application/</code> - Use cases and DTOs</li>
          <li><code>infrastructure/</code> - Database, external services</li>
          <li><code>adapters/</code> - tRPC routers, UI components</li>
        </ul>
      </div>
    </main>
  );
}

---
layout: page
title: "Astra"
subtitle: "A modern, enterprise-grade programming language"
permalink: /projects/astra/
full-width: false
---

<div class="project-page" data-project-theme="astra">

<header class="project-hero reveal reveal-up">
  <div class="project-hero-label">
    <span class="kicker" style="color: var(--accent-color);">Systems Language</span>
    <span class="project-status-badge project-status-badge--blue">In Development</span>
  </div>
  <h1 class="project-display-title astra-title">Astra</h1>
  <p class="project-manifesto">
    Native performance. Modern ergonomics. Enterprise-grade reliability.
  </p>
</header>

<div class="project-vision reveal reveal-up">
  <p class="project-vision-text">
    Astra is a modern systems programming language built on an <strong>LLVM backend</strong> for native performance,
    combining the safety and expressiveness that enterprise software demands with the ergonomics developers expect.
  </p>
  <p>
    It is a language designed not for academic experiments but for the real constraints of production systems:
    predictable performance, deep type safety, and the compositional features that make large codebases maintainable.
  </p>
</div>

<section class="project-features reveal-stagger">
  <h2 class="section-heading">Language Features</h2>
  <div class="feature-grid">

    <div class="feature-card card-lift">
      <span class="feature-icon">⬡</span>
      <h3>Generics</h3>
      <p>First-class generic types with constraint-based bounds. Write once, use across the full type space — without runtime overhead.</p>
    </div>

    <div class="feature-card card-lift">
      <span class="feature-icon">⟳</span>
      <h3>Async / Await</h3>
      <p>Structured concurrency built into the language, not bolted on. Async functions compose naturally with synchronous code.</p>
    </div>

    <div class="feature-card card-lift">
      <span class="feature-icon">◈</span>
      <h3>Advanced Type System</h3>
      <p>Algebraic data types, pattern matching, dependent types for invariant encoding. If it compiles, it is correct by construction.</p>
    </div>

    <div class="feature-card card-lift">
      <span class="feature-icon">◎</span>
      <h3>LLVM Backend</h3>
      <p>Native code generation through LLVM — the same infrastructure behind Clang and Rust. Performance comparable to C, ergonomics far beyond it.</p>
    </div>

    <div class="feature-card card-lift">
      <span class="feature-icon">⟁</span>
      <h3>Memory Safety</h3>
      <p>Ownership model and borrow-checked references without a garbage collector. Deterministic resource management with zero-cost abstractions.</p>
    </div>

    <div class="feature-card card-lift">
      <span class="feature-icon">◧</span>
      <h3>Enterprise Ready</h3>
      <p>Module system designed for large codebases. Explicit interfaces. Versioned packages. Built for teams, not just individuals.</p>
    </div>

  </div>
</section>

<section class="astra-code-sample reveal reveal-up">
  <h2 class="section-heading">A Taste of Astra</h2>
  <pre class="astra-code"><code>// Generic Result type with pattern matching
type Result&lt;T, E&gt; =
  | Ok(value: T)
  | Err(error: E)

// Async function with structured error handling
async fn fetch_user(id: UserId) -&gt; Result&lt;User, ApiError&gt; {
  let response = await http.get("/users/\(id)")
  match response.status {
    200 =&gt; Ok(User.decode(response.body))
    404 =&gt; Err(ApiError.NotFound(id))
    _   =&gt; Err(ApiError.Unexpected(response.status))
  }
}

// Generic constraint syntax
fn max&lt;T: Comparable&gt;(a: T, b: T) -&gt; T {
  if a &gt; b { a } else { b }
}</code></pre>
</section>

<section class="project-targets reveal reveal-up">
  <h2 class="section-heading">Compilation Targets</h2>
  <div class="target-chips reveal-stagger">
    <span class="target-chip target-chip--blue">x86-64 Linux</span>
    <span class="target-chip target-chip--blue">x86-64 macOS</span>
    <span class="target-chip target-chip--blue">ARM64 / Apple Silicon</span>
    <span class="target-chip target-chip--blue">WebAssembly</span>
    <span class="target-chip target-chip--blue">Windows</span>
  </div>
</section>

<div class="project-footer reveal reveal-up">
  <a href="/projects/" class="poetry-back">← All projects</a>
</div>

</div>

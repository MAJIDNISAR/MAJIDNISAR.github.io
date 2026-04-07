/**
 * UI/UX Enhancements - Advanced Interactive Features
 * Extends modern-features.js with next-level interactions
 */

(function() {
  'use strict';

  // ========================================
  // CUSTOM CURSOR
  // ========================================
  
  const CustomCursor = {
    init() {
      // Only enable on desktop and if user doesn't prefer reduced motion
      if (window.innerWidth < 768) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      this.cursor = document.createElement('div');
      this.cursor.className = 'custom-cursor';
      document.body.appendChild(this.cursor);
      
      this.dot = document.createElement('div');
      this.dot.className = 'cursor-dot';
      document.body.appendChild(this.dot);
      
      document.body.classList.add('has-custom-cursor');
      
      this.cursorX = 0;
      this.cursorY = 0;
      this.dotX = 0;
      this.dotY = 0;
      
      this.setupEventListeners();
      this.animate();
    },
    
    setupEventListeners() {
      document.addEventListener('mousemove', (e) => {
        this.cursorX = e.clientX;
        this.cursorY = e.clientY;
        this.dotX = e.clientX;
        this.dotY = e.clientY;
      });
      
      // Hover effects on interactive elements
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => this.cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor-hover'));
      });
      
      // Click effect
      document.addEventListener('mousedown', () => this.cursor.classList.add('cursor-click'));
      document.addEventListener('mouseup', () => this.cursor.classList.remove('cursor-click'));
    },
    
    animate() {
      // Smooth cursor movement with lag
      this.cursor.style.left = this.cursorX + 'px';
      this.cursor.style.top = this.cursorY + 'px';
      
      // Dot follows with slight delay (smooth interpolation)
      this.dotX += (this.cursorX - this.dotX) * 0.5;
      this.dotY += (this.cursorY - this.dotY) * 0.5;
      
      this.dot.style.left = this.dotX + 'px';
      this.dot.style.top = this.dotY + 'px';
      
      requestAnimationFrame(() => this.animate());
    }
  };

  // ========================================
  // MAGNETIC BUTTONS
  // ========================================
  
  const MagneticButtons = {
    init() {
      this.buttons = document.querySelectorAll('.magnetic-btn');
      this.buttons.forEach(btn => this.setupButton(btn));
    },
    
    setupButton(btn) {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const strength = 0.3; // Magnetic strength
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    }
  };

  // ========================================
  // PARALLAX EFFECTS
  // ========================================
  
  const ParallaxEffects = {
    init() {
      this.elements = document.querySelectorAll('.parallax-element, .parallax-bg');
      if (this.elements.length === 0) return;
      
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      this.setupParallax();
    },
    
    setupParallax() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            
            this.elements.forEach(el => {
              const speed = parseFloat(el.dataset.speed) || 0.5;
              const offset = el.dataset.offset || 0;
              const yPos = (scrollY * speed) + offset;
              el.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // ========================================
  // GRAIN TEXTURE OVERLAY
  // ========================================
  
  const GrainTexture = {
    init() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'grain-overlay';
      document.body.appendChild(this.overlay);
    }
  };

  // ========================================
  // 3D CARD TRANSFORMS
  // ========================================
  
  const Card3DEffects = {
    init() {
      this.cards = document.querySelectorAll('.card-3d');
      this.cards.forEach(card => this.setupCard(card));
    },
    
    setupCard(card) {
      const inner = card.querySelector('.card-3d-inner') || card;
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    }
  };

  // ========================================
  // SKELETON LOADING STATES
  // ========================================
  
  const SkeletonLoading = {
    init() {
      this.setupSkeletons();
    },
    
    setupSkeletons() {
      // Add skeleton class to loading elements
      document.querySelectorAll('[data-loading="true"]').forEach(el => {
        el.classList.add('skeleton');
      });
    },
    
    showSkeleton(container) {
      container.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton skeleton-text';
        skeleton.style.width = (100 - i * 15) + '%';
        container.appendChild(skeleton);
      }
    },
    
    hideSkeleton(container, content) {
      container.innerHTML = content;
    }
  };

  // ========================================
  // ENHANCED SCROLL PROGRESS
  // ========================================
  
  const EnhancedScrollProgress = {
    init() {
      this.container = document.createElement('div');
      this.container.className = 'scroll-progress-container';
      this.bar = document.createElement('div');
      this.bar.className = 'scroll-progress-bar';
      this.container.appendChild(this.bar);
      document.body.appendChild(this.container);
      
      this.updateProgress();
      window.addEventListener('scroll', () => this.updateProgress());
    },
    
    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      this.bar.style.width = Math.min(progress, 100) + '%';
    }
  };

  // ========================================
  // KEYBOARD SHORTCUTS
  // ========================================
  
  const KeyboardShortcuts = {
    shortcuts: [
      { key: 'k', ctrl: true, action: 'Toggle search', icon: '⌘K' },
      { key: 't', ctrl: true, action: 'Toggle theme', icon: '⌘T' },
      { key: '?', ctrl: false, action: 'Show shortcuts', icon: '?' },
      { key: 'Escape', ctrl: false, action: 'Close modals', icon: 'Esc' }
    ],
    
    init() {
      this.setupModal();
      this.setupListeners();
    },
    
    setupModal() {
      this.modal = document.createElement('div');
      this.modal.className = 'keyboard-shortcuts';
      this.modal.innerHTML = `
        <div class="shortcuts-list">
          ${this.shortcuts.map(s => `
            <div class="shortcut-item">
              <kbd>${s.icon}</kbd>
              <span>${s.action}</span>
            </div>
          `).join('')}
        </div>
      `;
      document.body.appendChild(this.modal);
    },
    
    setupListeners() {
      document.addEventListener('keydown', (e) => {
        // Show shortcuts with ?
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
          this.modal.classList.toggle('visible');
          setTimeout(() => this.modal.classList.remove('visible'), 3000);
        }
        
        // Toggle search with Cmd/Ctrl + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('nav-search-link')?.click();
        }
        
        // Toggle theme with Cmd/Ctrl + T
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
          e.preventDefault();
          document.getElementById('theme-toggle')?.click();
        }
        
        // Close with Escape
        if (e.key === 'Escape') {
          this.modal.classList.remove('visible');
        }
      });
    }
  };

  // ========================================
  // READING TIME ESTIMATOR
  // ========================================
  // Only shows reading time on navigable content (blog posts, articles, writing entries)
  // that have a link to read the full content. Not shown on cards, previews without links,
  // or non-navigable article elements.
  
  const ReadingTimeEstimator = {
    init() {
      this.calculateReadingTime();
    },
    
    calculateReadingTime() {
      // Only target specific content types that are navigable
      // Exclude cards, previews, and non-content articles
      const selectors = [
        '.blog-post',
        '.post-content',
        '.writing-item',
        '.post-preview a[href]'
      ];
      
      // Find articles that have a navigable link (indicating they can be read)
      const articles = document.querySelectorAll(selectors.join(', '));
      
      articles.forEach(article => {
        // Skip if this is a post-preview - find the parent article instead
        if (article.classList.contains('post-preview')) {
          const parentArticle = article.closest('article');
          if (parentArticle && !parentArticle.querySelector('.reading-time')) {
            this.addReadingTimeBadge(parentArticle);
          }
          return;
        }
        
        // Skip if already has reading time or is not an article element
        if (article.querySelector('.reading-time')) return;
        if (!article.tagName || article.tagName.toLowerCase() !== 'article') return;
        
        // Check if this article has a navigable link to full content
        const hasNavigableLink = article.querySelector('a[href]');
        if (!hasNavigableLink) return;
        
        this.addReadingTimeBadge(article);
      });
    },
    
    addReadingTimeBadge(article) {
      // Don't add to cards that are not content articles
      // These are UI components, informational cards, or non-navigable elements
      const excludedClasses = [
        // Index page cards
        'monetization-card',
        'signature-card', 
        'outcome-card',
        'case-study-card',
        'cross-card',
        // Executive pages cards (case-studies, leadership, work-with-me, speaking)
        'exec-card',
        'exec-proof-card',
        // About page cards
        'about-card',
        'about-panel',
        // CV/Resume cards
        'cv-entry-card',
        'cv-edu-card',
        'cv-skill-item',
        'cv-stack-item',
        'cv-cert-item',
        // Writing page cards
        'writing-topic-card',
        // Poetry cards (poetry is typically short, reading time not meaningful)
        'poem-card',
        // Related content and testimonials (generated by JS)
        'related-card',
        'testimonial-card'
      ];
      
      for (const excludedClass of excludedClasses) {
        if (article.classList.contains(excludedClass)) return;
      }
      
      const text = article.textContent;
      const words = text.split(/\s+/).length;
      const minutes = Math.ceil(words / 200); // Average reading speed
      
      // Don't show reading time for very short content (< 50 words)
      if (words < 50) return;
      
      // Add reading time badge if not present
      if (!article.querySelector('.reading-time')) {
        const badge = document.createElement('span');
        badge.className = 'reading-time';
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          ${minutes} min read
        `;
        
        // Insert after title or at the beginning
        const title = article.querySelector('h1, h2');
        if (title) {
          title.after(badge);
        } else {
          article.prepend(badge);
        }
      }
    }
  };

  // ========================================
  // BREADCRUMB NAVIGATION
  // ========================================
  
  const BreadcrumbNavigation = {
    init() {
      this.createBreadcrumb();
    },
    
    createBreadcrumb() {
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      
      if (segments.length <= 1) return; // Only show if more than one level
      
      const breadcrumb = document.createElement('nav');
      breadcrumb.className = 'breadcrumb';
      breadcrumb.setAttribute('aria-label', 'Breadcrumb');
      
      // Home link
      breadcrumb.innerHTML = `<a href="/">Home</a><span class="breadcrumb-separator">/</span>`;
      
      // Build breadcrumb trail
      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += '/' + segment;
        const isLast = index === segments.length - 1;
        
        const link = document.createElement('a');
        link.href = currentPath;
        link.textContent = this.formatSegment(segment);
        
        if (isLast) {
          link.setAttribute('aria-current', 'page');
          link.style.color = 'var(--text-color)';
          link.style.textDecoration = 'none';
        }
        
        breadcrumb.appendChild(link);
        
        if (!isLast) {
          breadcrumb.innerHTML += `<span class="breadcrumb-separator">/</span>`;
        }
      });
      
      // Insert at the top of main content
      const main = document.querySelector('main, [role="main"]');
      if (main) {
        const header = main.querySelector('header, .intro-header');
        if (header) {
          header.after(breadcrumb);
        } else {
          main.prepend(breadcrumb);
        }
      }
    },
    
    formatSegment(segment) {
      return segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // ========================================
  // RELATED CONTENT - Enhanced with tag/category matching
  // ========================================
  
  const RelatedContent = {
    init() {
      this.showRelatedContent();
    },
    
    showRelatedContent() {
      // Only on blog posts
      const mainContent = document.querySelector('.blog-post, .post-content');
      if (!mainContent) return;
      
      // Get current post tags
      const currentTags = this.getCurrentPostTags(mainContent);
      
      // Get all posts
      const allPosts = document.querySelectorAll('.post-preview');
      if (allPosts.length < 2) return;
      
      // Filter out current post and score by relevance
      const currentUrl = window.location.pathname;
      const relatedPosts = Array.from(allPosts)
        .filter(post => {
          const link = post.querySelector('a')?.href || '';
          return !link.includes(currentUrl) && !link.endsWith(currentUrl);
        })
        .map(post => ({
          element: post,
          score: this.calculateRelevance(post, currentTags)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      if (relatedPosts.length === 0) return;
      
      const relatedSection = document.createElement('section');
      relatedSection.className = 'related-content';
      relatedSection.innerHTML = `
        <h3>Related Articles</h3>
        <div class="related-grid" id="related-grid"></div>
      `;
      
      const grid = relatedSection.querySelector('#related-grid');
      
      relatedPosts.forEach(({ element }) => {
        const card = document.createElement('article');
        card.className = 'related-card';
        
        const title = element.querySelector('.post-title')?.textContent || 'Untitled';
        const link = element.querySelector('a')?.href || '#';
        const excerpt = element.querySelector('.post-entry')?.textContent?.substring(0, 100) || '';
        
        card.innerHTML = `
          <a href="${link}">
            <h4>${title}</h4>
            <p class="related-excerpt">${excerpt}...</p>
            <span class="related-meta">Read more →</span>
          </a>
        `;
        
        grid.appendChild(card);
      });
      
      mainContent.after(relatedSection);
    },
    
    getCurrentPostTags(content) {
      const tags = [];
      // Extract from blog-tags
      content.querySelectorAll('.blog-tags a').forEach(tag => {
        tags.push(tag.textContent.toLowerCase().trim());
      });
      // Extract from post content keywords
      const content_text = content.textContent.toLowerCase();
      const keywords = ['javascript', 'python', 'design', 'leadership', 'ai', 'data', 'engineering'];
      keywords.forEach(kw => {
        if (content_text.includes(kw) && !tags.includes(kw)) {
          tags.push(kw);
        }
      });
      return tags;
    },
    
    calculateRelevance(post, currentTags) {
      let score = 0;
      const postTags = [];
      post.querySelectorAll('.blog-tags a').forEach(tag => {
        postTags.push(tag.textContent.toLowerCase().trim());
      });
      
      // Score based on tag overlap
      currentTags.forEach(tag => {
        if (postTags.includes(tag)) score += 2;
      });
      
      // Score based on category match
      const postTitle = (post.querySelector('.post-title')?.textContent || '').toLowerCase();
      currentTags.forEach(tag => {
        if (postTitle.includes(tag)) score += 1;
      });
      
      return score;
    }
  };

  // ========================================
  // SOCIAL PROOF ELEMENTS - Testimonial Carousel
  // ========================================

  const SocialProof = {
    // All testimonials from LinkedIn recommendations
    testimonials: [
      {
        name: "Abid Rashid",
        title: "Co-Founder & CTO, FastBeetle",
        relation: "Managed Majid directly",
        text: "Majid manages teams with clarity and structure, ensuring everyone stays aligned and focused on delivering results. He has a strong ability to break down complex projects into clear, actionable steps. He remains calm under pressure, makes practical decisions, and ensures roadblocks are addressed quickly. His growth from Project Manager to VP of Technology is a reflection of his capability and impact. He's someone you can trust to lead teams, scale systems, and get things done."
      },
      {
        name: "Sanjay Kumar",
        title: "Software Development Manager",
        relation: "Managed Majid directly",
        text: "I had the opportunity to work with Majid during his stint as a Software Developer, and even though the duration was short, he made a strong impression. He demonstrated a wide knowledge across multiple technical areas and showed a great learning curve. His positive attitude and ability to quickly bond with the team made collaboration effortless. Majid would be a valuable addition to any team looking for a quick learner with strong technical curiosity and a great team spirit."
      },
      {
        name: "Qaisar Jamal",
        title: "Strategic L&D Leader",
        relation: "Worked with Majid on different teams",
        text: "What truly stands out about Majid is his ability to take a group of young, inexperienced professionals and transform them into a skilled, confident, and high-performing team. An intellectual with a deep understanding of both technology and people, he combines sharp analytical thinking with strong communication skills. Under his guidance, the development team evolved into one of the most dynamic and dependable units in our organization."
      },
      {
        name: "Sajid Mir",
        title: "Director — Delivery & Execution, iQuasar",
        relation: "Worked with Majid on the same team",
        text: "As Head of Software, Cloud, and AI, Majid built a high-performing team from the ground up and successfully scaled it. He is a true polymath, bringing deep expertise across software development, AI, cloud technologies, project management, cross-functional team leadership, systems thinking, and design thinking. He fosters a culture of collaboration, experimentation, and excellence — inspiring those around him to perform at their best."
      },
      {
        name: "Idrees Hafeez",
        title: "Senior Director, Federal Proposal Management",
        relation: "Worked with Majid on different teams",
        text: "Majid combines strong technical expertise in building custom applications with a strategic mindset and natural leadership. His guidance and team-oriented approach added real value to the project. Anyone would be fortunate to have him on their team or leading a project."
      },
      {
        name: "Basit Manzoor",
        title: "SDE @ iQuasar | MERN Stack Developer",
        relation: "Reported to Majid directly",
        text: "I've worked under Majid Nisar for over 2.5 years, and he is one of the most impactful leaders I've learned from. He built our entire software department from scratch, growing it from a small team to a well-structured, multi-skill function. Majid is a rare kind of manager who stands by his team, pushes you to grow without overburdening you, and leads with both depth of knowledge and empathy. Any organization led by him will not only deliver, it will evolve."
      },
      {
        name: "Iqra Nazir",
        title: "Founder & CEO, Dawat Book",
        relation: "Reported to Majid directly",
        text: "When I began my professional journey, Majid was among the first leaders who truly guided and shaped our direction. His mentorship went beyond tasks and deadlines; he helped us understand what it means to learn and grow with purpose. Majid has an exceptional ability to lead with clarity and empathy. He doesn't just teach; he empowers. I will always be grateful for the sense of confidence and curiosity he instilled in me."
      },
      {
        name: "Shuaib Mir",
        title: "Customer Success & Business Growth @ iQuasar EMEA",
        relation: "Worked with Majid on different teams",
        text: "Working with Majid Nisar has been a genuinely transformative experience. He led critical initiatives across software, cloud, and AI, turning a fragmented function into a cohesive, high-performing tech team. Just as impressive was his focus on people and process — introducing scalable team structures, automation, and a culture of continuous improvement. Calm, visionary, and deeply knowledgeable, Majid is the kind of leader who elevates everyone around him."
      },
      {
        name: "Shahid Baba",
        title: "Remote Workforce Expert",
        relation: "Worked with Majid on different teams",
        text: "Majid is a visionary technology leader who blends deep technical knowledge with strategic insight and a people-first leadership style that truly sets him apart. He leads our software line of business with remarkable clarity and direction, driving product development, AI integration, and technological innovation. His ability to balance technical depth, strategic planning, and stakeholder engagement makes him an invaluable asset."
      },
      {
        name: "Asif Rasool",
        title: "Building Peko | Payments & Expense Platform",
        relation: "Reported to Majid directly",
        text: "Majid stood out as an exceptionally organized, reliable, and results-driven professional. He had a remarkable ability to manage multiple complex projects with calm efficiency — always ensuring deadlines were met and client expectations were exceeded. His strong leadership and communication skills made collaboration seamless across teams, and his attention to detail consistently brought clarity and structure to fast-paced environments."
      },
      {
        name: "Farrukh Shah",
        title: "Head of Cleared Talent Strategy, iQuasar",
        relation: "Worked with Majid on the same team",
        text: "Majid is one of the most exceptional technology leaders I've encountered. As the Head of Software Development, he consistently demonstrated a rare blend of technical brilliance, strategic thinking, and people leadership. Under his guidance, our development team not only delivered complex projects ahead of schedule but also raised the overall bar for code quality, scalability, and innovation. He not only builds great software but also builds great teams."
      },
      {
        name: "Ijtiba Younis",
        title: "CF APMP® · GovCon Strategist, iQuasar",
        relation: "Worked with Majid on different teams",
        text: "It is a rare pleasure to find a professional who combines deep technical expertise with impeccable execution. Majid's command of Cloud and DevOps isn't just theoretical — he breathes technology and has an innate ability to architect elegant solutions for complex problems. Whenever a challenge arises, Majid is the person you turn to. He gets the job done — and does it excellently."
      }
    ],

    init() {
      this.addTestimonialSection();
    },

    addTestimonialSection() {
      // Only on homepage or about page
      if (!document.querySelector('.home-template, .about-template') &&
          window.location.pathname !== '/' &&
          !window.location.pathname.includes('about')) {
        return;
      }

      const main = document.querySelector('main, [role="main"]');
      if (!main) return;

      const section = document.createElement('section');
      this.testimonialSection = section;
      section.className = 'testimonial-section';
      section.innerHTML = `
        <div class="testimonial-container">
          <h3>What colleagues say</h3>
          <div class="testimonial-carousel-wrapper">
            <button class="carousel-btn carousel-prev" aria-label="Previous testimonial">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div class="testimonial-carousel-track">
              <div class="testimonial-carousel" id="testimonial-carousel">
                ${this.testimonials.map((t, i) => `
                  <blockquote class="testimonial-card" data-index="${i}">
                    <div class="testimonial-quote-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                    </div>
                    <p>"${t.text}"</p>
                    <footer>
                      <div class="testimonial-author">
                        <div class="author-avatar"></div>
                        <div class="author-info">
                          <strong>${t.name}</strong>
                          <span>${t.title}</span>
                          <span class="author-relation">${t.relation}</span>
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                `).join('')}
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next testimonial">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          <div class="carousel-dots" id="carousel-dots"></div>
        </div>
      `;

      // Add testimonial styles
      const style = document.createElement('style');
      style.textContent = `
        .testimonial-section {
          padding: 4rem 2rem;
          background: var(--surface-raised);
          border-radius: 24px;
          margin: 3rem 0;
        }
        .testimonial-container h3 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.75rem;
        }
        .testimonial-carousel-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        .testimonial-carousel-track {
          overflow: hidden;
          flex: 1;
          border-radius: 16px;
        }
        .testimonial-carousel {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }
        .testimonial-card {
          min-width: 100%;
          background: var(--surface-card);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: relative;
        }
        .testimonial-quote-icon {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          opacity: 0.15;
          color: var(--accent-color);
        }
        .testimonial-card p {
          font-style: italic;
          margin-bottom: 1.5rem;
          line-height: 1.7;
          font-size: 1.05rem;
          padding-right: 2rem;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-warm));
          flex-shrink: 0;
        }
        .author-info {
          display: flex;
          flex-direction: column;
        }
        .author-info strong {
          font-size: 0.95rem;
        }
        .author-info span {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .author-relation {
          font-size: 0.75rem !important;
          font-style: italic;
          opacity: 0.8;
        }
        .carousel-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--surface-card);
          border: 1px solid var(--border-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          color: var(--text-color);
        }
        .carousel-btn:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: scale(1.05);
        }
        .carousel-btn svg {
          width: 24px;
          height: 24px;
        }
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--border-color);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .carousel-dot.active {
          background: var(--accent-color);
          transform: scale(1.2);
        }
        .carousel-dot:hover {
          background: var(--accent-color);
          opacity: 0.7;
        }
        @media (max-width: 768px) {
          .testimonial-card {
            padding: 1.5rem;
          }
          .testimonial-card p {
            font-size: 0.95rem;
          }
          .carousel-btn {
            width: 40px;
            height: 40px;
          }
          .carousel-btn svg {
            width: 20px;
            height: 20px;
          }
          .testimonial-carousel-wrapper {
            gap: 0.5rem;
          }
        }
        @media (max-width: 480px) {
          .carousel-btn {
            display: none;
          }
          .testimonial-section {
            padding: 3rem 1rem;
          }
        }
      `;
      document.head.appendChild(style);

      // Insert before footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.before(section);
      } else {
        main.appendChild(section);
      }

      // Initialize carousel functionality
      this.initCarousel();
    },

    initCarousel() {
      const section = this.testimonialSection;
      const carousel = document.getElementById('testimonial-carousel');
      const dotsContainer = document.getElementById('carousel-dots');
      const prevBtn = document.querySelector('.carousel-prev');
      const nextBtn = document.querySelector('.carousel-next');
      const cards = carousel.querySelectorAll('.testimonial-card');
      const totalCards = cards.length;

      let currentIndex = 0;
      let autoPlayInterval = null;

      // Create dots
      for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('div');
        dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }

      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }

      function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) currentIndex = totalCards - 1;
        if (currentIndex >= totalCards) currentIndex = 0;
        updateCarousel();
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      // Event listeners
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });

      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;

      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          resetAutoPlay();
        }
      }

      // Keyboard navigation
      section.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          resetAutoPlay();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          resetAutoPlay();
        }
      });

      // Auto-play
      function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 6000);
      }

      function resetAutoPlay() {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
        }
        startAutoPlay();
      }

      // Pause on hover
      section.addEventListener('mouseenter', () => {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
      });

      section.addEventListener('mouseleave', () => {
        startAutoPlay();
      });

      // Start auto-play
      startAutoPlay();
    }
  };

  // ========================================
  // CONTENT FILTERS
  // ========================================
  
  const ContentFilters = {
    init() {
      this.setupFilters();
    },
    
    setupFilters() {
      const filterContainers = document.querySelectorAll('.content-filters');
      
      filterContainers.forEach(container => {
        const buttons = container.querySelectorAll('.filter-btn');
        const targetGrid = container.nextElementSibling;
        
        if (!targetGrid) return;
        
        const items = targetGrid.querySelectorAll('[data-category]');
        
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filter items
            items.forEach(item => {
              const categories = item.dataset.category?.split(',') || [];
              if (filter === 'all' || categories.includes(filter)) {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.3s ease';
              } else {
                item.style.display = 'none';
              }
            });
          });
        });
      });
    }
  };

  // ========================================
  // IMAGE GALLERY WITH LIGHTBOX
  // ========================================
  
  const ImageGallery = {
    init() {
      this.setupGalleries();
      this.setupLightbox();
    },
    
    setupGalleries() {
      const galleries = document.querySelectorAll('.gallery-grid');
      
      galleries.forEach(gallery => {
        const items = gallery.querySelectorAll('.gallery-item img');
        
        items.forEach(img => {
          const parent = img.closest('.gallery-item');
          if (parent) {
            parent.addEventListener('click', () => {
              this.openLightbox(img.src, img.alt);
            });
          }
        });
      });
    },
    
    setupLightbox() {
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'lightbox';
      this.lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img src="" alt="">
      `;
      document.body.appendChild(this.lightbox);
      
      this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        this.closeLightbox();
      });
      
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.closeLightbox();
        }
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
          this.closeLightbox();
        }
      });
    },
    
    openLightbox(src, alt) {
      this.lightbox.querySelector('img').src = src;
      this.lightbox.querySelector('img').alt = alt;
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    
    closeLightbox() {
      this.lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ========================================
  // ANIMATED PARTICLES
  // ========================================
  
  const AnimatedParticles = {
    init() {
      if (window.innerWidth < 768) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      this.createParticles();
    },
    
    createParticles() {
      const container = document.createElement('div');
      container.className = 'particles-container';
      document.body.prepend(container);
      
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
      }
    }
  };

  // ========================================
  // ACCESSIBILITY ENHANCEMENTS
  // ========================================
  
  const AccessibilityEnhancements = {
    init() {
      this.addSkipLink();
      this.setupTextSizeControls();
    },
    
    addSkipLink() {
      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      document.body.prepend(skipLink);
      
      // Ensure main content has the target ID
      const main = document.querySelector('main, [role="main"]');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    },
    
    setupTextSizeControls() {
      // Create text size controls
      const controls = document.createElement('div');
      controls.className = 'text-size-controls';
      controls.innerHTML = `
        <button class="text-size-btn" data-size="small" aria-label="Small text">A</button>
        <button class="text-size-btn active" data-size="medium" aria-label="Medium text">A</button>
        <button class="text-size-btn" data-size="large" aria-label="Large text">A</button>
      `;
      
      // Style the buttons
      const style = controls.style;
      style.position = 'fixed';
      style.bottom = '5rem';
      style.left = '1.5rem';
      style.zIndex = '1000';
      style.display = 'flex';
      style.gap = '0.25rem';
      
      document.body.appendChild(controls);
      
      // Set up click handlers
      const buttons = controls.querySelectorAll('.text-size-btn');
      const sizes = { small: '0.875', medium: '1', large: '1.125' };
      
      buttons.forEach(btn => {
        btn.style.fontSize = sizes[btn.dataset.size] + 'rem';
        
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          document.documentElement.style.fontSize = sizes[btn.dataset.size] + 'rem';
          localStorage.setItem('text-size', btn.dataset.size);
        });
      });
      
      // Load saved preference
      const savedSize = localStorage.getItem('text-size');
      if (savedSize) {
        const btn = controls.querySelector(`[data-size="${savedSize}"]`);
        if (btn) {
          btn.click();
        }
      }
    }
  };

  // ========================================
  // DYNAMIC SHADOWS
  // ========================================
  
  const DynamicShadows = {
    init() {
      this.elements = document.querySelectorAll('.dynamic-shadow');
      if (this.elements.length === 0) return;
      
      this.setupMouseTracking();
    },
    
    setupMouseTracking() {
      let ticking = false;
      
      document.addEventListener('mousemove', (e) => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              const angleX = (e.clientY - centerY) / 50;
              const angleY = (centerX - e.clientX) / 50;
              
              el.style.setProperty('--shadow-light-x', angleY + 'px');
              el.style.setProperty('--shadow-light-y', -angleX + 'px');
            });
            
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // ========================================
  // RIPPLE EFFECT ON CLICK
  // ========================================
  
  const RippleEffect = {
    init() {
      document.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';
        ripple.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 20px;
          height: 20px;
          background: rgba(37, 99, 235, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: clickRipple 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 99999;
        `;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
      
      // Add animation style
      const style = document.createElement('style');
      style.textContent = `
        @keyframes clickRipple {
          to {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ========================================
  // INITIALIZE ALL ENHANCEMENTS
  // ========================================
  
  document.addEventListener('DOMContentLoaded', () => {
    // Micro-interactions
    CustomCursor.init();
    MagneticButtons.init();
    ParallaxEffects.init();
    Card3DEffects.init();
    RippleEffect.init();
    
    // Visual Polish
    GrainTexture.init();
    AnimatedParticles.init();
    DynamicShadows.init();
    
    // Navigation & Discovery
    EnhancedScrollProgress.init();
    KeyboardShortcuts.init();
    ReadingTimeEstimator.init();
    BreadcrumbNavigation.init();
    RelatedContent.init();
    SocialProof.init();
    ContentFilters.init();
    ImageGallery.init();
    
    // Performance
    SkeletonLoading.init();
    
    // Accessibility
    AccessibilityEnhancements.init();
    
  });

})();
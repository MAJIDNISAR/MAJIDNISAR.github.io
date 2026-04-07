/**
 * Modern Features for Majid Nisar's Website
 * Handles dark mode, reading progress, search, and enhanced interactivity
 */

(function() {
  'use strict';

  // ========================================
  // DARK MODE TOGGLE
  // ========================================
  
  const ThemeManager = {
    init() {
      this.toggle = document.getElementById('theme-toggle');
      this.themeIcon = document.getElementById('theme-icon');
      
      if (!this.toggle) return;
      
      // Load saved theme or default to light
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.setTheme(savedTheme);
      
      // Add event listener
      this.toggle.addEventListener('click', () => this.toggleTheme());
      
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },
    
    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      if (this.themeIcon) {
        this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      
      // Update meta theme-color for mobile browsers
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.content = theme === 'dark' ? '#0C0A09' : '#F5F7FA';
      }
    },
    
    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    }
  };

  // ========================================
  // READING PROGRESS BAR
  // ========================================
  
  const ReadingProgress = {
    init() {
      this.progressBar = document.getElementById('reading-progress');
      if (!this.progressBar) return;
      
      window.addEventListener('scroll', () => this.updateProgress());
      window.addEventListener('resize', () => this.updateProgress());
    },
    
    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      this.progressBar.style.width = Math.min(progress, 100) + '%';
    }
  };

  // ========================================
  // TABLE OF CONTENTS
  // ========================================
  
  const TableOfContents = {
    init() {
      this.toc = document.getElementById('toc-sidebar');
      if (!this.toc) return;
      
      this.headings = document.querySelectorAll('h2, h3, h4, h5, h6');
      if (this.headings.length < 2) {
        this.toc.style.display = 'none';
        return;
      }
      
      this.buildTOC();
      this.setupScrollHighlight();
    },
    
    buildTOC() {
      const tocList = this.toc.querySelector('.toc-list');
      if (!tocList) return;
      
      tocList.innerHTML = '';
      
      this.headings.forEach((heading, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Set ID for linking
        if (!heading.id) {
          heading.id = 'heading-' + index;
        }
        
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        a.className = 'toc-link';
        
        // Indent based on heading level
        const level = parseInt(heading.tagName.charAt(1));
        li.style.paddingLeft = (level - 2) * 12 + 'px';
        
        li.appendChild(a);
        tocList.appendChild(li);
      });
    },
    
    setupScrollHighlight() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Remove active class from all links
            this.toc.querySelectorAll('.toc-link').forEach(link => {
              link.classList.remove('active');
            });
            
            // Add active class to current link
            const activeLink = this.toc.querySelector(`a[href="#${entry.target.id}"]`);
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
      }, {
        rootMargin: '-20% 0% -35% 0%'
      });
      
      this.headings.forEach(heading => {
        observer.observe(heading);
      });
    }
  };

  // ========================================
  // SEARCH FUNCTIONALITY
  // ========================================
  
  const SearchManager = {
    init() {
      this.searchOverlay = document.getElementById('search-overlay');
      this.searchInput = document.getElementById('search-input');
      this.searchResults = document.getElementById('search-results');
      
      if (!this.searchOverlay) return;
      
      this.setupEventListeners();
      this.loadSearchIndex();
    },
    
    setupEventListeners() {
      // Open search
      ['search-trigger', 'nav-search-link'].forEach((id) => {
        document.getElementById(id)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.openSearch();
        });
      });
      
      // Close search
      document.getElementById('search-close')?.addEventListener('click', () => {
        this.closeSearch();
      });

      this.searchOverlay?.addEventListener('click', (e) => {
        if (e.target === this.searchOverlay) {
          this.closeSearch();
        }
      });
      
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.searchOverlay.classList.contains('active')) {
          this.closeSearch();
        }
      });
      
      // Search input
      this.searchInput?.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    },
    
    openSearch() {
      this.searchOverlay.classList.add('active');
      this.searchInput.focus();
      document.body.style.overflow = 'hidden';
    },
    
    closeSearch() {
      this.searchOverlay.classList.remove('active');
      if (this.searchInput) {
        this.searchInput.value = '';
      }
      if (this.searchResults) {
        this.searchResults.innerHTML = '';
      }
      document.body.style.overflow = '';
    },
    
    async loadSearchIndex() {
      // Simple client-side search using page content
      this.searchIndex = [];
      
      // Index all blog posts and pages
      document.querySelectorAll('article, .post-preview').forEach(article => {
        const title = article.querySelector('h1, h2, .post-title')?.textContent || '';
        const content = article.textContent || '';
        const link = article.querySelector('a')?.href || window.location.href;
        
        this.searchIndex.push({
          title: title.trim(),
          content: content.substring(0, 200),
          link: link
        });
      });
    },
    
    performSearch(query) {
      if (!query || query.length < 2) {
        this.searchResults.innerHTML = '';
        return;
      }
      
      const results = this.searchIndex.filter(item => {
        return item.title.toLowerCase().includes(query.toLowerCase()) ||
               item.content.toLowerCase().includes(query.toLowerCase());
      }).slice(0, 5);
      
      this.renderResults(results, query);
    },
    
    renderResults(results, query) {
      if (results.length === 0) {
        this.searchResults.innerHTML = '<p class="search-no-results">No results found</p>';
        return;
      }
      
      const html = results.map(result => `
        <a href="${result.link}" class="search-result-item">
          <h4>${this.highlightMatch(result.title, query)}</h4>
          <p>${this.highlightMatch(result.content, query)}</p>
        </a>
      `).join('');
      
      this.searchResults.innerHTML = html;
    },
    
    highlightMatch(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    }
  };

  // ========================================
  // ANIMATIONS & INTERACTIONS
  // ========================================
  
  const AnimationManager = {
    init() {
      this.setupScrollAnimations();
      this.setupHoverEffects();
      this.setupFormEnhancements();
    },
    
    setupScrollAnimations() {
      const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
      const cardElements = document.querySelectorAll('.card, .project-card, .skill-card');

      if (!('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
        cardElements.forEach((el) => el.classList.add('fade-in-up'));
        return;
      }

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });

      const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      cardElements.forEach((el) => {
        cardObserver.observe(el);
      });
    },
    
    setupHoverEffects() {
      // Add ripple effect to buttons
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
          `;
          
          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        });
      });
    },
    
    setupFormEnhancements() {
      // Newsletter form enhancement
      const newsletterForm = document.getElementById('newsletter-form');
      if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const email = this.querySelector('input[type="email"]').value;
          
          // Simple validation
          if (!email || !email.includes('@')) {
            alert('Please enter a valid email address');
            return;
          }
          
          // Simulate submission
          const btn = this.querySelector('button');
          const originalText = btn.textContent;
          btn.textContent = 'Subscribing...';
          btn.disabled = true;
          
          setTimeout(() => {
            alert('Thank you for subscribing!');
            this.reset();
            btn.textContent = originalText;
            btn.disabled = false;
          }, 1500);
        });
      }
      
      // Contact form enhancement
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);
          
          // Simple validation
          if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields');
            return;
          }
          
          const btn = this.querySelector('button[type="submit"]');
          const originalText = btn.textContent;
          btn.textContent = 'Sending...';
          btn.disabled = true;
          
          setTimeout(() => {
            alert('Thank you for your message! I\'ll get back to you soon.');
            this.reset();
            btn.textContent = originalText;
            btn.disabled = false;
          }, 1500);
        });
      }
    }
  };

  // ========================================
  // COPY CODE FUNCTIONALITY
  // ========================================
  
  const CodeCopyManager = {
    init() {
      document.querySelectorAll('.highlight').forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => this.copyCode(block, copyBtn));
        
        block.style.position = 'relative';
        block.appendChild(copyBtn);
      });
    },
    
    async copyCode(block, btn) {
      const code = block.querySelector('pre').textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        btn.style.background = 'rgba(0, 212, 170, 0.8)';
        
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      }
    }
  };

  // ========================================
  // PERFORMANCE OPTIMIZATIONS
  // ========================================
  
  const PerformanceManager = {
    init() {
      this.setupLazyLoading();
      this.setupImageOptimization();
    },
    
    setupLazyLoading() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    },
    
    setupImageOptimization() {
      // Add loading="lazy" to images
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
    }
  };

  // ========================================
  // RIPPLE ANIMATION CSS
  // ========================================
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .search-no-results {
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      padding: 2rem;
      font-style: italic;
    }
    
    .search-result-item {
      display: block;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-decoration: none;
      color: #fff;
      transition: background 0.2s;
    }
    
    .search-result-item:hover {
      background: rgba(255, 255, 255, 0.1);
      text-decoration: none;
    }
    
    .search-result-item h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    .search-result-item p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .search-result-item mark {
      background: rgba(0, 212, 170, 0.3);
      color: inherit;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // ========================================
  // INITIALIZE ALL FEATURES
  // ========================================
  
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ReadingProgress.init();
    TableOfContents.init();
    SearchManager.init();
    AnimationManager.init();
    CodeCopyManager.init();
    PerformanceManager.init();
    
    console.log('✅ Modern features initialized successfully');
  });

})();

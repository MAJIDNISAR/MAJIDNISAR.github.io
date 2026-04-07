#!/usr/bin/env node

/**
 * LinkedIn Content Sync Script
 * Fetches and syncs content from LinkedIn API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  LINKEDIN_API_BASE: 'https://api.linkedin.com/v2',
  POSTS_DIR: '_posts',
  NEWSLETTERS_DIR: '_newsletter',
  LINKEDIN_DIR: '_linkedin',
  MAX_POSTS: 50,
  MAX_NEWSLETTERS: 20,
};

// LinkedIn API endpoints
const ENDPOINTS = {
  PROFILE: '/people/~:(id,firstName,lastName,headline,summary,positions)',
  POSTS: '/shares?q=owners&owners=urn:li:person:{PERSON_ID}&count=20',
  ARTICLES: '/articles?q=authors&authors=urn:li:person:{PERSON_ID}&count=10',
};

class LinkedInSync {
  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.personId = process.env.LINKEDIN_PERSON_ID;
    
    if (!this.accessToken || !this.personId) {
      console.log('⚠️  LinkedIn credentials not configured. Skipping LinkedIn sync.');
      console.log('   To enable LinkedIn integration, set these environment variables:');
      console.log('   - LINKEDIN_ACCESS_TOKEN');
      console.log('   - LINKEDIN_PERSON_ID');
      console.log('');
      console.log('   For now, all other website features work normally!');
      this.skipSync = true;
      return;
    }
    
    this.skipSync = false;
    this.ensureDirectories();
  }

  ensureDirectories() {
    [CONFIG.POSTS_DIR, CONFIG.NEWSLETTERS_DIR, CONFIG.LINKEDIN_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async fetchLinkedInData(endpoint) {
    return new Promise((resolve, reject) => {
      const url = CONFIG.LINKEDIN_API_BASE + endpoint.replace('{PERSON_ID}', this.personId);
      
      const options = {
        hostname: 'api.linkedin.com',
        path: url.replace('https://api.linkedin.com', ''),
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Failed to parse LinkedIn response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`LinkedIn API request failed: ${error.message}`));
      });

      req.end();
    });
  }

  generateFilename(title, date) {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    const dateStr = date.toISOString().split('T')[0];
    return `${dateStr}-${cleanTitle}.md`;
  }

  createMarkdownContent(post) {
    const { title, content, date, tags = [], coverImg, thumbnailImg } = post;
    
    const frontMatter = {
      layout: 'post',
      title: title,
      subtitle: content.substring(0, 150) + '...',
      date: date.toISOString(),
      'last-updated': date.toISOString(),
      tags: tags,
      'cover-img': coverImg,
      'thumbnail-img': thumbnailImg,
      'share-img': thumbnailImg || coverImg,
      comments: true,
      'social-share': true,
      readtime: true,
      permalink: `/blog/${this.generateFilename(title, date).replace('.md', '')}/`,
    };

    const frontMatterStr = Object.entries(frontMatter)
      .filter(([key, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    return `---
${frontMatterStr}
---

# ${title}

${content}

---

*Originally published on LinkedIn on ${date.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}*

[View on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:${post.id})
`;
  }

  async syncPosts() {
    if (this.skipSync) {
      console.log('✅ LinkedIn posts sync skipped (credentials not configured)');
      return;
    }
    
    try {
      console.log('📥 Fetching LinkedIn posts...');
      const data = await this.fetchLinkedInData(ENDPOINTS.POSTS);
      
      if (!data.elements || data.elements.length === 0) {
        console.log('ℹ️ No posts found');
        return;
      }

      let syncedCount = 0;
      
      for (const post of data.elements.slice(0, CONFIG.MAX_POSTS)) {
        try {
          const postData = {
            id: post.id,
            title: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text?.substring(0, 100) || 'LinkedIn Post',
            content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
            date: new Date(post.created?.time || Date.now()),
            tags: this.extractTags(post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || ''),
            coverImg: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.[0]?.thumbnails?.[0]?.url,
            thumbnailImg: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.[0]?.thumbnails?.[0]?.url,
          };

          const filename = this.generateFilename(postData.title, postData.date);
          const filepath = path.join(CONFIG.POSTS_DIR, filename);
          
          // Check if file already exists
          if (fs.existsSync(filepath)) {
            console.log(`⏭️ Skipping existing post: ${filename}`);
            continue;
          }

          const markdown = this.createMarkdownContent(postData);
          fs.writeFileSync(filepath, markdown);
          
          console.log(`✅ Synced post: ${filename}`);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Failed to sync post ${post.id}:`, error.message);
        }
      }

      console.log(`✅ Synced ${syncedCount} posts from LinkedIn`);
    } catch (error) {
      console.error('❌ Failed to sync posts:', error.message);
      throw error;
    }
  }

  async syncNewsletters() {
    if (this.skipSync) {
      console.log('✅ LinkedIn newsletters sync skipped (credentials not configured)');
      return;
    }
    
    try {
      console.log('📥 Fetching LinkedIn articles...');
      const data = await this.fetchLinkedInData(ENDPOINTS.ARTICLES);
      
      if (!data.elements || data.elements.length === 0) {
        console.log('ℹ️ No articles found');
        return;
      }

      let syncedCount = 0;
      
      for (const article of data.elements.slice(0, CONFIG.MAX_NEWSLETTERS)) {
        try {
          const articleData = {
            id: article.id,
            title: article.title || 'LinkedIn Article',
            content: article.summary || '',
            date: new Date(article.publishedAt || Date.now()),
            tags: this.extractTags(article.summary || ''),
            coverImg: article.thumbnail,
            thumbnailImg: article.thumbnail,
          };

          const filename = this.generateFilename(articleData.title, articleData.date);
          const filepath = path.join(CONFIG.NEWSLETTERS_DIR, filename);
          
          // Check if file already exists
          if (fs.existsSync(filepath)) {
            console.log(`⏭️ Skipping existing article: ${filename}`);
            continue;
          }

          const markdown = this.createMarkdownContent(articleData);
          fs.writeFileSync(filepath, markdown);
          
          console.log(`✅ Synced article: ${filename}`);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Failed to sync article ${article.id}:`, error.message);
        }
      }

      console.log(`✅ Synced ${syncedCount} articles from LinkedIn`);
    } catch (error) {
      console.error('❌ Failed to sync articles:', error.message);
      throw error;
    }
  }

  extractTags(text) {
    const hashtags = text.match(/#(\w+)/g) || [];
    return hashtags.map(tag => tag.substring(1)).slice(0, 5);
  }

  async syncAll() {
    if (this.skipSync) {
      console.log('✅ LinkedIn sync skipped (credentials not configured)');
      return;
    }
    
    console.log('🚀 Starting LinkedIn content sync...');
    
    try {
      await this.syncPosts();
      await this.syncNewsletters();
      console.log('✅ LinkedIn sync completed successfully');
    } catch (error) {
      console.error('❌ LinkedIn sync failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const requestedType = typeArg ? typeArg.split('=')[1] : 'all';
  const syncType = requestedType === 'articles' ? 'newsletters' : requestedType;

  const sync = new LinkedInSync();

  switch (syncType) {
    case 'posts':
      await sync.syncPosts();
      break;
    case 'newsletters':
      await sync.syncNewsletters();
      break;
    case 'all':
    default:
      await sync.syncAll();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LinkedInSync;

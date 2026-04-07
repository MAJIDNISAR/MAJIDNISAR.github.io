#!/usr/bin/env node

/**
 * LinkedIn RSS Content Sync Script
 * Fetches content from LinkedIn via RSS feeds (no API required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  POSTS_DIR: '_posts',
  NEWSLETTERS_DIR: '_newsletter',
  LINKEDIN_DIR: '_linkedin',
  MAX_POSTS: 50,
};

// RSS Feed URL - Set via environment variable
const RSS_FEEDS = {
  LINKEDIN_RSS_URL: process.env.LINKEDIN_RSS_URL || '',
};

class LinkedInRSSSync {
  constructor() {
    this.rssUrl = RSS_FEEDS.LINKEDIN_RSS_URL;
    
    if (!this.rssUrl) {
      console.log('⚠️  LinkedIn RSS URL not configured.');
      console.log('   To enable LinkedIn RSS sync, set this environment variable:');
      console.log('   - LINKEDIN_RSS_URL');
      console.log('');
      console.log('   How to get your LinkedIn RSS feed:');
      console.log('   1. For LinkedIn Newsletters: Go to your newsletter page and look for RSS');
      console.log('   2. Use a third-party service like:');
      console.log('      - https://rss.app (recommended)');
      console.log('      - https://fetchrss.com');
      console.log('      - https://dlvr.it');
      console.log('   3. Create an RSS feed from your LinkedIn profile');
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

  async fetchRSSFeed(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to fetch RSS feed: ${error.message}`));
      });
    });
  }

  parseRSS(xmlContent) {
    const items = [];
    
    // Simple XML parsing for RSS items
    const itemMatches = xmlContent.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (!itemMatches) {
      return items;
    }
    
    itemMatches.forEach(itemXml => {
      const title = this.extractTag(itemXml, 'title');
      const description = this.extractTag(itemXml, 'description');
      const link = this.extractTag(itemXml, 'link');
      const pubDate = this.extractTag(itemXml, 'pubDate');
      const contentEncoded = this.extractTag(itemXml, 'content:encoded') || description;
      
      if (title || description) {
        items.push({
          title: title || 'LinkedIn Post',
          content: contentEncoded || description || '',
          link: link || '',
          date: pubDate ? new Date(pubDate) : new Date(),
          description: description || '',
        });
      }
    });
    
    return items;
  }

  extractTag(xml, tagName) {
    // Handle namespaced tags like content:encoded
    const escapedTag = tagName.replace(':', '\\:');
    const regex = new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)</${escapedTag}>`, 'i');
    const match = xml.match(regex);
    
    if (match && match[1]) {
      return match[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/&/g, '&')
        .replace(/"/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
    
    return null;
  }

  extractTags(text) {
    const hashtags = text.match(/#(\w+)/g) || [];
    return hashtags.map(tag => tag.substring(1)).slice(0, 5);
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
    const { title, content, date, link } = post;
    const tags = this.extractTags(content);
    
    // Extract first image from content if available
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const coverImg = imgMatch ? imgMatch[1] : null;
    
    // Clean HTML content for subtitle
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const frontMatter = {
      layout: 'post',
      title: title,
      subtitle: cleanContent.substring(0, 150) + '...',
      date: date.toISOString(),
      'last-updated': date.toISOString(),
      tags: tags,
      'cover-img': coverImg,
      'thumbnail-img': coverImg,
      'share-img': coverImg,
      comments: true,
      'social-share': true,
      readtime: true,
      'linkedin-link': link,
      permalink: `/blog/${this.generateFilename(title, date).replace('.md', '')}/`,
    };

    const frontMatterStr = Object.entries(frontMatter)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
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

${link ? `[View on LinkedIn](${link})` : ''}
`;
  }

  async syncPosts() {
    if (this.skipSync) {
      console.log('✅ LinkedIn RSS sync skipped (RSS URL not configured)');
      return;
    }
    
    try {
      console.log('📥 Fetching LinkedIn RSS feed...');
      const xmlContent = await this.fetchRSSFeed(this.rssUrl);
      
      const items = this.parseRSS(xmlContent);
      
      if (items.length === 0) {
        console.log('ℹ️ No items found in RSS feed');
        return;
      }

      console.log(`Found ${items.length} items in RSS feed`);
      let syncedCount = 0;
      
      for (const item of items.slice(0, CONFIG.MAX_POSTS)) {
        try {
          const filename = this.generateFilename(item.title, item.date);
          const filepath = path.join(CONFIG.POSTS_DIR, filename);
          
          // Check if file already exists
          if (fs.existsSync(filepath)) {
            console.log(`⏭️ Skipping existing post: ${filename}`);
            continue;
          }

          const markdown = this.createMarkdownContent(item);
          fs.writeFileSync(filepath, markdown);
          
          console.log(`✅ Synced post: ${filename}`);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Failed to sync post "${item.title}":`, error.message);
        }
      }

      console.log(`✅ Synced ${syncedCount} posts from LinkedIn RSS`);
    } catch (error) {
      console.error('❌ Failed to sync RSS feed:', error.message);
      throw error;
    }
  }

  async syncAll() {
    if (this.skipSync) {
      console.log('✅ LinkedIn RSS sync skipped (RSS URL not configured)');
      return;
    }
    
    console.log('🚀 Starting LinkedIn RSS content sync...');
    
    try {
      await this.syncPosts();
      console.log('✅ LinkedIn RSS sync completed successfully');
    } catch (error) {
      console.error('❌ LinkedIn RSS sync failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const sync = new LinkedInRSSSync();
  await sync.syncAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LinkedInRSSSync;
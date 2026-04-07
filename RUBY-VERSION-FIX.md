# 🔧 Ruby Version Fix Guide

## ❌ **Problem**
```
ffi-1.17.4-x86_64-darwin requires ruby version >= 3.0, < 4.1.dev, 
which is incompatible with the current version, ruby 2.6.10p210
```

## ✅ **Solution Options**

### **Option 1: Update Ruby (Recommended)**

#### **Using rbenv (macOS/Linux)**
```bash
# Install rbenv if not already installed
brew install rbenv

# Install Ruby 3.1
rbenv install 3.1.0
rbenv global 3.1.0

# Add to your shell profile
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# Verify version
ruby -v
```

#### **Using rvm (macOS/Linux)**
```bash
# Install rvm if not already installed
\curl -sSL https://get.rvm.io | bash -s stable

# Install Ruby 3.1
rvm install 3.1.0
rvm use 3.1.0 --default

# Verify version
ruby -v
```

#### **Using Homebrew (macOS)**
```bash
# Install Ruby
brew install ruby

# Add to PATH
echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify version
ruby -v
```

---

### **Option 2: Use Older ffi Version**

Edit your `Gemfile` to use an older, compatible version:

```ruby
# Add this to your Gemfile
gem 'ffi', '~> 1.15.0'
```

Then run:
```bash
bundle install
```

---

### **Option 3: Bypass Bundle Install**

If you just want to test the website without updating Ruby:

```bash
# Skip bundle install and use Jekyll directly
gem install jekyll
jekyll serve --livereload --port 4000
```

**Note**: This may not work if other gems have version conflicts.

---

### **Option 4: Use Docker**

Create a `Dockerfile`:
```dockerfile
FROM ruby:3.1-slim

WORKDIR /app
COPY . .

RUN bundle install
EXPOSE 4000

CMD ["jekyll", "serve", "--livereload", "--host", "0.0.0.0"]
```

Run with:
```bash
docker build -t my-jekyll-site .
docker run -p 4000:4000 my-jekyll-site
```

---

## 🎯 **Recommended Steps**

### **For Quick Testing**
1. Try **Option 2** (older ffi version) first
2. If that doesn't work, use **Option 3** (bypass bundle)

### **For Long-term Development**
1. Use **Option 1** (update Ruby) - recommended
2. Or use **Option 4** (Docker) for isolated environment

---

## 🔍 **Check Your Ruby Version**

```bash
# Check current version
ruby -v

# Check which Ruby is being used
which ruby

# Check rbenv versions (if using rbenv)
rbenv versions

# Check rvm versions (if using rvm)
rvm list
```

---

## 📋 **After Fixing Ruby Version**

Once you have Ruby 3.0+ installed:

```bash
# Verify version
ruby -v
# Should show: ruby 3.1.x or higher

# Install dependencies
bundle install

# Start development server
npm run dev
# or
bundle exec jekyll serve --livereload --port 4000

# Open in browser
open http://localhost:4000
```

---

## 🐛 **Troubleshooting**

### **If rbenv/rvm commands not found**
```bash
# For rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# For rvm
source ~/.rvm/scripts/rvm
```

### **If bundle install still fails**
```bash
# Clear bundle cache
rm -rf vendor/bundle
rm Gemfile.lock

# Try again
bundle install
```

### **If Jekyll won't start**
```bash
# Check for port conflicts
lsof -i :4000

# Use different port
bundle exec jekyll serve --port 4001
```

---

## ✅ **Verification**

After fixing, verify everything works:

```bash
# Check Ruby version
ruby -v

# Check bundle install
bundle install

# Start server
bundle exec jekyll serve --livereload --port 4000

# Open browser
open http://localhost:4000
```

---

**Choose the option that works best for your setup! 🚀**
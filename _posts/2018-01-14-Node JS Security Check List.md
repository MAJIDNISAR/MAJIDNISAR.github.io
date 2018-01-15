> # **ELEPHANT in the ROOM**

**Security - the elephant in the room.** Everyone agrees that it is very important but few takes it seriously. 

Most of these items are general and applies to all languages and frameworks not just Node.js - however some of the tools presented are Node.js specific. You should also check our introductory [Node.js security](https://blog.risingstack.com/node-js-security-tips) blogpost, or if you are just getting started with Node.js, our [first chapter of Node Hero](https://blog.risingstack.com/node-hero-tutorial-getting-started-with-node-js/).

## Configuration Management

### Security HTTP Headers

There are some security-related HTTP headers that your site should set. These headers are:

- **Strict-Transport-Security** enforces secure (HTTP over SSL/TLS) connections to the server
- **X-Frame-Options** provides [clickjacking](https://www.owasp.org/index.php/Clickjacking) protection
- **X-XSS-Protection** enables the Cross-site scripting (XSS) filter built into most recent web browsers
- **X-Content-Type-Options** prevents browsers from MIME-sniffing a response away from the declared content-type
- **Content-Security-Policy** prevents a wide range of attacks, including Cross-site scripting and other cross-site injections

In Node.js it is easy to set these using the [Helmet](https://www.npmjs.com/package/helmet) module:

```
var express = require('express');
var helmet = require('helmet');
 
var app = express();
 
app.use(helmet());

```

Helmet is available for [Koa](http://koajs.com/) as well: [koa-helmet](https://www.npmjs.com/package/koa-helmet).

Also, in most architectures these headers can be set in web server configuration (Apache, nginx), without changing actual application's code. In nginx it would look something like this:

```
# nginx.conf

add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'";

```

For a complete example take a look at this [nginx configuration file](https://gist.github.com/plentz/6737338).

If you quickly want to check if your site has all the necessary headers check out this online checker: <http://cyh.herokuapp.com/cyh>.

### Sensitive Data on the Client Side

When deploying front end applications make sure that you never expose API secrets and credentials in your source code, as it will be readable by anyone.

There is no good way to check this automatically, but you have a couple of options to mitigate the risk of accidentally exposing sensitive data on the client side:

- use of pull requests
- regular code reviews

## Authentication

### Brute Force Protection

Brute forcing is the systematically enumerating of all possible candidates a solution and checking whether each candidate satisfies the problem's statement. In web applications a login endpoint can be the perfect candidate for this.

To protect your applications from these kind of attacks you have to implement some kind of rate-limiting. In Node.js you can use the [ratelimiter](https://www.npmjs.com/package/ratelimiter) package.

```
var email = req.body.email;
var limit = new Limiter({ id: email, db: db });

limit.get(function(err, limit) {

});

```

Of course, you can wrap it into a middleware and just drop it into any application. Both Express and Koa has great middlewares for it. In Koa, it may look something like this:

```
var ratelimit = require('koa-ratelimit');
var redis = require('redis');
var koa = require('koa');
var app = koa();

var emailBasedRatelimit = ratelimit({
  db: redis.createClient(),
  duration: 60000,
  max: 10,
  id: function (context) {
    return context.body.email;
  }
});

var ipBasedRatelimit = ratelimit({
  db: redis.createClient(),
  duration: 60000,
  max: 10,
  id: function (context) {
    return context.ip;
  }
});

app.post('/login', ipBasedRatelimit, emailBasedRatelimit, handleLogin);

```

What we did here is that we have limited how many times a user can try to login in a given time window - with this we can mitigate the risk of a successfully brute force attack. *Please note, that these configurations have to be adjusted for each given application - do not directly copy-paste them.*

To test how your services behave in these scenarios you can use [hydra](https://github.com/vanhauser-thc/thc-hydra).

## Session Management

**The importance of secure use of cookies cannot be understated: especially within dynamic web applications, which need to maintain state across a stateless protocol such as HTTP.**

### Cookie Flags

The following is a list of the attributes that can be set for each cookie and what they mean:

- **secure** - this attribute tells the browser to only send the cookie if the request is being sent over HTTPS.
- **HttpOnly** - this attribute is used to help prevent attacks such as cross-site scripting, since it does not allow the cookie to be accessed via JavaScript.

#### Cookie Scope

- **domain** - this attribute is used to compare against the domain of the server in which the URL is being requested. If the domain matches or if it is a sub-domain, then the path attribute will be checked next.
- **path** - in addition to the domain, the URL path that the cookie is valid for can be specified. If the domain and path match, then the cookie will be sent in the request.
- **expires** - this attribute is used to set persistent cookies, since the cookie does not expire until the set date is exceeded

In Node.js you can easily create this cookie using the [cookies](https://www.npmjs.com/package/cookies) package. Again, this is quite low
-level, so you will probably end up using a wrapper, like the [cookie-session](https://www.npmjs.com/package/cookie-session).

```
var cookieSession = require('cookie-session');
var express = require('express');
 
var app = express();
 
app.use(cookieSession({
  name: 'session',
  keys: [
    process.env.COOKIE_KEY1,
    process.env.COOKIE_KEY2
  ]
}));
 
app.use(function (req, res, next) {
  var n = req.session.views || 0;
  req.session.views = n++;
  res.end(n + ' views');
});
 
app.listen(3000);

```

*(The example is taken from the cookie-session module documentation.)*

### CSRF

Cross-Site Request Forgery is an attack that forces a user to execute unwanted actions on a web application in which they're currently logged in. These attacks specifically target state-changing requests, not theft of data, since the attacker has no way to see the response to the forged request.

In Node.js to mitigate this kind of attacks you can use the [csrf](https://www.npmjs.com/package/csrf) module. As it is quite low-level, there are wrappers for different frameworks as well. One example for this is the [csurf](https://www.npmjs.com/package/csurf) module: an express middleware for CSRF protection.

On the route handler level you have to do something like this:

```
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var express = require('express');
 
// setup route middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });
 
// create express app 
var app = express();
 
// we need this because "cookie" is true in csrfProtection 
app.use(cookieParser());
 
app.get('/form', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 
  res.render('send', { csrfToken: req.csrfToken() });
});
 
app.post('/process', parseForm, csrfProtection, function(req, res) {
  res.send('data is being processed');
});

```

While on the view layer you have to use the CSRF token like this:

```
<form action="/process" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  
  Favorite color: <input type="text" name="favoriteColor">
  <button type="submit">Submit</button>
</form>

```

*(The example is taken from the csurf module documentation.)*

## Data Validation

### XSS

Here we have two similar, but different type of attacks to defend against. One being the Reflected version of cross site scripting the other one is the Stored.

**Reflected Cross site scripting** occurs when the attacker injects executable JavaScript code into the HTML response with specially crafted links.

**Stored Cross site scripting** occurs when the application stores user input which is not correctly filtered. It runs within the user’s browser under the privileges of the web application.

**To defend against these kind of attacks make sure that you always filter/sanitize user input.**

### SQL Injection

SQL injection consists of injection of a partial or complete SQL query via user input. It can read sensitive information or be destructive as well.

Take the following example:

```
select title, author from books where id=$id

```

In this example `$id` is coming from the user - what if the user enters `2 or 1=1`? The query becomes the following:

```
select title, author from books where id=2 or 1=1

```

The easiest way to defend against these kind of attacks is to use parameterized queries or prepared statements.

If you are using PostgreSQL from Node.js then you probably using the [node-postgres](https://www.npmjs.com/package/pg) module. To create a parameterized query all you need to do is:

```
var q = 'SELECT name FROM books WHERE id = $1';
client.query(q, ['3'], function(err, result) {});

```

------

[sqlmap](http://sqlmap.org/) is an open source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws and taking over of database servers. Use this tool to test your applications for SQL injection vulnerabilities.

### Command Injection

Command injection is an technique used by an attacker to run OS commands on the remote web server. With this approach an attacker might even get passwords to the system.

In practice, if you have a URL like:

```
https://example.com/downloads?file=user1.txt

```

it could be turn into:

```
https://example.com/downloads?file=%3Bcat%20/etc/passwd

```

In this example `%3B` becomes the semicolon, so multiple OS commands can be run.

**To defend against these kind of attacks make sure that you always filter/sanitize user input.**

------

Also, speaking of Node.js:

```
child_process.exec('ls', function (err, data) {  
    console.log(data);
});

```

Under the hood `child_process.exec` makes a call to execute `/bin/sh`, so it is a bash interpreter and not a program launcher.

This is problematic when user input is passed to this method - can be either a backtick or `$()`, a new command can be injected by the attacker.

To overcome this issue simply use `child_process.execFile`.

## Secure Transmission

### SSL Version, Algorithms, Key length

As HTTP is a clear-text protocol it must be secured via SSL/TLS tunnel, known as HTTPS. Nowadays high grade ciphers are normally used, misconfiguration in the server can be used to force the use of a weak cipher - or at worst no encryption.

You have to test:

- ciphers, keys and renegotiation is properly configured
- certificate validity

Using the tool [nmap](https://nmap.org/) and [sslyze](https://github.com/iSECPartners/sslyze) the job is quite easy.

**Checking for Certificate information**

```
nmap --script ssl-cert,ssl-enum-ciphers -p 443,465,993,995 www.example.com

```

**Testing SSL/TLS vulnerabilities with sslyze**

```
./sslyze.py --regular example.com:443

```

### HSTS

In the configuration management part we touched this briefly - **Strict-Transport-Security** header enforces secure (HTTP over SSL/TLS) connections to the server. Take the following example from Twitter:

```
strict-transport-security:max-age=631138519

```

Here the `max-age` defines the number of seconds that the browser should automatically convert all HTTP requests to HTTPS.

Testing for it is pretty straightforward:

```
curl -s -D- https://twitter.com/ | grep -i Strict

```

## Denial of Service

### Account Lockout

Account lockout is a technique to mitigate brute force guessing attacks. In practice it means that after a small number of unsuccessful login attempts the systems prohibits login attempts for a given period *(initially it can be a couple of minutes, then it can be increased exponentially)*.

You can protect your application against these kind of attacks with the usage of the rate-limiter pattern we touched before.

### Regular Expression

This kind of attack exploits the fact that most Regular Expression implementations may reach extreme situations that cause them to work very slowly. These Regexes are called Evil Regexes:

- Grouping with repetition
- Inside the repeated group
  - Repetition
  - Alternation with overlapping

`([a-zA-Z]+)*`, `(a+)+` or `(a|a?)+` are all vulnerable Regexes as a simple input like `aaaaaaaaaaaaaaaaaaaaaaaa!` can cause heavy computations. For more information on it visit the [Regular expression Denial of Service - ReDoS](https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS).

To check your Regexes against these, you can use a Node.js tool called [safe-regex](https://www.npmjs.com/package/safe-regex). *It may give false-positives, so use it with caution.*

```
$ node safe.js '(beep|boop)*'
true
$ node safe.js '(a+){10}'
false

```

## Error Handling

### Error Codes, Stack Traces

During different error scenarios the application may leak sensitive details about the underlying infrastructure, like: `X-Powered-By:Express`.

Stack traces are not treated as vulnerabilities by themselves, but they often reveal information that can be interesting to an attacker. Providing debugging information as a result of operations that generate errors is considered a bad practice. You should always log them, but do not show them to the users.

## NPM

With great power comes great responsibility - NPM has lots of packages what you can use instantly, but that comes with a cost: you should check what you are requiring to your applications. They may contain security issues that are critical.

### The Node Security Project

Luckily the Node Security project has a great tool that can check your used modules for known vulnerabilities.

```
npm i nsp -g
# either audit the shrinkwrap
nsp audit-shrinkwrap
# or the package.json
nsp audit-package

```

You can also use [requireSafe](https://www.npmjs.com/package/requiresafe) to help you with this.

### Snyk

Snyk is similar to the Node Security Project, but its aim is to provide a tool that can not just detect, but fix security related issues in your codebase.

To give it a try visit [snyk.io](https://snyk.io/)

------

## Final notes & thoughts

This list is heavily influenced and based on the [Web Application Security Testing Cheat Sheet](https://www.owasp.org/index.php/Web_Application_Security_Testing_Cheat_Sheet) maintained by [OWASP](https://www.owasp.org/index.php/Main_Page).

> The Open Web Application Security Project (OWASP) is a worldwide not-for-profit charitable organization focused on improving the security of software

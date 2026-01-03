/**
 * Example Application Server
 * Fundamentals of Web Performance
 *
 * Simple static content server to illustrate the performance impact of HTTP
 * protocol, headers, delays, and compression on the overall user experience of
 * a website.
 */
const express = require("express");
const { resolve } = require("path");
const compression = require("http-compression");

const api = require("./routes/api");
const performanceConfig = require("../performance-config");

const app = express();

/**
 * Log HTTP protocol version for debugging/learning purposes
 */
app.use((req, res, next) => {
  const protocol = req.httpVersion || 'unknown';
  const protocolName = protocol === '2.0' ? 'HTTP/2' : 
                       protocol === '1.1' ? 'HTTP/1.1' : 
                       protocol === '1.0' ? 'HTTP/1.0' : 
                       protocol;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Protocol: ${protocolName} (${protocol})`);
  next();
});

/**
 * Simulating real-world delays for server processing duration and network
 * latency.
 */
app.use((_req, _res, next) => {
  setTimeout(next, performanceConfig.serverDuration);
});

/**
 * Compression of response bodies.
 * @see https://www.npmjs.com/package/http-compression
 */
app.use(compression({
  threshold: 1, // so we can always see it for testing.
  gzip: performanceConfig.enableGzipCompression,
  brotli: performanceConfig.enableBrotliCompression
}));

/**
 * Host the API Routes
 */
app.use("/api", api);

/**
 * Host static assets in the ./public directory
 * @see https://expressjs.com/en/5x/api.html#express.static
 */
app.use(express.static(resolve(__dirname, "..", "public"), {
  extensions: ["html"],
  etag: performanceConfig.enable304CachingHeaders,
  lastModified: performanceConfig.enable304CachingHeaders,
  cacheControl: performanceConfig.enableBrowserCache,
  maxAge: performanceConfig.enableBrowserCache ? 7200000 : 0,
}));

module.exports = app;

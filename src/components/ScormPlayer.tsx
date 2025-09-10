import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

interface ScormPlayerProps {
  packageUrl: string;
  title: string;
  onClose: () => void;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({ packageUrl, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scormContent, setScormContent] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('Loading local test SCORM package...');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadScormPackage();
  }, [packageUrl]);

  const loadScormPackage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress('Loading local test SCORM package...');

      console.log('🧪 Using local test ZIP file');
      
      // Only use local test file
      const localResponse = await fetch('/scorm-packages/Format Quest A Text Formatting Adventure.zip');
      if (!localResponse.ok) {
        throw new Error(`Failed to load local SCORM package: ${localResponse.statusText}`);
      }
      const zipData = await localResponse.arrayBuffer();
      setLoadingProgress('Extracting SCORM package...');

      // Extract the ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipData);
      
      // Find the main HTML file (prioritize story.html, index.html, etc.)
      const htmlFiles = Object.keys(zipContents.files).filter(name => 
        name.endsWith('.html') && !name.includes('/')
      );
      
      console.log('📁 All files in ZIP:', Object.keys(zipContents.files));
      console.log('📄 HTML files found:', htmlFiles);
      
      if (htmlFiles.length === 0) {
        throw new Error('No HTML files found in SCORM package');
      }

      // Prioritize story.html, then index_lms.html, then others
      let mainHtmlFile = htmlFiles.find(name => name === 'story.html') ||
                        htmlFiles.find(name => name === 'index_lms.html') ||
                        htmlFiles.find(name => name === 'index.html') ||
                        htmlFiles[0];
      
      console.log('🎯 Using main HTML file:', mainHtmlFile);
      setLoadingProgress('Processing SCORM content...');

      // Read the main HTML file
      const htmlContent = await zipContents.files[mainHtmlFile].async('text');
      console.log('📄 Original HTML content length:', htmlContent.length);
      console.log('📄 Original HTML preview:', htmlContent.substring(0, 500) + '...');
      
      // Create blob URLs for all files
      const fileMap: { [key: string]: string } = {};
      const promises: Promise<void>[] = [];

      Object.keys(zipContents.files).forEach(fileName => {
        const file = zipContents.files[fileName];
        if (!file.dir) {
          promises.push(
            file.async('blob').then(blob => {
              const blobUrl = URL.createObjectURL(blob);
              fileMap[fileName] = blobUrl;
              console.log('🔗 Created blob URL for:', fileName, '->', blobUrl);
            })
          );
        }
      });

      await Promise.all(promises);
      console.log('🗂️ Total blob URLs created:', Object.keys(fileMap).length);
      setLoadingProgress('Preparing SCORM player...');

      // Replace relative paths with blob URLs in the HTML
      let modifiedHtml = htmlContent;
      let totalReplacements = 0;
      
      Object.entries(fileMap).forEach(([fileName, blobUrl]) => {
        const relativePath = fileName.replace(/^.*\//, '');
        const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace various path patterns - more aggressive approach
        const patterns = [
          // Direct file references
          new RegExp(`["']${escapedPath}["']`, 'gi'),
          // src attributes
          new RegExp(`src=["']([^"']*${escapedPath})["']`, 'gi'),
          // href attributes
          new RegExp(`href=["']([^"']*${escapedPath})["']`, 'gi'),
          // CSS url() functions
          new RegExp(`url\\(["']?([^"')]*${escapedPath})["']?\\)`, 'gi'),
          // JavaScript require/import
          new RegExp(`require\\(["']([^"']*${escapedPath})["']\\)`, 'gi'),
          new RegExp(`import\\s+["']([^"']*${escapedPath})["']`, 'gi'),
          // Webpack-style imports
          new RegExp(`__webpack_require__\\(["']([^"']*${escapedPath})["']\\)`, 'gi'),
          // Relative paths that might be resolved against current URL
          new RegExp(`["']([^"']*${escapedPath})["']`, 'gi'),
          // Unquoted references
          new RegExp(`\\b${escapedPath}\\b`, 'gi')
        ];

        patterns.forEach(pattern => {
          const matches = modifiedHtml.match(pattern);
          if (matches) {
            totalReplacements += matches.length;
            console.log(`🔄 Replacing ${matches.length} instances of: ${relativePath} -> ${blobUrl.substring(0, 50)}...`);
            modifiedHtml = modifiedHtml.replace(pattern, (match, path) => {
              return match.replace(path || relativePath, blobUrl);
            });
          }
        });
      });
      
      console.log(`🔄 Total URL replacements made: ${totalReplacements}`);

      // Get critical CSS and JS files to embed directly with URL fixing
      const criticalFiles = ['html5/lib/stylesheets/desktop.min.css', 'html5/lib/scripts/frame.desktop.min.js'];
      let embeddedStyles = '';
      let embeddedScripts = '';
      
      for (const fileName of criticalFiles) {
        if (fileMap[fileName]) {
          try {
            const file = zip.file(fileName);
            if (file) {
              let content = await file.async('text');
              
              // Fix about:/// URLs in the embedded content
              if (fileName.endsWith('.js')) {
                // Replace about:/// URLs in JavaScript content with more comprehensive patterns
                content = content.replace(/about:\/\/\/([^"'\s\)]+)/g, (match, path) => {
                  const blobUrl = fileMap[path];
                  if (blobUrl) {
                    console.log(`🔧 Fixed embedded JS URL: ${match} -> ${blobUrl}`);
                    return blobUrl;
                  }
                  return match;
                });
                
                // Also replace any remaining about:/// patterns in strings
                content = content.replace(/"about:\/\/\/([^"]+)"/g, (match, path) => {
                  const blobUrl = fileMap[path];
                  if (blobUrl) {
                    console.log(`🔧 Fixed embedded JS string URL: ${match} -> "${blobUrl}"`);
                    return `"${blobUrl}"`;
                  }
                  return match;
                });
                
                content = content.replace(/'about:\/\/\/([^']+)'/g, (match, path) => {
                  const blobUrl = fileMap[path];
                  if (blobUrl) {
                    console.log(`🔧 Fixed embedded JS string URL: ${match} -> '${blobUrl}'`);
                    return `'${blobUrl}'`;
                  }
                  return match;
                });
                
                // Replace relative file paths that might be resolved against current URL
                Object.entries(fileMap).forEach(([fileName, blobUrl]) => {
                  const relativePath = fileName.replace(/^.*\//, '');
                  const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  
                  // Replace quoted relative paths
                  content = content.replace(new RegExp(`"${escapedPath}"`, 'g'), `"${blobUrl}"`);
                  content = content.replace(new RegExp(`'${escapedPath}'`, 'g'), `'${blobUrl}'`);
                  
                  // Replace unquoted relative paths (be careful with this one)
                  content = content.replace(new RegExp(`\\b${escapedPath}\\b`, 'g'), `"${blobUrl}"`);
                });
              }
              
              if (fileName.endsWith('.css')) {
                embeddedStyles += `<style>${content}</style>`;
                console.log(`📄 Embedded CSS: ${fileName}`);
              } else if (fileName.endsWith('.js')) {
                // Wrap the embedded JavaScript with URL fixing
                const wrappedContent = `
                  (function() {
                    const fileMap = ${JSON.stringify(fileMap)};
                    function fixUrl(url) {
                      if (url && url.startsWith('about:///')) {
                        const path = url.replace('about:///', '');
                        const blobUrl = fileMap[path];
                        if (blobUrl) {
                          console.log('🔧 Fixed embedded script URL:', url, '->', blobUrl);
                          return blobUrl;
                        }
                      }
                      return url;
                    }
                    
                    // Override webpack require in this script's context
                    if (typeof __webpack_require__ !== 'undefined') {
                      const originalWebpackRequire = __webpack_require__;
                      __webpack_require__ = function(id) {
                        const fixedId = fixUrl(id);
                        return originalWebpackRequire.call(this, fixedId);
                      };
                    }
                    
                    // Override fetch in this script's context
                    if (typeof fetch !== 'undefined') {
                      const originalFetch = fetch;
                      window.fetch = function(url, options) {
                        const fixedUrl = fixUrl(url);
                        return originalFetch.call(this, fixedUrl, options);
                      };
                    }
                    
                    // Execute the original script content
                    ${content}
                  })();
                `;
                embeddedScripts += `<script>${wrappedContent}</script>`;
                console.log(`📄 Embedded JS: ${fileName}`);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Could not embed ${fileName}:`, error);
          }
        }
      }

      // Add SCORM API simulation and URL fixing
      const scormApiScript = `
        <script>
          // URL fixing script - MUST run first, before any other scripts
          const fileMap = ${JSON.stringify(fileMap)};
          
          function fixUrl(url) {
            if (url.startsWith('about:///')) {
              const path = url.replace('about:///', '');
              const blobUrl = fileMap[path];
              if (blobUrl) {
                console.log('🔧 Fixed URL:', url, '->', blobUrl);
                return blobUrl;
              }
            }
            return url;
          }
          
          // Override fetch IMMEDIATELY
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            const fixedUrl = fixUrl(url);
            return originalFetch.call(this, fixedUrl, options);
          };
          
          // Override XMLHttpRequest IMMEDIATELY
          const originalXHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...args) {
            const fixedUrl = fixUrl(url);
            return originalXHROpen.call(this, method, fixedUrl, ...args);
          };
          
          // Override webpack require IMMEDIATELY
          if (window.__webpack_require__) {
            const originalWebpackRequire = window.__webpack_require__;
            window.__webpack_require__ = function(id) {
              const fixedId = fixUrl(id);
              return originalWebpackRequire.call(this, fixedId);
            };
          }
          
          // Override document.createElement to intercept script and link tags
          const originalCreateElement = document.createElement;
          document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
              const originalSetAttribute = element.setAttribute;
              element.setAttribute = function(name, value) {
                if ((name === 'src' || name === 'href') && typeof value === 'string') {
                  const fixedValue = fixUrl(value);
                  return originalSetAttribute.call(this, name, fixedValue);
                }
                return originalSetAttribute.call(this, name, value);
              };
            }
            return element;
          };
          
          // SCORM API Simulation
          window.API_1484_11 = {
            Initialize: function(param) { return "true"; },
            GetValue: function(element) { return ""; },
            SetValue: function(element, value) { return "true"; },
            Commit: function(param) { return "true"; },
            GetLastError: function() { return "0"; },
            GetErrorString: function(errorCode) { return "No Error"; },
            GetDiagnostic: function(errorCode) { return "No Error"; },
            Terminate: function(param) { return "true"; }
          };
          window.API = window.API_1484_11;
          
          console.log('✅ URL fixing script loaded and active');
        </script>
      `;
      
      // Add a script that runs IMMEDIATELY to prevent webpack errors
      const immediateFixScript = `
        <script>
          // This script runs IMMEDIATELY to prevent webpack errors
          (function() {
            const fileMap = ${JSON.stringify(fileMap)};
            
            function fixUrl(url) {
              if (url.startsWith('about:///')) {
                const path = url.replace('about:///', '');
                const blobUrl = fileMap[path];
                if (blobUrl) {
                  console.log('🔧 IMMEDIATE Fix URL:', url, '->', blobUrl);
                  return blobUrl;
                }
              }
              return url;
            }
            
            // Override webpack require IMMEDIATELY
            if (window.__webpack_require__) {
              const originalWebpackRequire = window.__webpack_require__;
              window.__webpack_require__ = function(id) {
                // Fix the ID before passing to webpack
                const fixedId = fixUrl(id);
                console.log('🔧 Webpack require:', id, '->', fixedId);
                return originalWebpackRequire.call(this, fixedId);
              };
            }
            
            // Override dynamic import to fix about:/// URLs
            if (window.import) {
              const originalImport = window.import;
              window.import = function(url) {
                const fixedUrl = fixUrl(url);
                console.log('🔧 Dynamic import:', url, '->', fixedUrl);
                return originalImport.call(this, fixedUrl);
              };
            }
            
            // Override webpack module loading to prevent about:/// URLs
            if (window.__webpack_modules__) {
              const originalModules = window.__webpack_modules__;
              window.__webpack_modules__ = new Proxy(originalModules, {
                get: function(target, prop) {
                  const module = target[prop];
                  if (typeof module === 'function') {
                    return function(...args) {
                      // Fix any about:/// URLs in the module arguments
                      const fixedArgs = args.map(arg => {
                        if (typeof arg === 'string' && arg.startsWith('about:///')) {
                          return fixUrl(arg);
                        }
                        return arg;
                      });
                      return module.apply(this, fixedArgs);
                    };
                  }
                  return module;
                }
              });
            }
            
            // Override fetch IMMEDIATELY
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              const fixedUrl = fixUrl(url);
              return originalFetch.call(this, fixedUrl, options);
            };
            
            // Override XMLHttpRequest IMMEDIATELY
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
              const fixedUrl = fixUrl(url);
              return originalXHROpen.call(this, method, fixedUrl, ...args);
            };
            
            // Override document.createElement to intercept script and link tags
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
              const element = originalCreateElement.call(this, tagName);
              if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                  if ((name === 'src' || name === 'href') && typeof value === 'string') {
                    const fixedValue = fixUrl(value);
                    console.log('🔧 Fixed element attribute:', name, value, '->', fixedValue);
                    return originalSetAttribute.call(this, name, fixedValue);
                  }
                  return originalSetAttribute.call(this, name, value);
                };
                
                // Also override direct property setting
                const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
                const originalHrefSetter = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href')?.set;
                
                if (tagName.toLowerCase() === 'script' && originalSrcSetter) {
                  Object.defineProperty(element, 'src', {
                    set: function(value) {
                      const fixedValue = fixUrl(value);
                      console.log('🔧 Fixed script src property:', value, '->', fixedValue);
                      return originalSrcSetter.call(this, fixedValue);
                    },
                    get: function() { return this.getAttribute('src'); }
                  });
                }
                
                if (tagName.toLowerCase() === 'link' && originalHrefSetter) {
                  Object.defineProperty(element, 'href', {
                    set: function(value) {
                      const fixedValue = fixUrl(value);
                      console.log('🔧 Fixed link href property:', value, '->', fixedValue);
                      return originalHrefSetter.call(this, fixedValue);
                    },
                    get: function() { return this.getAttribute('href'); }
                  });
                }
              }
              return element;
            };
            
            console.log('✅ IMMEDIATE URL fixing script loaded');
          })();
        </script>
      `;
      
      // Insert immediate fix script at the very beginning of the head
      modifiedHtml = modifiedHtml.replace('<head>', '<head>' + immediateFixScript);
      
      // Insert embedded styles and scripts before the closing head tag
      const headInsertion = embeddedStyles + embeddedScripts + scormApiScript;
      modifiedHtml = modifiedHtml.replace('</head>', headInsertion + '</head>');
      
      console.log('📄 Final HTML content length:', modifiedHtml.length);
      console.log('📄 HTML preview:', modifiedHtml.substring(0, 500) + '...');
      
      setScormContent(modifiedHtml);
      setLoadingProgress('SCORM content ready!');
      setIsLoading(false);

    } catch (err) {
      console.error('Error loading SCORM package:', err);
      setError(err instanceof Error ? err.message : 'Failed to load SCORM package');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = packageUrl;
    link.download = `${title}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">SCORM Player Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-red-600 mb-4">{error}</div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">SCORM Activity</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                loadScormPackage();
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md"
              title="Reload Local Test ZIP File"
            >
              🧪 Reload Test
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Download SCORM Package"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{loadingProgress}</p>
              </div>
            </div>
          ) : scormContent ? (
            <iframe
              ref={iframeRef}
              srcDoc={scormContent}
              className="w-full h-full border-0"
              title={`SCORM Content: ${title}`}
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture; microphone; camera; geolocation"
              referrerPolicy="no-referrer-when-downgrade"
              loading="eager"
              onLoad={() => {
                console.log('✅ SCORM iframe loaded successfully');
                setIsLoading(false);
              }}
              onError={(e) => {
                console.error('❌ SCORM iframe failed to load:', e);
                setError('Failed to load SCORM content in iframe');
                setIsLoading(false);
              }}
            />
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {scormContent ? 'SCORM content loaded successfully' : loadingProgress}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScormPlayer;
import { createHighlighter } from 'shiki/bundle/web';

let _highlighter: any;

export async function shiki() {
  if (_highlighter) return _highlighter;
  
  try {
    _highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript', 'typescript', 'tsx', 'jsx', 'python', 'bash', 'json', 'yaml', 'toml',
        'java', 'c', 'cpp', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'sql', 'diff',
        'markdown', 'ini', 'dockerfile', 'powershell', 'html', 'css', 'scss', 'xml',
        'sh', 'shell', 'zsh', 'fish', 'batch', 'cmd', 'ps1', 'psm1', 'psd1',
        'r', 'scala', 'haskell', 'ocaml', 'fsharp', 'clojure', 'lisp', 'scheme',
        'perl', 'lua', 'dart', 'elm', 'coffeescript', 'julia', 'matlab',
        'vb', 'vbnet', 'csharp', 'aspnet', 'razor', 'cshtml', 'vbhtml',
        'groovy', 'gradle', 'maven', 'ant', 'makefile', 'cmake', 'ninja',
        'docker', 'dockerfile', 'docker-compose', 'kubernetes', 'helm',
        'terraform', 'hcl', 'pulumi', 'ansible', 'yml',
        'nginx', 'apache', 'htaccess', 'htpasswd', 'conf', 'config',
        'gitignore', 'gitattributes', 'gitmodules', 'gitconfig',
        'npmrc', 'yarnrc', 'bowerrc', 'editorconfig', 'eslintrc',
        'prettierrc', 'babelrc', 'webpack', 'rollup', 'vite', 'jest',
        'mocha', 'chai', 'karma', 'protractor', 'cypress', 'playwright',
        'selenium', 'appium', 'robot', 'gherkin', 'cucumber', 'behave',
        'rspec', 'junit', 'testng', 'nunit', 'xunit', 'mstest',
        'pytest', 'unittest', 'doctest', 'nose', 'tox', 'coverage',
        'istanbul', 'nyc', 'lcov', 'sonar', 'codecov', 'coveralls'
      ]
    });
  } catch (error) {
    console.warn('Failed to create Shiki highlighter with full language support:', error);
    // Fallback to basic languages
    _highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'bash', 'json', 'yaml', 'html', 'css']
    });
  }
  
  return _highlighter;
}

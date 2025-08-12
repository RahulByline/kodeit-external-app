export const templates: Record<string, string> = {
  python: `# Python Online Compiler for free
# Write, Edit and Run your Python code using Python Online Compiler

print("Hello, World!")

# You can add more code here
name = input("Enter your name: ")
print(f"Welcome to Python programming, {name}!")`,

  javascript: `// JavaScript Online Compiler for free  
// Write, Edit and Run your JavaScript code using JS Online Compiler

console.log("Hello, World!");

// You can add more code here
const name = "Student";
console.log(\`Welcome to JavaScript programming, \${name}!\`);

// Simple calculation example
const a = 10;
const b = 5;
console.log(\`\${a} + \${b} = \${a + b}\`);
console.log(\`\${a} - \${b} = \${a - b}\`);
console.log(\`\${a} * \${b} = \${a * b}\`);
console.log(\`\${a} / \${b} = \${a / b}\`);

// Array example
const fruits = ["Apple", "Banana", "Orange"];
console.log("My favorite fruits:", fruits);
console.log("First fruit:", fruits[0]);

// Function example
function greet(name) {
    return \`Hello, \${name}! How are you today?\`;
}

console.log(greet("Friend"));`,

  c: `// C Online Compiler for free
// Write, Edit and Run your C code using C Online Compiler

#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // You can add more code here
    char name[100];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Welcome to C programming, %s!\\n", name);
    
    return 0;
}`,

  cpp: `// C++ Online Compiler for free
// Write, Edit and Run your C++ code using C++ Online Compiler

#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // You can add more code here
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Welcome to C++ programming, " << name << "!" << endl;
    
    return 0;
}`,

  java: `// Java Online Compiler for free
// Write, Edit and Run your Java code using Java Online Compiler

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // You can add more code here
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Welcome to Java programming, " + name + "!");
        
        scanner.close();
    }
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Hello, World!</h2>
            <p>This is a sample HTML page. Edit the HTML and CSS to see live changes in the preview.</p>
            
            <div class="card">
                <h3>Featured Content</h3>
                <p>This is a featured content card with some sample text.</p>
                <button class="btn">Learn More</button>
            </div>
        </section>
        
        <section id="about">
            <h2>About Us</h2>
            <p>We are passionate about creating amazing web experiences.</p>
        </section>
        
        <section id="contact">
            <h2>Contact Us</h2>
            <form>
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn">Send Message</button>
            </form>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>`,

  css: `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

/* Header styles */
header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

header h1 {
    color: #667eea;
    margin-bottom: 0.5rem;
    font-size: 2rem;
    font-weight: 700;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
}

nav a {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    transition: color 0.3s ease;
}

nav a:hover {
    color: #667eea;
}

/* Main content */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    background: rgba(255, 255, 255, 0.95);
    margin: 2rem 0;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

h2 {
    color: #667eea;
    margin-bottom: 1rem;
    font-size: 1.8rem;
    font-weight: 600;
}

p {
    margin-bottom: 1rem;
    color: #555;
}

/* Card styles */
.card {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    margin: 1rem 0;
}

.card h3 {
    color: #495057;
    margin-bottom: 0.5rem;
}

/* Button styles */
.btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Form styles */
.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
}

input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Footer styles */
footer {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
    nav ul {
        flex-direction: column;
        gap: 1rem;
    }
    
    main {
        padding: 1rem;
    }
    
    section {
        padding: 1.5rem;
    }
}`
};

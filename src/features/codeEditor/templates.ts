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
const name = prompt("Enter your name:");
console.log(\`Welcome to JavaScript programming, \${name}!\`);`,

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
}`
};

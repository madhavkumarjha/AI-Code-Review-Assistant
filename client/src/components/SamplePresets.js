export const SAMPLE_PRESETS = [
  {
    id: 'buggy-js-fetch',
    name: '🐛 Buggy Async JS',
    language: 'JavaScript',
    description: 'Fetch API without error handling or response validation',
    code: `function fetchUserData(userId) {
  // Line 2: Missing error handling & async/await
  fetch('/api/users/' + userId)
    .then(res => res.json())
    .then(data => {
      // Potential null pointer if data.profile is missing
      document.getElementById('username').innerText = data.profile.name;
      console.log('User loaded', data);
    });
}`
  },
  {
    id: 'inefficient-python',
    name: '⚡ Slow Python Loop',
    language: 'Python',
    description: 'N^2 quadratic lookup & unhandled file operations',
    code: `def find_matching_records(list_a, list_b):
    # Inefficient O(N^2) double loop
    results = []
    for item_a in list_a:
        for item_b in list_b:
            if item_a['id'] == item_b['id']:
                results.append(item_a)
                
    # Unclosed file handle
    f = open('output.txt', 'w')
    f.write(str(results))
    return results`
  },
  {
    id: 'security-vulnerable-sql',
    name: '🔒 SQL / XSS Risk',
    language: 'JavaScript',
    description: 'SQL Injection vulnerability & dangerous innerHTML usage',
    code: `app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // CRITICAL: Unsanitized raw SQL query string concatenation
  const query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
  
  db.query(query, (err, result) => {
    if (result.length > 0) {
      // Vulnerable to XSS
      document.body.innerHTML = "<h1>Welcome " + username + "</h1>";
    }
  });
});`
  },
  {
    id: 'cpp-memory-leak',
    name: '💻 C++ Memory Leak',
    language: 'C++',
    description: 'Raw pointer allocation without delete',
    code: `#include <iostream>

void processBuffer(int size) {
    // Memory leak: allocated on heap without delete[]
    int* buffer = new int[size];
    for(int i = 0; i < size; i++) {
        buffer[i] = i * 2;
    }
    
    if (size > 100) {
        // Early exit returns without freeing memory!
        return;
    }
    
    std::cout << "Done" << std::endl;
}`
  }
];

import React, { useEffect, useState } from 'react';

function GitHubRepos() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch('https://api.github.com/users/manu4793/repos')
      .then((res) => res.json())
      .then((data) => setRepos(data))
      .catch((error) => console.error('Error fetching repos:', error));
  }, []);

  return (
    <div>
      <h2>My GitHub Projects</h2>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
            <p>{repo.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GitHubRepos;

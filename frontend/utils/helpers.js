async function loadComponent(id, file) {
  try {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(file);
    if (!res.ok) throw new Error('Component not found: ' + file);
    const html = await res.text();
    el.innerHTML = html;
    // Run any inline scripts in the component
    el.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    });
  } catch(e) {
    console.error('loadComponent error:', file, e);
  }
}

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
}

function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

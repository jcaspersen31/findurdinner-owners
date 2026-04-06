export function getToken() {
  return localStorage.getItem('ownerToken')
}

export function setToken(token) {
  localStorage.setItem('ownerToken', token)
}

export function clearToken() {
  localStorage.removeItem('ownerToken')
}

export function isLoggedIn() {
  return !!getToken()
}

export function getOwner() {
  const raw = localStorage.getItem('ownerData')
  return raw ? JSON.parse(raw) : null
}

export function setOwner(owner) {
  localStorage.setItem('ownerData', JSON.stringify(owner))
}
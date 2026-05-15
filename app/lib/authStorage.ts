const accessTokenKey = "accessToken";
const currentUserKey = "currentUser";
const rememberLoginKey = "autoLogin";

type StoredUser = {
  id: number;
  username: string;
  name: string;
  email: string;
};

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

export function getAccessToken() {
  const currentWindow = getWindow();
  if (!currentWindow) {
    return "";
  }

  return (
    currentWindow.sessionStorage.getItem(accessTokenKey) ||
    currentWindow.localStorage.getItem(accessTokenKey) ||
    ""
  );
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function storeAuthSession(accessToken: string, user: StoredUser, rememberLogin = false) {
  const currentWindow = getWindow();
  if (!currentWindow) {
    return;
  }

  clearAuthSession();
  const storage = rememberLogin ? currentWindow.localStorage : currentWindow.sessionStorage;
  storage.setItem(accessTokenKey, accessToken);
  storage.setItem(currentUserKey, JSON.stringify(user));

  if (rememberLogin) {
    currentWindow.localStorage.setItem(rememberLoginKey, "true");
  }
}

export function clearAuthSession() {
  const currentWindow = getWindow();
  if (!currentWindow) {
    return;
  }

  for (const storage of [currentWindow.localStorage, currentWindow.sessionStorage]) {
    storage.removeItem(accessTokenKey);
    storage.removeItem(currentUserKey);
  }
  currentWindow.localStorage.removeItem(rememberLoginKey);
}

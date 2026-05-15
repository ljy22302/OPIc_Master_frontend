import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { hasAccessToken } from "../lib/authStorage";

export function AuthGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = hasAccessToken();

  useEffect(() => {
    if (authenticated) {
      return;
    }

    window.alert("로그인이 필요한 페이지입니다. 로그인 후 이용해 주세요.");
    navigate("/", {
      replace: true,
      state: { from: `${location.pathname}${location.search}` },
    });
  }, [authenticated, location.pathname, location.search, navigate]);

  if (!authenticated) {
    return null;
  }

  return <Outlet />;
}

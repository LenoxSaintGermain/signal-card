export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Redirect to server-side OAuth start so state is validated server-side.
export const getLoginUrl = () => "/api/oauth/start";
